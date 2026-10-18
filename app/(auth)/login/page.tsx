"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock } from "lucide-react";
import { Logo } from "@/components/logo";

const bg = {
  backgroundColor: "#0b2447",
  backgroundImage:
    "linear-gradient(180deg, rgba(8,27,63,.35), rgba(8,40,30,.35)), url('/hero.png'), linear-gradient(180deg,#123a78 0%,#1b4f8f 45%,#1d6b3a 100%)",
  backgroundSize: "cover",
  backgroundPosition: "center",
};
const input = "w-full rounded-xl border bg-white px-4 py-3 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
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
    <main style={bg} className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="pt-2 text-center text-2xl font-bold">Bienvenue 👋</h1>
        <p className="text-center text-sm text-slate-500">Connectez-vous pour accéder à votre compte</p>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-slate-600"><Mail size={14} /> Email</label>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="votre@email.com" className={input} />
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-sm text-slate-600"><Lock size={14} /> Mot de passe</label>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={input} />
        </div>
        <p className="text-right text-xs font-medium text-brand">Mot de passe oublié ?</p>
        {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={loading} className="w-full rounded-xl bg-brand py-3.5 text-sm font-semibold text-white shadow-md shadow-blue-300 hover:bg-blue-700 disabled:opacity-60">
          {loading ? "Connexion..." : "Se connecter"}
        </button>
        <div className="border-t pt-4 text-center text-sm text-slate-500">
          Pas encore de compte ?
          <Link href="/register" className="mt-3 block rounded-xl border border-blue-200 py-3 font-semibold text-brand hover:bg-blue-50">Créer un compte</Link>
        </div>
      </form>
    </main>
  );
}

