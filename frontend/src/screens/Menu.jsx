import React, { useState, useEffect, useMemo } from "react";
import { Skull, Trophy, Gamepad2, ScrollText, LogOut, ArrowLeft, Crosshair } from "lucide-react";
import { PROLOGUE } from "../data/lore";

const IMG = "https://images.pexels.com/photos/10490155/pexels-photo-10490155.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1400";

function Landing({ onLogin }) {
  const [name, setName] = useState("");
  const [line, setLine] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (line >= PROLOGUE.length - 1) return;
    const t = setTimeout(() => setLine((l) => l + 1), 2200);
    return () => clearTimeout(t);
  }, [line]);

  const submit = async () => {
    if (!name.trim() || loading) return;
    setLoading(true);
    try {
      await onLogin(name.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090C0F] text-[#F1F5F9]">
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#090C0F] via-[#090C0F]/70 to-transparent" />
      <div className="fog-layer" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
        <div className="mb-2 flex items-center gap-3 text-[#E6B325]">
          <Skull size={26} />
          <span className="hud-label text-[#94A3B8]">A Survival Shooter</span>
        </div>
        <h1 className="font-head text-6xl font-black uppercase leading-none tracking-wider sm:text-7xl lg:text-8xl">
          Hog <span className="text-[#FF3B30]">Island</span>
        </h1>

        <div className="mt-10 min-h-[120px] max-w-xl space-y-3">
          {PROLOGUE.slice(0, line + 1).map((p, i) => (
            <p
              key={i}
              className="font-lore text-lg italic text-[#94A3B8] transition-opacity duration-700"
              style={{ opacity: 1 }}
            >
              {p}
            </p>
          ))}
        </div>

        <div className="mt-10 max-w-md">
          <label className="hud-label mb-2 block text-[#64748B]">Carve your name into the ledger</label>
          <div className="flex gap-3">
            <input
              data-testid="guest-name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              maxLength={20}
              placeholder="Survivor name…"
              className="flex-1 rounded-sm border border-white/10 bg-black/50 px-4 py-3 font-body text-[#F1F5F9] outline-none transition-colors focus:border-[#E6B325]/60"
            />
            <button
              data-testid="enter-island-button"
              onClick={submit}
              disabled={!name.trim() || loading}
              className="rounded-sm bg-[#FF3B30] px-8 py-3 font-head text-lg font-bold uppercase tracking-wider text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? "…" : "Enter"}
            </button>
          </div>
          <p className="hud-label mt-3 text-[#64748B]">No account needed — play as a guest.</p>
        </div>
      </div>
    </div>
  );
}

function Shell({ children, title, onBack }) {
  return (
    <div className="relative min-h-screen bg-[#090C0F] text-[#F1F5F9]">
      <div className="fog-layer opacity-30" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-10">
        <button
          data-testid="back-button"
          onClick={onBack}
          className="mb-6 inline-flex items-center gap-2 text-sm text-[#94A3B8] transition-colors hover:text-[#E6B325]"
        >
          <ArrowLeft size={16} /> Back
        </button>
        {title && (
          <h2 className="mb-8 font-head text-4xl font-black uppercase tracking-wide">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}

function MainMenu({ player, onPlay, onBooth, onPractice, onLeaderboard, onLore, onLogout }) {
  const cards = [
    {
      key: "practice",
      icon: Crosshair,
      title: "Canvas Practice Range",
      desc: "The original target drills, weapons, levels, and local progress.",
      action: onPractice,
      color: "#f59e0b",
      testid: "menu-practice-button",
    },
    {
      key: "play",
      icon: Gamepad2,
      title: "3D Island Hunt",
      desc: "Descend into the fog. Survive the endless waves. Post your score.",
      action: onPlay,
      color: "#FF3B30",
      testid: "menu-play-button",
    },
    {
      key: "booth",
      icon: Crosshair,
      title: "Training Booth",
      desc: "Dial in 18 calibers from 25 to 1,000 yards. Running hogs, wind, five skill levels.",
      action: onBooth,
      color: "#06b6d4",
      testid: "menu-booth-button",
    },
    {
      key: "board",
      icon: Trophy,
      title: "Global Ledger",
      desc: "The island remembers every hunter. See who tops the leaderboard.",
      action: onLeaderboard,
      color: "#E6B325",
      testid: "menu-leaderboard-button",
    },
    {
      key: "lore",
      icon: ScrollText,
      title: "Island Codex",
      desc: "Study the shape-shifting beasts and the lore of the Mire.",
      action: onLore,
      color: "#10B981",
      testid: "menu-lore-button",
    },
  ];
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090C0F] text-[#F1F5F9]">
      <div
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: `url(${IMG})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#090C0F]/60 to-[#090C0F]" />
      <div className="fog-layer" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[#E6B325]">
            <Skull size={22} />
            <span className="font-head text-2xl font-black uppercase tracking-widest">Hog Island</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-[#94A3B8]">
              Survivor <span className="font-head font-bold text-[#F1F5F9]">{player.name}</span>
            </span>
            <button
              data-testid="logout-button"
              onClick={onLogout}
              className="inline-flex items-center gap-1 text-sm text-[#64748B] transition-colors hover:text-[#FF3B30]"
            >
              <LogOut size={14} /> Leave
            </button>
          </div>
        </div>

        <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <button
              key={c.key}
              data-testid={c.testid}
              onClick={c.action}
              className="group relative overflow-hidden rounded-md border border-white/10 bg-[#12181F]/80 p-8 text-left backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20"
              style={{ animationDelay: `${i * 90}ms` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-1 opacity-70"
                style={{ backgroundColor: c.color }}
              />
              <c.icon size={34} style={{ color: c.color }} />
              <h3 className="mt-6 font-head text-2xl font-bold uppercase tracking-wide">{c.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export { Landing, Shell, MainMenu };
