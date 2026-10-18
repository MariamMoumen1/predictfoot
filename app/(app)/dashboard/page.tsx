import Link from "next/link";
import { ChevronRight, Trophy, Shield, ShieldCheck, Award, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser, getStats, formatTime } from "@/lib/data";
import { StatCard } from "@/components/stat-card";
import { TeamBadge } from "@/components/team-badge";
import { UserAvatar } from "@/components/user-avatar";

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getStats(user.id, user.points);

  const [matches, top, memberships] = await Promise.all([
    prisma.match.findMany({
      where: { status: "SCHEDULED", kickoff: { gt: new Date() } },
      include: { home: true, away: true },
      orderBy: { kickoff: "asc" },
      take: 3,
    }),
    prisma.user.findMany({ orderBy: { points: "desc" }, take: 5 }),
    prisma.leagueMember.findMany({
      where: { userId: user.id },
      include: { league: { include: { members: { include: { user: true } } } } },
      take: 3,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Bonjour <span className="text-brand">{user.name}</span> 👋</h1>
        <p className="text-sm text-slate-500">Prête à faire tes prédictions ?</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={<Trophy size={30} className="text-amber-500" fill="currentColor" />} value={user.points.toLocaleString("fr-FR")} label="Points" />
        <StatCard icon={<Shield size={30} className="text-blue-600" fill="currentColor" />} value={`#${stats.rank}`} label="Classement" />
        <StatCard icon={<ShieldCheck size={30} className="text-emerald-600" />} value={`${stats.precision}%`} label="Précision" />
        <StatCard icon={<Award size={30} className="text-violet-600" />} value={stats.badges} label="Badges" />
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.1fr_1fr]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Prochains matchs</h2>
            <Link href="/matches" className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-brand">Voir tout</Link>
          </div>
          <div className="space-y-3">
            {matches.map((m) => (
              <div key={m.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center gap-3">
                  <TeamBadge name={m.home.name} logo={m.home.logo} size={42} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{m.home.name} vs {m.away.name}</p>
                    <p className="text-xs text-slate-500">{m.league} · {formatTime(m.kickoff)}</p>
                  </div>
                  <ChevronRight size={18} className="text-slate-400" />
                </div>
                <Link href={`/matches/${m.id}`} className="mt-3 block rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-blue-700">
                  Faire une prédiction
                </Link>
              </div>
            ))}
            {matches.length === 0 && <p className="rounded-2xl bg-white p-5 text-sm text-slate-500">Aucun match à venir.</p>}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Classement général</h2>
              <Link href="/leaderboard" className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-brand">Voir tout</Link>
            </div>
            <div className="space-y-1">
              {top.map((u, i) => (
                <div key={u.id} className={`flex items-center gap-3 rounded-lg px-2 py-2 ${u.id === user.id ? "bg-blue-50 font-semibold text-brand" : ""}`}>
                  <span className="w-5 text-center text-sm">{i === 0 ? <Trophy size={16} className="text-amber-500" fill="currentColor" /> : i + 1}</span>
                  <UserAvatar name={u.name} avatar={u.avatar} size={30} />
                  <span className="flex-1 text-sm">{u.name}</span>
                  <span className="text-xs text-slate-500">{u.points.toLocaleString("fr-FR")} pts</span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h2 className="mb-3 font-bold">Mes ligues</h2>
            <div className="space-y-2">
              {memberships.map(({ league }) => {
                const better = league.members.filter((m) => m.user.points > user.points).length;
                return (
                  <Link key={league.id} href="/leagues" className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50">
                    <span className="grid size-10 place-items-center rounded-full bg-blue-700 text-white"><Users size={18} /></span>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{league.name}</p>
                      <p className="text-xs text-slate-500">{league.members.length} {league.members.length > 1 ? "membres" : "membre"} · Vous : #{better + 1}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-400" />
                  </Link>
                );
              })}
              {memberships.length === 0 && <p className="text-sm text-slate-500">Aucune ligue pour le moment.</p>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}


