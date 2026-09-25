import React, { useState } from "react";
import { X } from "lucide-react";
import { CREATURE_LIST } from "../data/creatures";
import { LORE_TIMELINE } from "../data/lore";
import { Shell } from "./Menu";

export default function LoreCodex({ onBack }) {
  const [selected, setSelected] = useState(null);

  return (
    <Shell title="Island Codex" onBack={onBack}>
      <p className="mb-8 max-w-2xl font-lore text-lg italic text-[#94A3B8]">
        The Mire dreams, and its dreams take flesh. These are the beasts that walk Hog Island — and
        the history that made them monstrous.
      </p>

      <h3 className="mb-4 font-head text-2xl font-bold uppercase tracking-wide text-[#E6B325]">Bestiary</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CREATURE_LIST.map((c) => (
          <button
            key={c.key}
            data-testid={`codex-card-${c.key}`}
            onClick={() => setSelected(c)}
            className="group rounded-md border border-white/10 bg-[#12181F]/80 p-5 text-left backdrop-blur-md transition-all hover:-translate-y-1 hover:border-white/20"
          >
            <div className="flex items-start justify-between">
              <div
                className="h-10 w-10 rounded-sm border border-white/10"
                style={{ backgroundColor: c.color, boxShadow: `0 0 14px ${c.eye}55` }}
              />
              <span
                className="hud-label rounded-full px-2 py-1"
                style={{ color: c.threatColor, border: `1px solid ${c.threatColor}55` }}
              >
                {c.threat}
              </span>
            </div>
            <h4 className="mt-4 font-head text-xl font-bold">{c.name}</h4>
            <p className="font-lore text-sm italic text-[#64748B]">{c.epithet}</p>
            <div className="hud-label mt-3 flex gap-3 text-[#94A3B8]">
              <span>HP {c.hp}</span>
              <span>DMG {c.damage}</span>
              <span>{c.points}pts</span>
            </div>
          </button>
        ))}
      </div>

      <h3 className="mb-4 mt-14 font-head text-2xl font-bold uppercase tracking-wide text-[#10B981]">
        Chronicle of the Mire
      </h3>
      <div className="space-y-6 border-l border-white/10 pl-6">
        {LORE_TIMELINE.map((t, i) => (
          <div key={i} className="relative">
            <span className="absolute -left-[31px] top-1.5 h-3 w-3 rounded-full bg-[#10B981]" />
            <div className="hud-label text-[#64748B]">{t.era}</div>
            <div className="font-head text-xl font-bold text-[#F1F5F9]">{t.title}</div>
            <p className="mt-1 max-w-2xl font-lore text-base italic text-[#94A3B8]">{t.text}</p>
          </div>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-lg"
          onClick={() => setSelected(null)}
          data-testid="codex-detail-modal"
        >
          <div
            className="relative max-w-lg rounded-md border border-white/10 bg-[#12181F] p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              data-testid="codex-modal-close"
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-[#64748B] hover:text-[#F1F5F9]"
            >
              <X size={20} />
            </button>
            <div
              className="h-16 w-16 rounded-sm border border-white/10"
              style={{ backgroundColor: selected.color, boxShadow: `0 0 24px ${selected.eye}66` }}
            />
            <h3 className="mt-5 font-head text-3xl font-black uppercase">{selected.name}</h3>
            <p className="font-lore text-lg italic text-[#E6B325]">{selected.epithet}</p>
            <p className="mt-4 font-lore text-base italic leading-relaxed text-[#94A3B8]">{selected.lore}</p>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center">
              {[
                ["HP", selected.hp],
                ["Damage", selected.damage],
                ["Bounty", `${selected.points}`],
              ].map(([l, v]) => (
                <div key={l} className="rounded-sm border border-white/10 bg-black/40 py-3">
                  <div className="hud-label text-[#64748B]">{l}</div>
                  <div className="font-mono2 text-xl font-bold text-[#F1F5F9]">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
