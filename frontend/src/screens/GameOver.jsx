import React from "react";
import { Skull, RotateCcw, Trophy, Home, Loader2, Star } from "lucide-react";

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function GameOver({ result, submitting, submitResult, onPlayAgain, onMenu, onLeaderboard }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090C0F] px-6 text-[#F1F5F9]">
      <div className="fog-layer opacity-40" />
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 300px 60px rgba(255,59,48,0.25)" }} />

      <div className="relative z-10 w-full max-w-lg text-center" data-testid="game-over-screen">
        <Skull size={54} className="mx-auto text-[#FF3B30]" />
        <h1 className="mt-4 font-head text-6xl font-black uppercase tracking-widest">You Fell</h1>
        <p className="mt-2 font-lore text-lg italic text-[#94A3B8]">
          The fog takes another. Your name is carved into the ledger.
        </p>

        <div className="mt-8 rounded-md border border-white/10 bg-[#12181F]/80 p-8 backdrop-blur-md">
          <div className="hud-label text-[#94A3B8]">Final Score</div>
          <div className="font-mono2 text-6xl font-black text-[#E6B325]" data-testid="final-score">
            {result.score.toLocaleString()}
          </div>

          {submitting ? (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm text-[#94A3B8]">
              <Loader2 className="animate-spin" size={16} /> Carving your name…
            </div>
          ) : submitResult ? (
            <div className="mt-3 flex items-center justify-center gap-2 text-sm">
              <Trophy size={16} className="text-[#E6B325]" />
              <span className="text-[#F1F5F9]">Global Rank #{submitResult.rank}</span>
              {submitResult.is_personal_best && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#10B981]/50 px-2 py-0.5 text-[#10B981]">
                  <Star size={12} /> Personal Best
                </span>
              )}
            </div>
          ) : (
            <div className="mt-3 text-sm text-[#FF3B30]">Score could not be submitted.</div>
          )}

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              ["Kills", result.kills],
              ["Wave", result.wave],
              ["Survived", fmtTime(result.survival_time)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-sm border border-white/10 bg-black/40 py-4">
                <div className="hud-label text-[#64748B]">{l}</div>
                <div className="font-mono2 text-2xl font-bold text-[#F1F5F9]">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            data-testid="play-again-button"
            onClick={onPlayAgain}
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-[#FF3B30] px-8 py-3 font-head text-lg font-bold uppercase tracking-wider text-white transition-transform hover:scale-105"
          >
            <RotateCcw size={18} /> Hunt Again
          </button>
          <button
            data-testid="view-leaderboard-button"
            onClick={onLeaderboard}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 bg-[#12181F] px-8 py-3 font-head text-lg font-bold uppercase tracking-wider text-[#F1F5F9] transition-colors hover:border-[#E6B325]/50"
          >
            <Trophy size={18} /> Ledger
          </button>
          <button
            data-testid="menu-button"
            onClick={onMenu}
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 px-8 py-3 font-head text-lg font-bold uppercase tracking-wider text-[#94A3B8] transition-colors hover:text-[#F1F5F9]"
          >
            <Home size={18} /> Menu
          </button>
        </div>
      </div>
    </div>
  );
}
