import Link from "next/link";
import { ChevronRight, Trophy, Users, Briefcase } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/data";
import { LeagueActions } from "@/components/league-actions";

const looks = [
  { Icon: Trophy, wrap: "bg-amber-100 text-amber-500" },
  { Icon: Users, wrap: "bg-blue-100 text-blue-600" },
  { Icon: Briefcase, wrap: "bg-blue-100 text-blue-700" },
];

export default async function LeaguesPage() {
  const user = await requireUser();
  const memberships = await prisma.leagueMember.findMany({
    where: { userId: user.id },
    include: { league: { include: { members: { include: { user: true } } } } },
  });

  const leagues = memberships.map(({ league }) => ({
    id: league.id, name: league.name, code: league.code, count: league.members.length,
    rank: league.members.filter((m) => m.user.points > user.points).length + 1,
  }));

  return (
    <LeagueActions>
      <div className="space-y-3">
        {leagues.map((l, i) => {
          const { Icon, wrap } = looks[i % looks.length];
          return (
            <Link key={l.id} href={`/leagues/${l.id}`} className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md">
              <span className={`grid size-14 place-items-center rounded-full ${wrap}`}><Icon size={26} /></span>
              <div className="flex-1">
                <p className="font-bold">{l.name}</p>
                <p className="text-sm text-slate-500">{l.count} {l.count > 1 ? "membres" : "membre"} · Vous : #{l.rank}</p>
                <p className="mt-0.5 text-xs text-slate-400">Code : {l.code}</p>
              </div>
              <ChevronRight className="text-slate-400" />
            </Link>
          );
        })}
        {leagues.length === 0 && <p className="text-sm text-slate-500">Tu n&apos;as encore rejoint aucune ligue.</p>}
      </div>
    </LeagueActions>
  );
}
