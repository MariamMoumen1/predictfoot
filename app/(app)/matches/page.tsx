import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getPrediction } from "@/lib/predict";
import { requireUser, formatTime, formatDay } from "@/lib/data";
import { TeamBadge } from "@/components/team-badge";

const filters = [
  { key: "all", label: "Tous" },
  { key: "today", label: "Aujourd'hui" },
  { key: "tomorrow", label: "Demain" },
  { key: "finished", label: "Terminés" },
];

export default async function MatchesPage({ searchParams }: { searchParams: Promise<{ filter?: string }> }) {
  const user = await requireUser();
  const { filter = "all" } = await searchParams;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const day = (n: number) => new Date(start.getTime() + n * 86400000);

  const where: Prisma.MatchWhereInput =
    filter === "today" ? { kickoff: { gte: day(0), lt: day(1) } }
    : filter === "tomorrow" ? { kickoff: { gte: day(1), lt: day(2) } }
    : filter === "finished" ? { status: "FINISHED" }
    : { status: { not: "FINISHED" } };

  const [matches, mine] = await Promise.all([
    prisma.match.findMany({
      where,
      include: { home: true, away: true },
      orderBy: { kickoff: filter === "finished" ? "desc" : "asc" },
      take: 20,
    }),
    prisma.prediction.findMany({ where: { userId: user.id } }),
  ]);
  const predicted = new Set(mine.map((p) => p.matchId));
  const aiList = await Promise.all(matches.map((m) => getPrediction(m.home, m.away)));
  const now = new Date();

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Matchs</h1>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link key={f.key} href={`/matches?filter=${f.key}`}
            className={`rounded-full px-5 py-2 text-sm font-medium ${filter === f.key ? "bg-brand text-white shadow-md shadow-blue-300" : "bg-white text-slate-600 ring-1 ring-slate-100 hover:bg-slate-50"}`}>
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-4">
        {matches.map((m, i) => {
          const ai = aiList[i];
          const live = m.status === "LIVE";
          const finished = m.status === "FINISHED";
          const started = live || finished;
          const open = !started && m.kickoff > now;
          return (
            <div key={m.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
              <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <i className="size-1.5 rounded-full bg-red-500" />
                    <i className="h-px w-3 bg-amber-400" />
                    <i className="size-1.5 rounded-full bg-emerald-600" />
                  </span>
                  {m.league}
                </span>
                {live ? (
                  <span className="flex items-center gap-1.5 font-semibold text-red-600">
                    <i className="size-2 animate-pulse rounded-full bg-red-600" /> EN DIRECT
                  </span>
                ) : (
                  <span>{finished ? "Terminé · " : ""}{formatDay(m.kickoff)} · {formatTime(m.kickoff)}</span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <TeamBadge name={m.home.name} logo={m.home.logo} size={44} />
                <span className="font-semibold">{m.home.name}</span>
                <span className={`mx-1 grid h-9 min-w-9 place-items-center rounded-full border px-3 text-sm font-bold ${live ? "border-red-200 text-red-600" : "border-pink-200 text-slate-500"}`}>
                  {started ? `${m.homeScore ?? 0} - ${m.awayScore ?? 0}` : "vs"}
                </span>
                <span className="font-semibold">{m.away.name}</span>
                <TeamBadge name={m.away.name} logo={m.away.logo} size={44} />
                <ChevronRight size={18} className="ml-auto text-slate-400" />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  IA : {m.home.name} {ai.home}% | Nul {ai.draw}% | {m.away.name} {ai.away}%
                </p>
                {open && (
                  <Link href={`/matches/${m.id}`} className="rounded-xl bg-brand px-8 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
                    {predicted.has(m.id) ? "Modifier ma prédiction" : "Prédire maintenant"}
                  </Link>
                )}
              </div>
            </div>
          );
        })}
        {matches.length === 0 && (
          <p className="text-sm text-slate-500">Aucun match pour ce filtre (la première synchronisation peut prendre quelques secondes).</p>
        )}
      </div>
    </div>
  );
}
