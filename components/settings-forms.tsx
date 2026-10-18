"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
const btn = "rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md shadow-blue-300 hover:bg-blue-700 disabled:opacity-60";

type Msg = { ok: boolean; text: string } | null;

async function send(url: string, method: string, body: object): Promise<Msg> {
  try {
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    return res.ok ? { ok: true, text: "Enregistré ✅" } : { ok: false, text: data.error ?? `Erreur ${res.status}` };
  } catch {
    return { ok: false, text: "Impossible de joindre le serveur" };
  }
}

function Feedback({ msg }: { msg: Msg }) {
  return msg ? <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p> : null;
}

export function ProfileForm({ initial }: { initial: { name: string; username: string; email: string } }) {
  const router = useRouter();
  const [f, setF] = useState(initial);
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const m = await send("/api/me", "PATCH", f);
    setMsg(m);
    setLoading(false);
    if (m?.ok) router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><label className="text-sm font-medium">Nom</label>
        <input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} required /></div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Pseudo</label>
        <input className={input} value={f.username} onChange={(e) => setF({ ...f, username: e.target.value })} required /></div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Email</label>
        <input type="email" className={input} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} required /></div>
      <Feedback msg={msg} />
      <button disabled={loading} className={btn}>{loading ? "Enregistrement..." : "Enregistrer"}</button>
    </form>
  );
}

export function PasswordForm() {
  const [f, setF] = useState({ current: "", next: "", confirm: "" });
  const [msg, setMsg] = useState<Msg>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.next !== f.confirm) return setMsg({ ok: false, text: "Les mots de passe ne correspondent pas" });
    setLoading(true);
    const m = await send("/api/me/password", "POST", { current: f.current, next: f.next });
    setMsg(m);
    setLoading(false);
    if (m?.ok) setF({ current: "", next: "", confirm: "" });
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5"><label className="text-sm font-medium">Mot de passe actuel</label>
        <input type="password" className={input} value={f.current} onChange={(e) => setF({ ...f, current: e.target.value })} required /></div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Nouveau mot de passe</label>
        <input type="password" className={input} value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} required /></div>
      <div className="space-y-1.5"><label className="text-sm font-medium">Confirmer</label>
        <input type="password" className={input} value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} required /></div>
      <Feedback msg={msg} />
      <button disabled={loading} className={btn}>{loading ? "Modification..." : "Changer le mot de passe"}</button>
    </form>
  );
}
