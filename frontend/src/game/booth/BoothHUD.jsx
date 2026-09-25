import React from "react";
import { Crosshair, Wind, Target, Play, LogOut, Volume2, VolumeX, RotateCcw, ArrowRight, Home, Loader2, Trophy, Lock, Unlock, ChevronUp, ChevronDown } from "lucide-react";
import { BOOTH_TARGETS } from "./levels";

function MilDotReticle({ fov }) {
  const H = window.innerHeight;
  const pxPerMil = (H / 2 / Math.tan((fov / 2) * (Math.PI / 180))) / 1000;
  const mils = Array.from({ length: 12 }, (_, i) => i - 6).filter((m) => m !== 0);
  const size = Math.min(window.innerWidth, H) * 0.7;
  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%,-50%)" }} data-testid="mildot-reticle">
      <div className="relative" style={{ width: size, height: size }}>
        <div className="absolute rounded-full border-2 border-black/80" style={{ inset: 0, boxShadow: "0 0 0 2000px rgba(0,0,0,0.92)" }} />
        <div className="absolute bg-black" style={{ left: 0, right: 0, top: size / 2 - 1, height: 2 }} />
        <div className="absolute bg-black" style={{ top: 0, bottom: 0, left: size / 2 - 1, width: 2 }} />
        {mils.map((m) => (
          <React.Fragment key={m}>
            <div className="absolute rounded-full bg-black" style={{ width: m % 5 === 0 ? 8 : 5, height: m % 5 === 0 ? 8 : 5, left: size / 2 - (m % 5 === 0 ? 4 : 2.5), top: size / 2 - m * pxPerMil - (m % 5 === 0 ? 4 : 2.5) }} />
            <div className="absolute rounded-full bg-black" style={{ width: m % 5 === 0 ? 8 : 5, height: m % 5 === 0 ? 8 : 5, top: size / 2 - (m % 5 === 0 ? 4 : 2.5), left: size / 2 + m * pxPerMil - (m % 5 === 0 ? 4 : 2.5) }} />
          </React.Fragment>
        ))}
        <div className="absolute font-mono2 text-[10px] text-white/70" style={{ left: size / 2 + 8, top: size / 2 - 5 * pxPerMil - 6 }}>5 mil</div>
      </div>
    </div>
  );
}

function Crosshairs({ muzzle, shotgun }) {
  return (
    <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%,-50%)" }}>
      <div className="relative" style={{ width: 40, height: 40 }}>
        <span className="absolute bg-white/85" style={{ width: 10, height: 2, left: 2, top: 19 }} />
        <span className="absolute bg-white/85" style={{ width: 10, height: 2, right: 2, top: 19 }} />
        <span className="absolute bg-white/85" style={{ width: 2, height: 10, top: 2, left: 19 }} />
        <span className="absolute bg-white/85" style={{ width: 2, height: 10, bottom: 2, left: 19 }} />
        <span className="absolute rounded-full bg-[#FF3B30]" style={{ width: 4, height: 4, left: 18, top: 18 }} />
        {shotgun && <span className="absolute rounded-full border border-white/40" style={{ width: 70, height: 70, left: -15, top: -15 }} />}
        {muzzle && <span className="absolute rounded-full bg-[#E6B325]/40 blur-md" style={{ width: 64, height: 64, left: -12, top: -12 }} />}
      </div>
    </div>
  );
}

function BallisticCard({ hud }) {
  const t = hud.target;
  const windDir = hud.windSign > 0 ? "L → R" : "R → L";
  return (
    <div className="absolute bottom-6 left-6 w-80 rounded-sm border border-white/10 bg-black/70 p-4 backdrop-blur-md" data-testid="ballistic-card">
      <div className="flex items-center justify-between">
        <div>
          <div className="hud-label text-[#94A3B8]">ZERO</div>
          <div className="font-mono2 text-3xl font-bold text-[#F1F5F9]" data-testid="hud-zero">
            {hud.zeroYd} <span className="text-sm text-[#64748B]">yd</span>
          </div>
        </div>
        <div className="text-right">
          <div className="hud-label flex items-center justify-end gap-1 text-[#94A3B8]"><Wind size={12} /> WIND</div>
          <div className="font-mono2 text-xl font-bold text-[#F1F5F9]" data-testid="hud-wind">
            {hud.windMph} <span className="text-sm text-[#64748B]">mph</span>
          </div>
          <div className="hud-label text-[#64748B]">{hud.windMph > 0 ? windDir : "CALM"}</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/10 pt-3 text-sm" data-testid="hud-solution">
        {t ? (
          t.reachable ? (
            <>
              <div><span className="hud-label text-[#64748B]">HOLD</span><div className="font-mono2 text-[#F1F5F9]">{Math.abs(t.dropMil).toFixed(1)} mil {t.dropMil >= 0 ? "UP" : "DOWN"}</div></div>
              <div><span className="hud-label text-[#64748B]">WIND HOLD</span><div className="font-mono2 text-[#F1F5F9]">{Math.abs(t.windMil).toFixed(1)} mil {t.windMil > 0.05 ? "LEFT" : t.windMil < -0.05 ? "RIGHT" : "—"}</div></div>
              <div><span className="hud-label text-[#64748B]">TIME OF FLIGHT</span><div className="font-mono2 text-[#F1F5F9]">{t.tof.toFixed(2)} s</div></div>
              <div><span className="hud-label text-[#64748B]">LEAD</span><div className="font-mono2 text-[#F1F5F9]">~{(t.leadM / 0.9144).toFixed(1)} yd</div></div>
            </>
          ) : (
            <div className="col-span-2 text-[#FF3B30]">Out of reach for this caliber</div>
          )
        ) : (
          <div className="col-span-2 text-[#64748B]">No target — solution appears when a hog runs.</div>
        )}
      </div>
      <div className="hud-label mt-2 text-[#64748B]">[↑/↓] or scroll: zero · hold RMB: scope</div>
    </div>
  );
}

function Overlay({ children }) {
  return <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">{children}</div>;
}

function AudioRow({ audioPrefs, onVolume, onToggleMute }) {
  return (
    <div className="mx-auto mt-6 flex w-72 items-center gap-3 rounded-sm border border-white/10 bg-black/50 px-4 py-3" data-testid="audio-settings">
      <button onClick={onToggleMute} data-testid="mute-toggle-button" className="text-[#E6B325] hover:text-white">{audioPrefs.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
      <input type="range" min="0" max="1" step="0.01" value={audioPrefs.volume} onChange={(e) => onVolume(parseFloat(e.target.value))} data-testid="volume-slider" className="w-full accent-[#E6B325]" disabled={audioPrefs.muted} />
      <span className="font-mono2 w-10 text-right text-xs text-[#94A3B8]" data-testid="volume-value">{audioPrefs.muted ? "MUTE" : `${Math.round(audioPrefs.volume * 100)}%`}</span>
    </div>
  );
}

export default function BoothHUD({ hud, cal, level, locked, phase, results, audioPrefs, onResume, onExit, onRetry, onNext, onZero, onVolume, onToggleMute }) {
  const t = hud.target;
  const acc = hud.shots ? Math.round((hud.hits / hud.shots) * 100) : 0;
  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {phase === "running" && locked && (hud.scoped ? <MilDotReticle fov={hud.fov} /> : <Crosshairs muzzle={hud.muzzle} shotgun={!!cal.pellets} />)}

      {/* feedback */}
      {hud.feedback && phase === "running" && (
        <div key={hud.feedback.id} className="absolute left-1/2 top-[58%] -translate-x-1/2 text-center" style={{ animation: "notice-fade 2.4s ease-out forwards" }} data-testid="shot-feedback">
          <div className="font-head text-2xl font-black tracking-widest" style={{ color: hud.feedback.type === "hit" ? "#10B981" : hud.feedback.type === "miss" ? "#F1F5F9" : "#FF3B30", textShadow: "0 0 18px rgba(0,0,0,0.9)" }}>
            {hud.feedback.text}
          </div>
        </div>
      )}

      {/* top-left: level + progress */}
      <div className="absolute left-6 top-6">
        <div className="hud-label text-[#64748B]">LEVEL {level.level} · {level.name.toUpperCase()}</div>
        <div className="font-head text-xl font-bold text-[#F1F5F9]" data-testid="hud-progress">
          TARGET {Math.min(BOOTH_TARGETS, hud.targetsDone + 1)} / {BOOTH_TARGETS}
        </div>
        <div className="font-mono2 mt-1 text-sm text-[#94A3B8]" data-testid="hud-hits">
          {hud.hits} hits · {hud.shots} shots · {acc}% · need {level.passHits}
        </div>
        <div className="mt-2 flex items-center gap-1 text-[#64748B]" data-testid="hud-audio-state">
          {audioPrefs.muted ? <VolumeX size={14} className="text-[#FF3B30]" /> : <Volume2 size={14} />}
          <span className="hud-label">{audioPrefs.muted ? "MUTED" : `${Math.round(audioPrefs.volume * 100)}%`} · [M]</span>
        </div>
      </div>

      {/* top-center: rangefinder */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 text-center" data-testid="hud-rangefinder">
        <div className="hud-label flex items-center justify-center gap-2 text-[#94A3B8]"><Target size={14} /> RANGEFINDER</div>
        {t ? (
          <>
            <div className="font-mono2 text-4xl font-black text-[#E6B325]" data-testid="hud-range">{t.rangeYd} <span className="text-lg text-[#94A3B8]">yd</span></div>
            <div className="font-mono2 text-sm text-[#F1F5F9]">
              {Math.abs(t.bearing) > 4 ? (t.bearing < 0 ? `◄ ${Math.round(-t.bearing)}°` : `${Math.round(t.bearing)}° ►`) : "ON LINE"} · {t.speedMph} mph
            </div>
          </>
        ) : (
          <div className="font-head text-2xl font-bold text-[#64748B] animate-pulse">SCANNING…</div>
        )}
      </div>

      {/* top-right: score */}
      <div className="absolute right-6 top-6 text-right">
        <div className="hud-label text-[#94A3B8]">SCORE</div>
        <div className="font-mono2 text-3xl font-bold text-[#F1F5F9]" data-testid="hud-score">{hud.score.toLocaleString()}</div>
        <div className="hud-label mt-1 text-[#64748B]">STREAK <span className="font-mono2 text-[#E6B325]">{hud.streak}</span></div>
      </div>

      <BallisticCard hud={hud} />

      {/* bottom-right: weapon */}
      <div className="absolute bottom-6 right-6 text-right" data-testid="hud-weapon-panel">
        <div className="hud-label flex items-center justify-end gap-2 text-[#94A3B8]"><Crosshair size={14} /> {cal.category.toUpperCase()} · {cal.action.toUpperCase()}</div>
        <div className="font-head text-lg font-bold text-[#E6B325]" data-testid="hud-caliber">{cal.name}</div>
        <div className="hud-label text-[#64748B]">{cal.model} · {cal.v0} m/s · {cal.zoom}×</div>
        {hud.reloading ? (
          <div className="font-head text-2xl font-bold text-[#E6B325] animate-pulse" data-testid="hud-reloading">RELOADING…</div>
        ) : (
          <div className="font-mono2 text-4xl font-bold text-[#F1F5F9]" data-testid="hud-ammo-counter">
            {hud.mag}<span className="text-lg text-[#64748B]"> / {hud.magSize}</span>
          </div>
        )}
        <div className="hud-label text-[#64748B]">[R] reload · LMB fire{cal.action === "auto" ? " (hold)" : ""}</div>
      </div>

      {/* ready / paused */}
      {!locked && phase !== "done" && (
        <Overlay>
          <div className="max-w-xl text-center" data-testid="booth-overlay">
            <div className="hud-label text-[#E6B325]">TRAINING BOOTH · LEVEL {level.level}</div>
            <div className="font-head text-5xl font-black uppercase tracking-widest text-[#F1F5F9]">{level.name}</div>
            <p className="mt-3 font-lore italic text-[#94A3B8]">{level.blurb}</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              {[["Range", `${level.rangeYd[0]}–${level.rangeYd[1]} yd`], ["Hog speed", `${level.speedMph[0]}–${level.speedMph[1]} mph`], ["Pass", `${level.passHits} of ${BOOTH_TARGETS}`]].map(([l, v]) => (
                <div key={l} className="rounded-sm border border-white/10 bg-black/40 py-2"><div className="hud-label text-[#64748B]">{l}</div><div className="font-mono2 text-[#F1F5F9]">{v}</div></div>
              ))}
            </div>
            <button onClick={onResume} data-testid="resume-play-button" className="mt-8 inline-flex items-center gap-3 rounded-sm bg-[#E6B325] px-10 py-4 font-head text-xl font-bold uppercase tracking-wider text-black transition-transform hover:scale-105">
              <Play size={22} /> {phase === "ready" ? "Step up to the line" : "Resume"}
            </button>
            <div className="mt-6 space-y-1 text-sm text-[#94A3B8]">
              <p><span className="font-mono2 text-[#E6B325]">MOUSE</span> aim · <span className="font-mono2 text-[#E6B325]">LMB</span> fire · <span className="font-mono2 text-[#E6B325]">hold RMB</span> scope · <span className="font-mono2 text-[#E6B325]">R</span> reload</p>
              <p><span className="font-mono2 text-[#E6B325]">↑ ↓ / scroll</span> dial zero range · <span className="font-mono2 text-[#E6B325]">M</span> mute · <span className="font-mono2 text-[#E6B325]">ESC</span> pause</p>
            </div>
            <div className="mx-auto mt-6 flex w-72 items-center justify-between rounded-sm border border-white/10 bg-black/50 px-4 py-3" data-testid="zero-dial">
              <button onClick={() => onZero(-1)} data-testid="zero-down-button" className="rounded-sm border border-white/15 p-2 text-[#94A3B8] hover:text-white"><ChevronDown size={16} /></button>
              <div className="text-center">
                <div className="hud-label text-[#64748B]">ZERO RANGE</div>
                <div className="font-mono2 text-2xl font-bold text-[#E6B325]" data-testid="overlay-zero">{hud.zeroYd} yd</div>
              </div>
              <button onClick={() => onZero(1)} data-testid="zero-up-button" className="rounded-sm border border-white/15 p-2 text-[#94A3B8] hover:text-white"><ChevronUp size={16} /></button>
            </div>
            <AudioRow audioPrefs={audioPrefs} onVolume={onVolume} onToggleMute={onToggleMute} />
            <button onClick={onExit} data-testid="booth-exit-button" className="mt-6 inline-flex items-center gap-2 text-sm text-[#64748B] hover:text-[#FF3B30]"><LogOut size={14} /> Leave the booth</button>
          </div>
        </Overlay>
      )}

      {/* results */}
      {phase === "done" && results && (
        <Overlay>
          <div className="w-full max-w-lg text-center" data-testid="booth-results">
            <div className="hud-label text-[#94A3B8]">LEVEL {level.level} · {level.name.toUpperCase()}</div>
            <div className="font-head text-6xl font-black uppercase tracking-widest" style={{ color: results.passed ? "#10B981" : "#FF3B30" }} data-testid="booth-result-status">
              {results.passed ? "Qualified" : "Not Yet"}
            </div>
            <div className="mt-2 text-[#94A3B8]">{results.hits} of {BOOTH_TARGETS} hogs dropped · needed {level.passHits}</div>
            <div className="mt-6 rounded-md border border-white/10 bg-[#12181F]/80 p-6">
              <div className="hud-label text-[#94A3B8]">Score</div>
              <div className="font-mono2 text-5xl font-black text-[#E6B325]" data-testid="booth-final-score">{results.score.toLocaleString()}</div>
              <div className="mt-3 flex min-h-6 items-center justify-center gap-2 text-sm">
                {results.submitting ? (
                  <><Loader2 className="animate-spin" size={16} /> Logging the card…</>
                ) : results.server ? (
                  <>
                    <Trophy size={16} className="text-[#E6B325]" /> Level rank #{results.server.rank}
                    {results.server.is_level_best && <span className="rounded-full border border-[#10B981]/50 px-2 py-0.5 text-[#10B981]">Level best</span>}
                    {results.server.newly_unlocked && <span className="inline-flex items-center gap-1 rounded-full border border-[#E6B325]/50 px-2 py-0.5 text-[#E6B325]" data-testid="booth-unlocked-badge"><Unlock size={12} /> Level {results.server.unlocked_level} unlocked</span>}
                  </>
                ) : (
                  <span className="text-[#FF3B30]">Result could not be saved.</span>
                )}
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                {[["Shots", results.shots], ["Accuracy", `${results.shots ? Math.round((results.hits / results.shots) * 100) : 0}%`], ["Best streak", results.bestStreak], ["Longest", `${results.longestHit} yd`]].map(([l, v]) => (
                  <div key={l} className="rounded-sm border border-white/10 bg-black/40 py-3"><div className="hud-label text-[#64748B]">{l}</div><div className="font-mono2 text-xl font-bold text-[#F1F5F9]">{v}</div></div>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <button onClick={onRetry} data-testid="booth-retry-button" className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#E6B325] px-6 py-3 font-head font-bold uppercase tracking-wider text-black hover:scale-105"><RotateCcw size={18} /> Again</button>
              {level.level < 5 && (
                <button onClick={onNext} disabled={!(results.server && results.server.unlocked_level > level.level)} data-testid="booth-next-button" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-[#12181F] px-6 py-3 font-head font-bold uppercase tracking-wider text-[#F1F5F9] disabled:opacity-40">
                  {results.server && results.server.unlocked_level > level.level ? <ArrowRight size={18} /> : <Lock size={16} />} Level {level.level + 1}
                </button>
              )}
              <button onClick={onExit} data-testid="booth-menu-button" className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 px-6 py-3 font-head font-bold uppercase tracking-wider text-[#94A3B8] hover:text-white"><Home size={18} /> Booth</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
