"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

export function LeagueActions({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "join" | null>(null);
  const [value, setValue] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit() {
    const isCreate = mode === "create";
    try {
      const res = await fetch(isCreate ? "/api/leagues" : "/api/leagues/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isCreate ? { name: value } : { code: value }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg({ ok: true, text: (isCreate ? "Ligue créée ✅" : "Ligue rejointe ✅") + (data.code ? ` Code d'invitation : ${data.code}` : "") });
        setValue("");
        router.refresh();
      } else setMsg({ ok: false, text: data.error ?? "Erreur" });
    } catch {
      setMsg({ ok: false, text: "Impossible de joindre le serveur" });
    }
  }

  const toggle = (m: "create" | "join") => { setMode(mode === m ? null : m); setMsg(null); setValue(""); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mes ligues</h1>
        <button onClick={() => toggle("create")} className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-300 hover:bg-blue-700">
          <Plus size={18} /> Créer une ligue
        </button>
      </div>

      {mode && (
        <div className="space-y-2 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex gap-2">
            <input value={value} onChange={(e) => setValue(e.target.value)} autoFocus
              placeholder={mode === "create" ? "Nom de la nouvelle ligue" : "Code d'invitation (ex : FRIENDS1)"}
              className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:border-brand" />
            <button onClick={submit} className="rounded-xl bg-brand px-6 text-sm font-semibold text-white hover:bg-blue-700">
              {mode === "create" ? "Créer" : "Rejoindre"}
            </button>
          </div>
          {msg && <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
        </div>
      )}

      {children}

      <button onClick={() => toggle("join")} className="w-full rounded-2xl border border-blue-200 bg-white py-4 text-sm font-semibold text-brand hover:bg-blue-50">
        Rejoindre une ligue
      </button>
    </div>
  );
}
