import React, { useState, useCallback } from "react";
import "@/App.css";
import { Landing, MainMenu } from "@/screens/Menu";
import Leaderboard from "@/screens/Leaderboard";
import LoreCodex from "@/screens/LoreCodex";
import GameOver from "@/screens/GameOver";
import GameScreen from "@/game/GameScreen";
import Booth from "@/screens/Booth";
import BoothScreen from "@/game/booth/BoothScreen";
import { guestLogin, submitScore } from "@/lib/api";

const STORAGE_KEY = "hog_island_player";

function loadPlayer() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function App() {
  const [player, setPlayer] = useState(loadPlayer);
  const [screen, setScreen] = useState(player ? "menu" : "landing");
  const [session, setSession] = useState(0);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [booth, setBooth] = useState({ level: 1, caliber: "r223" });

  const startBooth = useCallback((level, caliber) => {
    setBooth({ level, caliber });
    setSession((s) => s + 1);
    setScreen("boothgame");
  }, []);

  const login = useCallback(async (name) => {
    const p = await guestLogin(name);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
    setPlayer(p);
    setScreen("menu");
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPlayer(null);
    setScreen("landing");
  }, []);

  const startGame = useCallback(() => {
    setResult(null);
    setSubmitResult(null);
    setSession((s) => s + 1);
    setScreen("game");
  }, []);

  const handleGameOver = useCallback(
    async (res) => {
      setResult(res);
      setScreen("gameover");
      setSubmitting(true);
      setSubmitResult(null);
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
    },
    [player]
  );

  if (screen === "landing" || !player) {
    return <Landing onLogin={login} />;
  }

  if (screen === "game") {
    return (
      <GameScreen
        key={session}
        player={player}
        onExit={() => setScreen("menu")}
        onGameOver={handleGameOver}
      />
    );
  }

  if (screen === "booth") {
    return <Booth player={player} onBack={() => setScreen("menu")} onStart={startBooth} />;
  }

  if (screen === "boothgame") {
    return (
      <BoothScreen
        key={session}
        player={player}
        levelNum={booth.level}
        caliberKey={booth.caliber}
        onExit={() => setScreen("booth")}
        onRetry={() => startBooth(booth.level, booth.caliber)}
        onNext={() => startBooth(booth.level + 1, booth.caliber)}
      />
    );
  }

  if (screen === "gameover" && result) {
    return (
      <GameOver
        result={result}
        submitting={submitting}
        submitResult={submitResult}
        onPlayAgain={startGame}
        onMenu={() => setScreen("menu")}
        onLeaderboard={() => setScreen("leaderboard")}
      />
    );
  }

  if (screen === "leaderboard") {
    return <Leaderboard player={player} onBack={() => setScreen(result ? "gameover" : "menu")} />;
  }

  if (screen === "lore") {
    return <LoreCodex onBack={() => setScreen("menu")} />;
  }

  return (
    <MainMenu
      player={player}
      onPlay={startGame}
      onBooth={() => setScreen("booth")}
      onLeaderboard={() => setScreen("leaderboard")}
      onLore={() => setScreen("lore")}
      onLogout={logout}
    />
  );
}
