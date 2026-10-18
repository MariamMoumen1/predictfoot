import Link from "next/link";
import { Trophy } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser, daysAgo } from "@/lib/data";
import { UserAvatar } from "@/components/user-avatar";

export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  const user = await requireUser();
  const { period = "global" } = await searchParams;

  const since = period === "week" ? daysAgo(7) : period === "month" ? daysAgo(30) : null;

  let rows: { id: string; name: string; avatar: string | null; points: number }[];
  if (since) {
    const grouped = await prisma.prediction.groupBy({
      by: ["userId"],
      where: { points: { not: null }, match: { kickoff: { gte: since } } },
      _sum: { points: true },
    });
    const users = await prisma.user.findMany();
    rows = users
      .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, points: grouped.find((g) => g.userId === u.id)?._sum.points ?? 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 20);
  } else {
    rows = await prisma.user.findMany({ orderBy: { points: "desc" }, take: 20, select: { id: true, name: true, avatar: true, points: true } });
  }

  const tabs = [{ key: "global", label: "Global" }, { key: "week", label: "Cette semaine" }, { key: "month", label: "Ce mois" }];

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Classement</h1>

      <div className="grid grid-cols-3 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
        {tabs.map((t) => (
          <Link key={t.key} href={`/leaderboard?period=${t.key}`}
            className={`rounded-xl py-2.5 text-center text-sm font-medium ${period === t.key ? "bg-brand text-white shadow-md shadow-blue-300" : "text-slate-600"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        <div className="flex px-4 py-3 text-xs text-slate-500">
          <span className="w-12">#</span><span className="flex-1">Joueur</span><span>Points</span>
        </div>
        {rows.map((r, i) => (
          <div key={r.id} className={`flex items-center rounded-lg px-4 py-3 ${r.id === user.id ? "bg-blue-50 font-semibold text-brand" : ""}`}>
            <span className="w-12 text-sm font-bold">{i === 0 && r.points > 0 ? <Trophy size={18} className="text-amber-500" fill="currentColor" /> : i + 1}</span>
            <span className="flex flex-1 items-center gap-3 text-sm"><UserAvatar name={r.name} avatar={r.avatar} size={36} /> {r.name}</span>
            <span className="text-sm">{r.points.toLocaleString("fr-FR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
