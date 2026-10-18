"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/logo";

const input = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><label className="text-sm font-medium text-ink">{label}</label>{children}</div>;
}

function Pwd({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} required value={value} onChange={(e) => onChange(e.target.value)} placeholder="••••••••" className={input} />
      <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}

export default function RegisterPage() {
  const [f, setF] = useState({ name: "", username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const set = (k: keyof typeof f) => (v: string) => setF({ ...f, [k]: v });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (f.password !== f.confirm) return setError("Les mots de passe ne correspondent pas");
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: f.name, username: f.username, email: f.email, password: f.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { window.location.href = "/dashboard"; return; }
      setError(data.error ?? `Erreur ${res.status}`);
    } catch {
      setError("Impossible de joindre le serveur");
    }
    setLoading(false);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-mist p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 shadow-xl ring-1 ring-slate-100">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="pt-2 text-center text-2xl font-bold">Créer un compte</h1>
        <p className="text-center text-sm text-slate-500">Rejoignez la communauté et commencez à prédire !</p>
        <Field label="Nom"><input required value={f.name} onChange={(e) => set("name")(e.target.value)} placeholder="Votre nom" className={input} /></Field>
        <Field label="Prénom / Pseudo"><input required value={f.username} onChange={(e) => set("username")(e.target.value)} placeholder="Votre pseudo" className={input} /></Field>
        <Field label="Email"><input type="email" required value={f.email} onChange={(e) => set("email")(e.target.value)} placeholder="votre@email.com" className={input} /></Field>
        <Field label="Mot de passe"><Pwd value={f.password} onChange={set("password")} /></Field>
        <Field label="Confirmer le mot de passe"><Pwd value={f.confirm} onChange={set("confirm")} /></Field>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-300 hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Création..." : "Créer mon compte"}
        </button>
      </form>
      <p className="mt-5 text-sm text-slate-600">Déjà un compte ? <Link href="/login" className="font-semibold text-brand">Se connecter</Link></p>
    </main>
  );
}
