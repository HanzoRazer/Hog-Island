import React, { useEffect, useState } from "react";
import { ArrowLeft, Lock, Play, Trophy, Crosshair, Loader2, Star } from "lucide-react";
import { LEVELS, BOOTH_TARGETS } from "../game/booth/levels";
import { calibersByCategory, CALIBERS } from "../data/calibers";
import { getBoothProgress, getBoothLeaderboard } from "../lib/api";

const LAST_CAL_KEY = "hog_island_booth_caliber";

function LevelCard({ L, locked, best, selected, onSelect }) {
  return (
    <button
      disabled={locked}
      onClick={() => onSelect(L.level)}
      data-testid={`booth-level-${L.level}`}
      className="w-full rounded-md border p-4 text-left transition-all disabled:cursor-not-allowed"
      style={{
        borderColor: selected ? "#E6B325" : "rgba(255,255,255,0.1)",
        background: selected ? "rgba(230,179,37,0.08)" : "rgba(18,24,31,0.8)",
        opacity: locked ? 0.45 : 1,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="hud-label text-[#64748B]">LEVEL {L.level}</div>
        {locked ? <Lock size={14} className="text-[#64748B]" /> : best ? <Star size={14} className="text-[#E6B325]" /> : null}
      </div>
      <div className="font-head text-lg font-bold text-[#F1F5F9]">{L.name}</div>
      <div className="mt-1 text-xs text-[#94A3B8]">
        {L.rangeYd[0]}–{L.rangeYd[1]} yd · {L.speedMph[0]}–{L.speedMph[1]} mph{L.windMph[1] > 0 ? ` · wind ≤${L.windMph[1]} mph` : ""}
      </div>
      <div className="mt-2 font-mono2 text-xs text-[#64748B]">
        {best ? (
          <span data-testid={`booth-level-${L.level}-best`}>
            best <span className="text-[#E6B325]">{best.score.toLocaleString()}</span> · {best.hits}/{BOOTH_TARGETS} · {best.caliber}
          </span>
        ) : (
          `pass ${L.passHits} of ${BOOTH_TARGETS}`
        )}
      </div>
    </button>
  );
}

function CaliberPicker({ value, onChange }) {
  return (
    <div className="space-y-4" data-testid="caliber-picker">
      {calibersByCategory().map((cat) => (
        <div key={cat.key}>
          <div className="hud-label mb-2 text-[#64748B]">{cat.name.toUpperCase()}</div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {cat.items.map((c) => {
              const on = c.key === value;
              return (
                <button
                  key={c.key}
                  onClick={() => onChange(c.key)}
                  data-testid={`caliber-${c.key}`}
                  className="rounded-sm border px-3 py-2 text-left transition-colors"
                  style={{ borderColor: on ? "#E6B325" : "rgba(255,255,255,0.1)", background: on ? "rgba(230,179,37,0.1)" : "rgba(0,0,0,0.35)" }}
                >
                  <div className="font-head text-sm font-bold text-[#F1F5F9]">{c.name}</div>
                  <div className="font-mono2 text-[10px] text-[#64748B]">
                    {c.v0} m/s · BC {c.bc} · {c.mag} rd · {c.zoom}× · {c.action}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Booth({ player, onBack, onStart }) {
  const [progress, setProgress] = useState(null);
  const [level, setLevel] = useState(1);
  const [caliber, setCaliber] = useState(() => localStorage.getItem(LAST_CAL_KEY) || "r223");
  const [board, setBoard] = useState(null);

  useEffect(() => {
    getBoothProgress(player.id)
      .then((p) => {
        setProgress(p);
        setLevel(p.unlocked_level);
      })
      .catch(() => setProgress({ unlocked_level: 1, bests: {} }));
  }, [player.id]);

  useEffect(() => {
    setBoard(null);
    getBoothLeaderboard(level, 10).then(setBoard).catch(() => setBoard([]));
  }, [level]);

  const pick = (k) => {
    setCaliber(k);
    localStorage.setItem(LAST_CAL_KEY, k);
  };
  const L = LEVELS[level - 1];
  const cal = CALIBERS[caliber];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090C0F] text-[#F1F5F9]" data-testid="booth-menu">
      <div className="fog-layer opacity-40" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-10">
        <button onClick={onBack} data-testid="booth-back-button" className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="hud-label text-[#E6B325]">SKILL RANGE</div>
            <h1 className="font-head text-4xl font-black uppercase tracking-widest sm:text-5xl">Training Booth</h1>
            <p className="mt-2 max-w-xl font-lore italic text-[#94A3B8]">
              Dial in every caliber from 25 to 1,000 yards. Hogs run at 2–30 mph from random angles — read the drop, hold the wind, lead the target.
            </p>
          </div>
          <button
            onClick={() => onStart(level, caliber)}
            disabled={!progress}
            data-testid="booth-start-button"
            className="inline-flex items-center gap-3 rounded-sm bg-[#E6B325] px-8 py-4 font-head text-lg font-bold uppercase tracking-wider text-black transition-transform hover:scale-105 disabled:opacity-50"
          >
            <Play size={20} /> Level {level} · {cal.name}
          </button>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[280px_1fr_300px]">
          <div className="space-y-3">
            <div className="hud-label text-[#64748B]">LEVELS</div>
            {!progress ? (
              <div className="flex items-center gap-2 text-sm text-[#94A3B8]"><Loader2 className="animate-spin" size={16} /> Loading your card…</div>
            ) : (
              LEVELS.map((l) => (
                <LevelCard key={l.level} L={l} locked={l.level > progress.unlocked_level} best={progress.bests?.[String(l.level)]} selected={l.level === level} onSelect={setLevel} />
              ))
            )}
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="hud-label text-[#64748B]">ARSENAL — BY CALIBER</div>
              <div className="hud-label flex items-center gap-1 text-[#94A3B8]"><Crosshair size={12} /> {Object.keys(CALIBERS).length} loadouts</div>
            </div>
            <CaliberPicker value={caliber} onChange={pick} />
            <div className="mt-4 rounded-sm border border-white/10 bg-black/40 p-4 text-sm text-[#94A3B8]" data-testid="level-brief">
              <span className="font-head font-bold text-[#F1F5F9]">{L.name}:</span> {L.blurb} Qualify with {L.passHits} of {BOOTH_TARGETS} hits to unlock the next level.
            </div>
          </div>

          <div>
            <div className="hud-label mb-3 flex items-center gap-2 text-[#64748B]"><Trophy size={12} /> LEVEL {level} LEDGER</div>
            <div className="rounded-md border border-white/10 bg-[#12181F]/80" data-testid="booth-leaderboard">
              {board === null ? (
                <div className="flex items-center gap-2 p-4 text-sm text-[#94A3B8]"><Loader2 className="animate-spin" size={16} /> Loading…</div>
              ) : board.length === 0 ? (
                <div className="p-4 text-sm text-[#64748B]">No cards logged yet. Be the first.</div>
              ) : (
                board.map((e) => (
                  <div key={e.player_id} className="flex items-center justify-between border-b border-white/5 px-4 py-2 text-sm last:border-0" style={{ background: e.player_id === player.id ? "rgba(230,179,37,0.08)" : undefined }}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono2 w-5 text-[#64748B]">{e.rank}</span>
                      <div>
                        <div className="font-head font-bold">{e.name}</div>
                        <div className="text-[10px] text-[#64748B]">{e.hits}/{e.shots} · {e.caliber} · {e.longest_hit_yd} yd</div>
                      </div>
                    </div>
                    <span className="font-mono2 text-[#E6B325]">{e.score.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
