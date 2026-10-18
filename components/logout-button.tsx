"use client";

import { LogOut } from "lucide-react";

export function LogoutButton({ variant = "sidebar" }: { variant?: "sidebar" | "row" }) {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  if (variant === "row") {
    return (
      <button onClick={logout} className="flex w-full items-center gap-3 rounded-2xl bg-red-50 px-5 py-5 text-left font-semibold text-red-600 hover:bg-red-100">
        <LogOut size={20} /> Déconnexion
      </button>
    );
  }
  return (
    <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/80 hover:bg-white/10">
      <LogOut size={18} /> Déconnexion
    </button>
  );
}
