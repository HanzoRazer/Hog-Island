import React from "react";
import { Heart, Crosshair, Skull, Waves, Target, LogOut, Play } from "lucide-react";

export default function HUD({
  player,
  health,
  ammo,
  magSize,
  reloading,
  score,
  kills,
  wave,
  enemyCount,
  hitMarker,
  muzzle,
  damageFlash,
  locked,
  phase,
  onResume,
  onReload,
  onExit,
}) {
  const healthColor = health > 50 ? "#10B981" : health > 25 ? "#E6B325" : "#FF3B30";

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* damage vignette */}
      <div
        className="absolute inset-0 transition-opacity duration-150"
        style={{
          opacity: damageFlash ? 1 : 0,
          boxShadow: "inset 0 0 200px 40px rgba(255,59,48,0.55)",
        }}
      />

      {/* crosshair + muzzle + hitmarker */}
      {phase === "playing" && (
        <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%,-50%)" }}>
          <div className="relative" style={{ width: 40, height: 40 }}>
            <span className="absolute bg-white/80" style={{ width: 10, height: 2, left: 2, top: 19 }} />
            <span className="absolute bg-white/80" style={{ width: 10, height: 2, right: 2, top: 19 }} />
            <span className="absolute bg-white/80" style={{ width: 2, height: 10, top: 2, left: 19 }} />
            <span className="absolute bg-white/80" style={{ width: 2, height: 10, bottom: 2, left: 19 }} />
            <span className="absolute rounded-full bg-[#FF3B30]" style={{ width: 4, height: 4, left: 18, top: 18 }} />
            {muzzle && (
              <span className="absolute rounded-full bg-[#E6B325]/40 blur-md" style={{ width: 64, height: 64, left: -12, top: -12 }} />
            )}
            {hitMarker && (
              <span
                className="absolute text-2xl font-black"
                style={{ left: 10, top: 2, color: hitMarker === "kill" ? "#FF3B30" : "#F1F5F9" }}
              >
                ✕
              </span>
            )}
          </div>
        </div>
      )}

      {/* top-center wave banner */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 text-center">
        <div className="hud-label flex items-center justify-center gap-2 text-[#94A3B8]">
          <Waves size={14} /> WAVE
        </div>
        <div className="font-head text-4xl font-black text-[#E6B325]" data-testid="hud-wave">
          {wave}
        </div>
        <div className="hud-label mt-1 flex items-center justify-center gap-1 text-[#64748B]">
          <Skull size={12} /> {enemyCount} on the hunt
        </div>
      </div>

      {/* top-right score/kills */}
      <div className="absolute right-6 top-6 text-right">
        <div className="hud-label text-[#94A3B8]">SCORE</div>
        <div className="font-mono2 text-3xl font-bold text-[#F1F5F9]" data-testid="hud-score">
          {score.toLocaleString()}
        </div>
        <div className="mt-2 flex items-center justify-end gap-2 text-[#94A3B8]">
          <Target size={14} />
          <span className="font-mono2 text-lg" data-testid="hud-kills">{kills}</span>
        </div>
      </div>

      {/* top-left player */}
      <div className="absolute left-6 top-6">
        <div className="hud-label text-[#64748B]">SURVIVOR</div>
        <div className="font-head text-xl font-bold tracking-wide text-[#F1F5F9]" data-testid="hud-player-name">
          {player?.name}
        </div>
      </div>

      {/* bottom-left health */}
      <div className="absolute bottom-6 left-6 w-72" data-testid="hud-health-bar">
        <div className="hud-label mb-1 flex items-center gap-2 text-[#94A3B8]">
          <Heart size={14} style={{ color: healthColor }} /> VITALITY
        </div>
        <div className="h-4 w-full overflow-hidden rounded-sm border border-white/10 bg-black/60">
          <div
            className="h-full transition-all duration-200"
            style={{ width: `${health}%`, backgroundColor: healthColor }}
          />
        </div>
        <div className="font-mono2 mt-1 text-lg font-bold" style={{ color: healthColor }}>
          {health}
        </div>
      </div>

      {/* bottom-right ammo */}
      <div className="absolute bottom-6 right-6 text-right" data-testid="hud-ammo-counter">
        <div className="hud-label flex items-center justify-end gap-2 text-[#94A3B8]">
          <Crosshair size={14} /> AMMO
        </div>
        {reloading ? (
          <div className="font-head text-2xl font-bold text-[#E6B325] animate-pulse">RELOADING…</div>
        ) : (
          <div className="font-mono2 text-4xl font-bold text-[#F1F5F9]">
            {ammo}
            <span className="text-lg text-[#64748B]"> / {magSize}</span>
          </div>
        )}
        <div className="hud-label mt-1 text-[#64748B]">[R] to reload</div>
      </div>

      {/* weapon viewmodel (css) */}
      {phase === "playing" && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div
            className="h-24 w-16 rounded-t-sm bg-gradient-to-t from-[#15181c] to-[#2a2f36] shadow-2xl"
            style={{ transform: muzzle ? "translateY(6px)" : "translateY(0)", transition: "transform 60ms" }}
          />
        </div>
      )}

      {/* click-to-play / pause overlay */}
      {!locked && phase === "playing" && (
        <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="text-center">
            <div className="font-head text-5xl font-black uppercase tracking-widest text-[#F1F5F9]">
              The Fog Waits
            </div>
            <button
              onClick={onResume}
              data-testid="resume-play-button"
              className="mt-8 inline-flex items-center gap-3 rounded-sm border border-[#E6B325]/40 bg-[#E6B325] px-10 py-4 font-head text-xl font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
            >
              <Play size={22} /> Enter the Hunt
            </button>
            <div className="mt-8 space-y-1 text-sm text-[#94A3B8]">
              <p><span className="font-mono2 text-[#E6B325]">WASD</span> move · <span className="font-mono2 text-[#E6B325]">MOUSE</span> look · <span className="font-mono2 text-[#E6B325]">CLICK</span> fire · <span className="font-mono2 text-[#E6B325]">R</span> reload · <span className="font-mono2 text-[#E6B325]">ESC</span> pause</p>
            </div>
            <button
              onClick={onExit}
              data-testid="abandon-hunt-button"
              className="pointer-events-auto mt-6 inline-flex items-center gap-2 text-sm text-[#64748B] transition-colors hover:text-[#FF3B30]"
            >
              <LogOut size={14} /> Abandon the hunt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
