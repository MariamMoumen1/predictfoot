"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown } from "lucide-react";

type Outcome = "HOME" | "DRAW" | "AWAY";

export function PredictionForm({
  matchId, home, away, initial,
}: {
  matchId: number; home: string; away: string;
  initial: { outcome: Outcome; homeScore: number | null; awayScore: number | null } | null;
}) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome | null>(initial?.outcome ?? null);
  const [hs, setHs] = useState(initial?.homeScore?.toString() ?? "");
  const [aw, setAw] = useState(initial?.awayScore?.toString() ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const options: { key: Outcome; label: string }[] = [
    { key: "HOME", label: `Victoire ${home}` },
    { key: "DRAW", label: "Match nul" },
    { key: "AWAY", label: `Victoire ${away}` },
  ];

  async function submit() {
    if (!outcome) return setMsg({ ok: false, text: "Choisis un résultat" });
    setLoading(true);
    setMsg(null);
    const res = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId, outcome,
        homeScore: hs === "" || aw === "" ? null : Number(hs),
        awayScore: hs === "" || aw === "" ? null : Number(aw),
      }),
    });
    setLoading(false);
    if (res.ok) {
      setMsg({ ok: true, text: "Prédiction enregistrée ✅" });
      router.refresh();
      setTimeout(() => router.push("/predictions"), 800);
    } else {
      setMsg({ ok: false, text: (await res.json()).error ?? "Erreur" });
    }
  }

  const nums = Array.from({ length: 10 }, (_, i) => i);
  const sel = "w-full appearance-none rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-brand";

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 font-semibold text-ink">Votre prédiction</p>
        <div className="grid grid-cols-3 gap-2">
          {options.map((o) => (
            <button key={o.key} type="button" onClick={() => setOutcome(o.key)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-xs font-medium sm:text-sm ${outcome === o.key ? "border-brand bg-blue-50 text-brand shadow-sm" : "bg-white text-slate-600"}`}>
              <span className={`grid size-5 shrink-0 place-items-center rounded-full ${outcome === o.key ? "bg-brand text-white" : "bg-slate-200"}`}>
                {outcome === o.key && <Check size={12} />}
              </span>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 font-semibold text-ink">Score exact (optionnel)</p>
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <select value={hs} onChange={(e) => setHs(e.target.value)} className={sel}>
              <option value="">—</option>
              {nums.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
          <span className="text-slate-500">-</span>
          <div className="relative flex-1">
            <select value={aw} onChange={(e) => setAw(e.target.value)} className={sel}>
              <option value="">—</option>
              {nums.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
        <p className="mt-1 text-xs text-slate-500">Bon résultat = 10 pts · Score exact = 15 pts</p>
      </div>

      {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}

      <button onClick={submit} disabled={loading}
        className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-300 hover:bg-blue-700 disabled:opacity-60">
        {loading ? "Envoi..." : "Valider ma prédiction"}
      </button>
    </div>
  );
}
