import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/data";
import { HexBadge } from "@/components/badge-hex";

export default async function BadgesPage() {
  const user = await requireUser();
  const [badges, mine] = await Promise.all([
    prisma.badge.findMany({ orderBy: { id: "asc" } }),
    prisma.userBadge.findMany({ where: { userId: user.id } }),
  ]);
  const owned = new Set(mine.map((m) => m.badgeId));
  const unlocked = badges.filter((b) => owned.has(b.id));
  const locked = badges.filter((b) => !owned.has(b.id));

  const card = (b: (typeof badges)[number], on: boolean) => (
    <div key={b.id} className="flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-slate-100">
      <HexBadge code={b.code} locked={!on} size={76} />
      <p className="mt-3 text-sm font-bold text-ink">{b.name}</p>
      <p className="mt-1 text-xs text-slate-500">{b.description}</p>
    </div>
  );

  return (
    <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
      <h1 className="text-2xl font-bold">Mes récompenses</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {unlocked.map((b) => card(b, true))}
        {unlocked.length === 0 && <p className="col-span-full text-sm text-slate-500">Aucun badge pour le moment. Fais ta première prédiction !</p>}
      </div>
      <h2 className="pt-2 font-bold">Badges verrouillés</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {locked.map((b) => card(b, false))}
      </div>
    </div>
  );
}
