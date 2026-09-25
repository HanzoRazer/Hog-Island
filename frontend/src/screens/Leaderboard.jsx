import React, { useState, useEffect } from "react";
import { Trophy, Crown, Medal, Loader2 } from "lucide-react";
import { getLeaderboard } from "../lib/api";
import { Shell } from "./Menu";

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function Leaderboard({ player, onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLeaderboard(50)
      .then(setRows)
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  const podium = rows.slice(0, 3);
  const rest = rows.slice(3);
  const podiumColors = ["#E6B325", "#94A3B8", "#b06a34"];
  const podiumIcons = [Crown, Medal, Medal];

  return (
    <Shell title="Global Ledger" onBack={onBack}>
      {loading ? (
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <Loader2 className="animate-spin" size={18} /> Reading the island's ledger…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-md border border-white/10 bg-[#12181F]/80 p-10 text-center">
          <Trophy size={40} className="mx-auto text-[#64748B]" />
          <p className="mt-4 text-[#94A3B8]">The ledger is empty. Be the first name carved into it.</p>
        </div>
      ) : (
        <>
          <div className="mb-10 grid gap-4 sm:grid-cols-3" data-testid="leaderboard-podium">
            {podium.map((r, i) => {
              const Icon = podiumIcons[i];
              return (
                <div
                  key={r.player_id}
                  className="rounded-md border border-white/10 bg-[#12181F]/80 p-6 text-center backdrop-blur-md"
                  style={{ borderTopColor: podiumColors[i], borderTopWidth: 3 }}
                >
                  <Icon size={28} className="mx-auto" style={{ color: podiumColors[i] }} />
                  <div className="mt-3 truncate font-head text-xl font-bold">{r.name}</div>
                  <div className="font-mono2 mt-2 text-3xl font-bold" style={{ color: podiumColors[i] }}>
                    {r.score.toLocaleString()}
                  </div>
                  <div className="hud-label mt-2 text-[#64748B]">
                    {r.kills} kills · wave {r.wave} · {fmtTime(r.survival_time)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="overflow-hidden rounded-md border border-white/10 bg-[#12181F]/60" data-testid="leaderboard-table">
            <table className="w-full text-left">
              <thead>
                <tr className="hud-label border-b border-white/10 text-[#64748B]">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Survivor</th>
                  <th className="px-5 py-3 text-right">Score</th>
                  <th className="px-5 py-3 text-right">Kills</th>
                  <th className="px-5 py-3 text-right">Wave</th>
                  <th className="px-5 py-3 text-right">Survived</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((r) => {
                  const mine = r.player_id === player?.id;
                  return (
                    <tr
                      key={r.player_id}
                      className={`border-b border-white/5 text-sm ${mine ? "bg-[#E6B325]/10" : ""}`}
                    >
                      <td className="px-5 py-3 font-mono2 text-[#94A3B8]">{r.rank}</td>
                      <td className="px-5 py-3 font-head font-semibold">
                        {r.name} {mine && <span className="text-xs text-[#E6B325]">(you)</span>}
                      </td>
                      <td className="px-5 py-3 text-right font-mono2 font-bold text-[#F1F5F9]">
                        {r.score.toLocaleString()}
                      </td>
                      <td className="px-5 py-3 text-right font-mono2 text-[#94A3B8]">{r.kills}</td>
                      <td className="px-5 py-3 text-right font-mono2 text-[#94A3B8]">{r.wave}</td>
                      <td className="px-5 py-3 text-right font-mono2 text-[#94A3B8]">{fmtTime(r.survival_time)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Shell>
  );
}
