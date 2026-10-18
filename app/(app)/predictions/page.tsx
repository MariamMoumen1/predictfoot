import Link from "next/link";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/data";

const label = (o: string, home: string, away: string) => (o === "HOME" ? home : o === "AWAY" ? away : "Nul");

export default async function PredictionsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const user = await requireUser();
  const { tab = "pending" } = await searchParams;

  const predictions = await prisma.prediction.findMany({
    where: { userId: user.id, ...(tab === "history" ? { points: { not: null } } : { points: null }) },
    include: { match: { include: { home: true, away: true } } },
    orderBy: { match: { kickoff: tab === "history" ? "desc" : "asc" } },
  });

  const tabs = [{ key: "pending", label: "Mes prédictions" }, { key: "history", label: "Historique" }];

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold">Mes prédictions</h1>

      <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
        {tabs.map((t) => (
          <Link key={t.key} href={`/predictions?tab=${t.key}`}
            className={`rounded-xl px-8 py-2.5 text-sm font-medium ${tab === t.key ? "bg-brand text-white shadow-md shadow-blue-300" : "text-slate-600"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-slate-500">
            <tr>
              <th className="p-4 font-medium">Match</th>
              <th className="p-4 font-medium">Ma prédiction</th>
              <th className="p-4 font-medium">Résultat</th>
              <th className="p-4 text-right font-medium">Points</th>
              <th className="w-12 p-4" />
            </tr>
          </thead>
          <tbody>
            {predictions.map((p) => {
              const { home, away } = p.match;
              const mine = p.homeScore !== null && p.awayScore !== null ? `${p.homeScore} - ${p.awayScore}` : label(p.outcome, home.name, away.name);
              const result = p.match.homeScore !== null ? `${p.match.homeScore} - ${p.match.awayScore}` : "—";
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-4 font-medium">{home.name} - {away.name}</td>
                  <td className="p-4 font-bold">{mine}</td>
                  <td className="p-4 font-bold">{result}</td>
                  <td className="p-4 text-right font-bold">{p.points === null ? "—" : p.points > 0 ? `+${p.points}` : 0}</td>
                  <td className="p-4">
                    {p.isCorrect === null ? <Clock className="text-amber-500" size={22} />
                      : p.isCorrect ? <CheckCircle2 className="text-emerald-600" size={22} />
                      : <XCircle className="text-red-500" size={22} />}
                  </td>
                </tr>
              );
            })}
            {predictions.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Aucune prédiction ici pour le moment.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex gap-8 text-sm text-slate-500">
        <span className="flex items-center gap-2"><CheckCircle2 className="text-emerald-600" size={18} /> Correct</span>
        <span className="flex items-center gap-2"><XCircle className="text-red-500" size={18} /> Incorrect</span>
        <span className="flex items-center gap-2"><Clock className="text-amber-500" size={18} /> En attente</span>
      </div>
    </div>
  );
}
