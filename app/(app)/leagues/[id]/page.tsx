import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Trophy } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/data";
import { UserAvatar } from "@/components/user-avatar";

export default async function LeagueDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const leagueId = Number(id);
  if (!Number.isInteger(leagueId)) notFound();

  const league = await prisma.league.findUnique({
    where: { id: leagueId },
    include: { members: { include: { user: true } } },
  });
  if (!league) notFound();
  if (!league.members.some((m) => m.userId === user.id)) redirect("/leagues");

  const rows = league.members.map((m) => m.user).sort((a, b) => b.points - a.points);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/leagues" className="flex items-center gap-1 text-sm font-medium text-brand">
        <ArrowLeft size={16} /> Mes ligues
      </Link>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-2xl font-bold">{league.name}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {rows.length} {rows.length > 1 ? "membres" : "membre"} · Code d&apos;invitation :{" "}
          <span className="font-mono font-semibold text-ink">{league.code}</span>
        </p>
      </div>

      <div className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-100">
        <div className="flex px-4 py-3 text-xs text-slate-500">
          <span className="w-12">#</span><span className="flex-1">Joueur</span><span>Points</span>
        </div>
        {rows.map((u, i) => (
          <div key={u.id} className={`flex items-center rounded-lg px-4 py-3 ${u.id === user.id ? "bg-blue-50 font-semibold text-brand" : ""}`}>
            <span className="w-12 text-sm font-bold">
              {i === 0 && u.points > 0 ? <Trophy size={18} className="text-amber-500" fill="currentColor" /> : i + 1}
            </span>
            <span className="flex flex-1 items-center gap-3 text-sm"><UserAvatar name={u.name} avatar={u.avatar} size={36} /> {u.name}</span>
            <span className="text-sm">{u.points.toLocaleString("fr-FR")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

