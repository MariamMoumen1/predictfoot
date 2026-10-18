"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, CalendarDays, Target, Trophy, Users, Award, Settings, User } from "lucide-react";

const main = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Matchs", href: "/matches", icon: CalendarDays },
  { label: "Mes prédictions", href: "/predictions", icon: Target },
  { label: "Classement", href: "/leaderboard", icon: Trophy },
  { label: "Mes ligues", href: "/leagues", icon: Users },
  { label: "Badges", href: "/badges", icon: Award },
];

const mobile = [
  { label: "Accueil", href: "/dashboard", icon: LayoutDashboard },
  { label: "Matchs", href: "/matches", icon: CalendarDays },
  { label: "Prédire", href: "/predictions", icon: Target },
  { label: "Classement", href: "/leaderboard", icon: Trophy },
  { label: "Profil", href: "/profile", icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();
  const cls = (href: string) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
      pathname.startsWith(href) ? "bg-brand font-semibold text-white shadow-lg shadow-blue-900/40" : "text-white/80 hover:bg-white/10"
    }`;
  return (
    <div className="flex flex-1 flex-col">
      <nav className="flex flex-col gap-1.5">
        {main.map(({ label, href, icon: Icon }) => (
          <Link key={href} href={href} className={cls(href)}>
            <Icon size={18} /> {label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1.5">
        <Link href="/settings" className={cls("/settings")}>
          <Settings size={18} /> Paramètres
        </Link>
      </div>
    </div>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex justify-around rounded-t-3xl border-t bg-white py-2.5 shadow-[0_-4px_20px_rgba(15,40,100,0.08)] md:hidden">
      {mobile.map(({ label, href, icon: Icon }) => (
        <Link key={href} href={href} className={`flex flex-col items-center gap-0.5 text-[11px] ${pathname.startsWith(href) ? "font-semibold text-brand" : "text-slate-500"}`}>
          <Icon size={22} /> {label}
        </Link>
      ))}
    </nav>
  );
}
