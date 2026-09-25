import React from "react";
import { Heart, Crosshair, Skull, Waves, Target, LogOut, Play, Volume2, VolumeX, Sparkles } from "lucide-react";
import { WEAPONS, WEAPON_ORDER } from "./weapons";

function WeaponPanel({ weaponKey, ammo, reloading, onSelectWeapon }) {
  const w = WEAPONS[weaponKey];
  const st = ammo[weaponKey];
  return (
    <div className="absolute bottom-6 right-6 text-right" data-testid="hud-weapon-panel">
      <div className="hud-label flex items-center justify-end gap-2 text-[#94A3B8]">
        <Crosshair size={14} /> {w.short}
      </div>
      <div className="font-head text-sm font-bold tracking-wide" style={{ color: w.color }} data-testid="hud-weapon-name">
        {w.name}
      </div>
      {reloading ? (
        <div className="font-head text-2xl font-bold text-[#E6B325] animate-pulse" data-testid="hud-reloading">RELOADING…</div>
      ) : (
        <div className="font-mono2 text-4xl font-bold text-[#F1F5F9]" data-testid="hud-ammo-counter">
          {st.mag}
          <span className="text-lg text-[#64748B]"> / {st.reserve === Infinity ? "∞" : st.reserve}</span>
        </div>
      )}
      <div className="pointer-events-auto mt-2 flex justify-end gap-1" data-testid="hud-weapon-slots">
        {WEAPON_ORDER.map((k) => {
          const d = WEAPONS[k];
          const a = ammo[k];
          const empty = a.mag === 0 && a.reserve === 0;
          const on = k === weaponKey;
          return (
            <button
              key={k}
              onClick={() => onSelectWeapon(k)}
              data-testid={`weapon-slot-${k}`}
              className="rounded-sm border px-2 py-1 text-left transition-colors"
              style={{
                borderColor: on ? d.color : "rgba(255,255,255,0.12)",
                background: on ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)",
                opacity: empty ? 0.4 : 1,
              }}
            >
              <div className="font-mono2 text-[10px] leading-none" style={{ color: on ? d.color : "#64748B" }}>
                [{d.slot}]
              </div>
              <div className="font-mono2 text-xs" style={{ color: on ? "#F1F5F9" : "#94A3B8" }}>
                {a.mag}/{a.reserve === Infinity ? "∞" : a.reserve}
              </div>
            </button>
          );
        })}
      </div>
      <div className="hud-label mt-1 text-[#64748B]">[R] reload · [Q] / scroll swap</div>
    </div>
  );
}

function PauseOverlay({ audioPrefs, onVolume, onToggleMute, onResume, onExit }) {
  return (
    <div className="pointer-events-auto absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md" data-testid="pause-overlay">
      <div className="text-center">
        <div className="font-head text-5xl font-black uppercase tracking-widest text-[#F1F5F9]">The Fog Waits</div>
        <button
          onClick={onResume}
          data-testid="resume-play-button"
          className="mt-8 inline-flex items-center gap-3 rounded-sm border border-[#E6B325]/40 bg-[#E6B325] px-10 py-4 font-head text-xl font-bold uppercase tracking-wider text-black transition-transform hover:scale-105"
        >
          <Play size={22} /> Enter the Hunt
        </button>
        <div className="mt-8 space-y-1 text-sm text-[#94A3B8]">
          <p>
            <span className="font-mono2 text-[#E6B325]">WASD</span> move · <span className="font-mono2 text-[#E6B325]">MOUSE</span> look ·{" "}
            <span className="font-mono2 text-[#E6B325]">CLICK</span> fire · <span className="font-mono2 text-[#E6B325]">R</span> reload
          </p>
          <p>
            <span className="font-mono2 text-[#E6B325]">1 2 3</span> weapons · <span className="font-mono2 text-[#E6B325]">Q</span>/scroll swap ·{" "}
            <span className="font-mono2 text-[#E6B325]">M</span> mute · <span className="font-mono2 text-[#E6B325]">ESC</span> pause
          </p>
        </div>

        <div className="mx-auto mt-8 flex w-72 items-center gap-3 rounded-sm border border-white/10 bg-black/50 px-4 py-3" data-testid="audio-settings">
          <button onClick={onToggleMute} data-testid="mute-toggle-button" className="text-[#E6B325] transition-colors hover:text-white">
            {audioPrefs.muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={audioPrefs.volume}
            onChange={(e) => onVolume(parseFloat(e.target.value))}
            data-testid="volume-slider"
            className="w-full accent-[#E6B325]"
            disabled={audioPrefs.muted}
          />
          <span className="font-mono2 w-10 text-right text-xs text-[#94A3B8]" data-testid="volume-value">
            {audioPrefs.muted ? "MUTE" : `${Math.round(audioPrefs.volume * 100)}%`}
          </span>
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
  );
}

export default function HUD({
  player,
  health,
  weaponKey,
  ammo,
  reloading,
  score,
  kills,
  wave,
  enemyCount,
  hitMarker,
  muzzle,
  damageFlash,
  surge,
  notice,
  locked,
  phase,
  audioPrefs,
  hasWeaponModel,
  onVolume,
  onToggleMute,
  onSelectWeapon,
  onResume,
  onExit,
}) {
  const healthColor = health > 50 ? "#10B981" : health > 25 ? "#E6B325" : "#FF3B30";

  return (
    <div className="pointer-events-none absolute inset-0 select-none">
      {/* mystical surge distortion */}
      <div
        className="absolute inset-0 transition-opacity duration-1000"
        data-testid="surge-overlay"
        style={{
          opacity: surge ? 1 : 0,
          background: "radial-gradient(ellipse at center, rgba(192,132,252,0) 40%, rgba(120,60,200,0.35) 100%)",
          mixBlendMode: "screen",
          animation: surge ? "surge-breathe 2.4s ease-in-out infinite" : "none",
        }}
      />
      {surge && (
        <div className="absolute left-1/2 top-28 -translate-x-1/2 text-center" data-testid="surge-banner">
          <div className="hud-label flex items-center justify-center gap-2 text-[#c084fc]">
            <Sparkles size={14} /> THE VEIL THINS
          </div>
          <div className="font-head text-lg font-bold tracking-widest text-[#e9d5ff] animate-pulse">2× BOUNTY · BEASTS SHIFT SHAPE</div>
        </div>
      )}

      {/* damage vignette */}
      <div className="absolute inset-0 transition-opacity duration-150" style={{ opacity: damageFlash ? 1 : 0, boxShadow: "inset 0 0 200px 40px rgba(255,59,48,0.55)" }} />

      {/* crosshair + muzzle + hitmarker */}
      {phase === "playing" && (
        <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%,-50%)" }}>
          <div className="relative" style={{ width: 40, height: 40 }}>
            <span className="absolute bg-white/80" style={{ width: 10, height: 2, left: 2, top: 19 }} />
            <span className="absolute bg-white/80" style={{ width: 10, height: 2, right: 2, top: 19 }} />
            <span className="absolute bg-white/80" style={{ width: 2, height: 10, top: 2, left: 19 }} />
            <span className="absolute bg-white/80" style={{ width: 2, height: 10, bottom: 2, left: 19 }} />
            <span className="absolute rounded-full bg-[#FF3B30]" style={{ width: 4, height: 4, left: 18, top: 18 }} />
            {weaponKey === "shotgun" && <span className="absolute rounded-full border border-white/40" style={{ width: 80, height: 80, left: -20, top: -20 }} />}
            {muzzle && <span className="absolute rounded-full bg-[#E6B325]/40 blur-md" style={{ width: 64, height: 64, left: -12, top: -12 }} />}
            {hitMarker && (
              <span className="absolute text-2xl font-black" style={{ left: 10, top: 2, color: hitMarker === "kill" ? "#FF3B30" : "#F1F5F9" }}>
                ✕
              </span>
            )}
          </div>
        </div>
      )}

      {/* wave */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 text-center">
        <div className="hud-label flex items-center justify-center gap-2 text-[#94A3B8]">
          <Waves size={14} /> WAVE
        </div>
        <div className="font-head text-4xl font-black text-[#E6B325]" data-testid="hud-wave">{wave}</div>
        <div className="hud-label mt-1 flex items-center justify-center gap-1 text-[#64748B]">
          <Skull size={12} /> {enemyCount} on the hunt
        </div>
      </div>

      {/* score */}
      <div className="absolute right-6 top-6 text-right">
        <div className="hud-label text-[#94A3B8]">SCORE</div>
        <div className="font-mono2 text-3xl font-bold text-[#F1F5F9]" data-testid="hud-score">{score.toLocaleString()}</div>
        <div className="mt-2 flex items-center justify-end gap-2 text-[#94A3B8]">
          <Target size={14} />
          <span className="font-mono2 text-lg" data-testid="hud-kills">{kills}</span>
        </div>
      </div>

      {/* player + audio state */}
      <div className="absolute left-6 top-6">
        <div className="hud-label text-[#64748B]">SURVIVOR</div>
        <div className="font-head text-xl font-bold tracking-wide text-[#F1F5F9]" data-testid="hud-player-name">{player?.name}</div>
        <div className="mt-2 flex items-center gap-1 text-[#64748B]" data-testid="hud-audio-state">
          {audioPrefs.muted ? <VolumeX size={14} className="text-[#FF3B30]" /> : <Volume2 size={14} />}
          <span className="hud-label">{audioPrefs.muted ? "MUTED" : `${Math.round(audioPrefs.volume * 100)}%`} · [M]</span>
        </div>
      </div>

      {/* notices */}
      {notice && (
        <div key={notice.id} className="absolute bottom-44 left-1/2 -translate-x-1/2 text-center" style={{ animation: "notice-fade 2.2s ease-out forwards" }} data-testid="hud-notice">
          <div className="font-head text-2xl font-black tracking-widest" style={{ color: notice.color, textShadow: "0 0 18px rgba(0,0,0,0.9)" }}>
            {notice.text}
          </div>
        </div>
      )}

      {/* health */}
      <div className="absolute bottom-6 left-6 w-72" data-testid="hud-health-bar">
        <div className="hud-label mb-1 flex items-center gap-2 text-[#94A3B8]">
          <Heart size={14} style={{ color: healthColor }} /> VITALITY
        </div>
        <div className="h-4 w-full overflow-hidden rounded-sm border border-white/10 bg-black/60">
          <div className="h-full transition-all duration-200" style={{ width: `${health}%`, backgroundColor: healthColor }} />
        </div>
        <div className="font-mono2 mt-1 text-lg font-bold" style={{ color: healthColor }} data-testid="hud-health-value">{health}</div>
      </div>

      <WeaponPanel weaponKey={weaponKey} ammo={ammo} reloading={reloading} onSelectWeapon={onSelectWeapon} />

      {/* css viewmodel (hidden when a weapon .glb is provided) */}
      {phase === "playing" && !hasWeaponModel && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <div
            className="rounded-t-sm bg-gradient-to-t from-[#15181c] to-[#2a2f36] shadow-2xl"
            style={{
              width: weaponKey === "shotgun" ? 84 : weaponKey === "marksman" ? 48 : 64,
              height: weaponKey === "marksman" ? 128 : 96,
              borderTop: `3px solid ${WEAPONS[weaponKey].color}`,
              transform: muzzle ? "translateY(8px)" : "translateY(0)",
              transition: "transform 60ms, width 150ms, height 150ms",
            }}
          />
        </div>
      )}

      {!locked && phase === "playing" && (
        <PauseOverlay audioPrefs={audioPrefs} onVolume={onVolume} onToggleMute={onToggleMute} onResume={onResume} onExit={onExit} />
      )}
    </div>
  );
}
