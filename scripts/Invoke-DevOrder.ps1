# Windows PowerShell 5.1 or PowerShell 7. Run from any working directory.
param([int]$MongoPort = 27019, [int]$ApiPort = 18000, [int]$WebPort = 13000, [switch]$SkipInstall)
$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$backend = Join-Path $repo 'backend'
$frontend = Join-Path $repo 'frontend'
$python = Join-Path $repo '.venv\Scripts\python.exe'
$container = "hog-island-dev-order-$PID"
$logs = Join-Path $env:TEMP $container
$apiProcess = $null
$webProcess = $null
$mongoStarted = $false
$report = [ordered]@{ started = (Get-Date).ToString('o'); checks = [ordered]@{}; manual = [ordered]@{} }

function Assert-True([bool]$ok, [string]$name) {
    if (-not $ok) { throw "$name failed. Logs: $logs" }
    Write-Host "PASS $name" -ForegroundColor Green
}
function Wait-Page([string]$url) {
    $lastFailure = 'No response received'
    for ($i = 0; $i -lt 60; $i++) {
        try {
            # History fallback serves deep links only when the request accepts HTML.
            $r = Invoke-WebRequest -Uri $url -Headers @{ Accept = 'text/html' } -UseBasicParsing -TimeoutSec 3
            if ($r.StatusCode -eq 200) { return $r }
            $lastFailure = "HTTP $($r.StatusCode)"
        } catch {
            $lastFailure = $_.Exception.Message
        }
        Start-Sleep -Seconds 1
    }
    throw "Timed out waiting for $url ($lastFailure). Logs: $logs"
}

try {
    New-Item -ItemType Directory -Force -Path $logs | Out-Null
    foreach ($tool in @('python', 'corepack', 'docker')) {
        Assert-True ([bool](Get-Command $tool -ErrorAction SilentlyContinue)) "$tool available"
    }
    docker info *> $null
    Assert-True ($LASTEXITCODE -eq 0) 'Docker Desktop running'
    if (-not $SkipInstall) {
        if (-not (Test-Path $python)) {
            python -m venv (Join-Path $repo '.venv')
            Assert-True ($LASTEXITCODE -eq 0) 'Python environment created'
        }
        & $python -m pip install -r (Join-Path $backend 'requirements-smoke.txt')
        Assert-True ($LASTEXITCODE -eq 0) 'Backend runtime packages installed'
        Push-Location $frontend
        try {
            corepack yarn install --no-lockfile
            Assert-True ($LASTEXITCODE -eq 0) 'Frontend packages installed'
        } finally { Pop-Location }
    }
    Assert-True (Test-Path $python) 'Python environment present'
    Assert-True (Test-Path (Join-Path $frontend 'node_modules')) 'Frontend modules present'
    $report.checks.dependencies = 'pass'

    docker run --rm -d --name $container -p "127.0.0.1:${MongoPort}:27017" mongo:7 | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) 'Isolated MongoDB started'
    $mongoStarted = $true
    $mongoReady = $false
    for ($i = 0; $i -lt 60; $i++) {
        # mongosh can write a connection error before MongoDB finishes starting.
        # Under Windows PowerShell 5.1, redirected native stderr may throw when
        # ErrorActionPreference is Stop; an early refusal must be retried.
        $mongoPingExit = 1
        try {
            docker exec $container mongosh --quiet --eval 'db.adminCommand({ping:1}).ok' *> $null
            $mongoPingExit = $LASTEXITCODE
        } catch {
            $mongoPingExit = 1
        }
        if ($mongoPingExit -eq 0) { $mongoReady = $true; break }
        Start-Sleep -Seconds 1
    }
    Assert-True $mongoReady 'MongoDB ready'
    $env:MONGO_URL = "mongodb://127.0.0.1:$MongoPort"
    $env:DB_NAME = "hog_island_dev_order_$PID"
    $env:REACT_APP_BACKEND_URL = "http://127.0.0.1:$ApiPort"
    $env:PORT = "$WebPort"
    $env:BROWSER = 'none'

    $apiArgs = @('-m', 'uvicorn', 'server:app', '--host', '127.0.0.1', '--port', "$ApiPort")
    $apiProcess = Start-Process -FilePath $python -WorkingDirectory $backend -ArgumentList $apiArgs -PassThru -RedirectStandardOutput (Join-Path $logs 'api.out.log') -RedirectStandardError (Join-Path $logs 'api.err.log')
    $api = "http://127.0.0.1:$ApiPort/api"
    Wait-Page "$api/" | Out-Null
    $guest = Invoke-RestMethod -Method Post -Uri "$api/auth/guest" -ContentType 'application/json' -Body (@{ name = 'Integration Hunter' } | ConvertTo-Json)
    Assert-True ([bool]$guest.id) 'Guest login'
    $score = Invoke-RestMethod -Method Post -Uri "$api/scores" -ContentType 'application/json' -Body (@{ player_id = $guest.id; name = $guest.name; score = 900; kills = 2; wave = 1; survival_time = 30 } | ConvertTo-Json)
    Assert-True ($score.score.score -eq 900) 'Hunt score persisted'
    $board = @(Invoke-RestMethod -Uri "$api/leaderboard")
    Assert-True (@($board | Where-Object { $_.player_id -eq $guest.id }).Count -eq 1) 'Hunt leaderboard'
    $progress = Invoke-RestMethod -Uri "$api/booth/progress/$($guest.id)"
    Assert-True ($progress.unlocked_level -eq 1) 'Booth initial progress'
    $result = Invoke-RestMethod -Method Post -Uri "$api/booth/results" -ContentType 'application/json' -Body (@{ player_id = $guest.id; name = $guest.name; level = 1; caliber = 'r223'; hits = 10; shots = 20; score = 1000 } | ConvertTo-Json)
    Assert-True ($result.unlocked_level -eq 2) 'Booth unlock'
    $boothBoard = @(Invoke-RestMethod -Uri "$api/booth/leaderboard?level=1")
    Assert-True (@($boothBoard | Where-Object { $_.player_id -eq $guest.id }).Count -eq 1) 'Booth leaderboard'
    $report.checks.api = 'pass'

    Push-Location $frontend
    try {
        corepack yarn build
        Assert-True ($LASTEXITCODE -eq 0) 'Frontend production build'
    } finally { Pop-Location }
    $report.checks.build = 'pass'

    $webProcess = Start-Process -FilePath 'cmd.exe' -WorkingDirectory $frontend -ArgumentList @('/c', 'corepack yarn start') -PassThru -RedirectStandardOutput (Join-Path $logs 'web.out.log') -RedirectStandardError (Join-Path $logs 'web.err.log')
    $web = "http://127.0.0.1:$WebPort"
    foreach ($route in @('/', '/menu', '/practice', '/hunt', '/booth', '/booth/play/1/r223', '/leaderboard', '/lore', '/gameover')) {
        $page = Wait-Page "$web$route"
        Assert-True ($page.Content -match '<div id="root"') "SPA entry point $route"
    }
    $report.checks.routes = 'pass'
    Write-Host 'Manual browser gate: play all three modes; check hits, pause, ammo, XP, booth unlock, scores and local progress.' -ForegroundColor Cyan
    Write-Host 'Refresh and use Back/Forward on every route; test an invalid booth URL and /gameover refresh.'
    Write-Host 'Performance recording is deferred to HI-DEV-002; it is not required for this integration run.'
    Start-Process "$web/practice" | Out-Null
    $report.manual.browser = Read-Host 'Browser gameplay and routes (pass/fail/pending)'
    $report.manual.notes = Read-Host 'Findings or pending'
    $report.checks.browser = $report.manual.browser
    $report.checks.performance = 'deferred to HI-DEV-002'
    if ($report.manual.browser -ne 'pass') {
        throw 'Manual browser gate is incomplete; review the report before merge.'
    }
} catch {
    $report.error = $_.Exception.Message
    Write-Host "FAIL $($report.error)" -ForegroundColor Red
    foreach ($name in @('api.err.log', 'api.out.log', 'web.err.log', 'web.out.log')) {
        $logPath = Join-Path $logs $name
        if (Test-Path $logPath) {
            Write-Host "Recent $name output:"
            Get-Content $logPath -Tail 40 -ErrorAction SilentlyContinue | ForEach-Object { Write-Host $_ }
        }
    }
} finally {
    $report.finished = (Get-Date).ToString('o')
    $reportPath = Join-Path $logs 'report.json'
    $report | ConvertTo-Json -Depth 8 | Set-Content -Path $reportPath -Encoding UTF8
    Write-Host "Report: $reportPath"
    foreach ($p in @($webProcess, $apiProcess)) {
        if ($null -ne $p) {
            # A crashed child is already gone; cleanup must not hide the original failure.
            try { taskkill /PID $p.Id /T /F *> $null } catch {}
        }
    }
    if ($mongoStarted) { try { docker rm -f $container *> $null } catch {} }
}
if ($report.error) { exit 1 }
