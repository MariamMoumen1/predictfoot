import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/db";
import { getPrediction } from "@/lib/predict";
import { requireUser, formatTime, formatDay } from "@/lib/data";
import { TeamBadge } from "@/components/team-badge";
import { PredictionForm } from "@/components/prediction-form";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const match = await prisma.match.findUnique({ where: { id: Number(id) }, include: { home: true, away: true } });
  if (!match) notFound();

  const existing = await prisma.prediction.findUnique({ where: { userId_matchId: { userId: user.id, matchId: match.id } } });
  const ai = await getPrediction(match.home, match.away);
  const locked = match.status !== "SCHEDULED" || match.kickoff <= new Date();

  const bars = [
    { label: match.home.name, value: ai.home, dot: "bg-amber-400", fill: "bg-gradient-to-r from-emerald-500 to-blue-600" },
    { label: "Nul", value: ai.draw, dot: "bg-emerald-600", fill: "bg-blue-400" },
    { label: match.away.name, value: ai.away, dot: "bg-red-500", fill: "bg-red-300" },
  ];

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Link href="/matches" className="flex items-center justify-end gap-1 text-sm font-medium text-brand">
        <ArrowLeft size={16} /> Retour
      </Link>

      <div className="space-y-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="flex justify-between text-xs text-slate-500">
          <span>{match.league}</span>
          <span>{formatDay(match.kickoff)} · {formatTime(match.kickoff)}</span>
        </div>

        <div className="flex items-center justify-around">
          <div className="flex flex-col items-center gap-2">
            <TeamBadge name={match.home.name} logo={match.home.logo} size={84} />
            <span className="font-bold text-[#0b3a9e]">{match.home.name}</span>
          </div>
          <span className="text-xl font-bold">VS</span>
          <div className="flex flex-col items-center gap-2">
            <TeamBadge name={match.away.name} logo={match.away.logo} size={84} />
            <span className="font-bold text-[#0b3a9e]">{match.away.name}</span>
          </div>
        </div>

        {locked ? (
          <p className="text-sm text-slate-500">Ce match a commencé : les prédictions sont fermées.</p>
        ) : (
          <PredictionForm
            matchId={match.id} home={match.home.name} away={match.away.name}
            initial={existing ? { outcome: existing.outcome, homeScore: existing.homeScore, awayScore: existing.awayScore } : null}
          />
        )}

        <div className="rounded-2xl border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-[#0b3a9e]">Prédiction du modèle (IA)</h2>
            <span className="text-xs text-slate-500">Modèle : {ai.model}</span>
          </div>
          <div className="space-y-4">
            {bars.map((b) => (
              <div key={b.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <i className={`size-5 rounded-full ${b.dot}`} /> {b.label}
                  </span>
                  <span className="font-bold">{b.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${b.fill}`} style={{ width: `${b.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-slate-500">Score le plus probable : {ai.likelyScore}</p>
        </div>
      </div>
    </div>
  );
}

