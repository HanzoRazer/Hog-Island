import React, { useState, useCallback } from "react";
import { BrowserRouter, useLocation, useNavigate } from "react-router-dom";
import "./App.css";
import { Landing, MainMenu } from "./screens/Menu";
import Leaderboard from "./screens/Leaderboard";
import LoreCodex from "./screens/LoreCodex";
import GameOver from "./screens/GameOver";
import GameScreen from "./game/GameScreen";
import Booth from "./screens/Booth";
import BoothScreen from "./game/booth/BoothScreen";
import PracticeRange from "./components/game/PracticeRange";
import { guestLogin, submitScore } from "./lib/api";
import { CALIBERS } from "./data/calibers";

const STORAGE_KEY = "hog_island_player";

function loadPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function HogIsland() {
  const navigate = useNavigate();
  const location = useLocation();
  const [player, setPlayer] = useState(loadPlayer);
  const [session, setSession] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const path = location.pathname;

  const login = useCallback(async (name) => {
    const p = await guestLogin(name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setPlayer(p);
    navigate("/menu", { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayer(null);
    setResult(null);
    navigate("/", { replace: true });
  }, [navigate]);

  const startGame = useCallback(() => {
    setResult(null);
    setSubmitResult(null);
    setSession((s) => s + 1);
    navigate("/hunt");
  }, [navigate]);

  const startBooth = useCallback((level, caliber) => {
    setSession((s) => s + 1);
    navigate(`/booth/play/${level}/${caliber}`);
  }, [navigate]);

  const handleGameOver = useCallback(async (res) => {
    setResult(res);
    setSubmitting(true);
    setSubmitResult(null);
    navigate("/gameover", { replace: true });
    try {
      const r = await submitScore({
        player_id: player.id,
        name: player.name,
        score: res.score,
        kills: res.kills,
        wave: res.wave,
        survival_time: res.survival_time,
      });
      setSubmitResult(r);
    } catch {
      setSubmitResult(null);
    } finally {
      setSubmitting(false);
    }
  }, [navigate, player]);

  // The original range is self-contained and keeps its own local progress.
  if (path === "/practice") {
    return <PracticeRange onExit={() => navigate(player ? "/menu" : "/")} />;
  }

  // Guest identity is needed only for the 3D hunt, booth and leaderboards.
  if (!player) {
    if (path !== "/") return <RouteFallback to="/" />;
    return <Landing onLogin={login} />;
  }

  if (path === "/hunt") {
    return (
      <GameScreen
        key={session}
        player={player}
        onExit={() => navigate("/menu")}
        onGameOver={handleGameOver}
      />
    );
  }

  if (path === "/booth") {
    return <Booth player={player} onBack={() => navigate("/menu")} onStart={startBooth} />;
  }

  const boothMatch = path.match(/^\/booth\/play\/([1-5])\/([a-zA-Z0-9_-]+)$/);
  if (boothMatch && CALIBERS[boothMatch[2]]) {
    const level = Number(boothMatch[1]);
    const caliber = boothMatch[2];
    return (
      <BoothScreen
        key={`${session}:${level}:${caliber}`}
        player={player}
        levelNum={level}
        caliberKey={caliber}
        onExit={() => navigate("/booth")}
        onRetry={() => startBooth(level, caliber)}
        onNext={() => startBooth(level + 1, caliber)}
      />
    );
  }
  if (path.startsWith("/booth/play/")) return <RouteFallback to="/booth" />;

  // Results exist only for the current session; a refreshed URL returns to the menu.
  if (path === "/gameover" && result) {
    return (
      <GameOver
        result={result}
        submitting={submitting}
        submitResult={submitResult}
        onPlayAgain={startGame}
        onMenu={() => navigate("/menu")}
        onLeaderboard={() => navigate("/leaderboard", { state: { from: "gameover" } })}
      />
    );
  }
  if (path === "/gameover") return <RouteFallback to="/menu" />;

  if (path === "/leaderboard") {
    return (
      <Leaderboard
        player={player}
        onBack={() => navigate(location.state?.from === "gameover" && result ? "/gameover" : "/menu")}
      />
    );
  }

  if (path === "/lore") {
    return <LoreCodex onBack={() => navigate("/menu")} />;
  }

  if (path === "/menu" || path === "/") {
    return (
      <MainMenu
        player={player}
        onPlay={startGame}
        onBooth={() => navigate("/booth")}
        onPractice={() => navigate("/practice")}
        onLeaderboard={() => navigate("/leaderboard")}
        onLore={() => navigate("/lore")}
        onLogout={logout}
      />
    );
  }

  // Unknown or session-only routes are replaced rather than left in browser history.
  return <RouteFallback to="/menu" />;
}

function RouteFallback({ to }) {
  const navigate = useNavigate();
  React.useEffect(() => navigate(to, { replace: true }), [navigate, to]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <HogIsland />
    </BrowserRouter>
  );
}
