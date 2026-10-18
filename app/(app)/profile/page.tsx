import Link from "next/link";
import { Camera } from "lucide-react";
import { prisma } from "@/lib/db";
import { requireUser, getStats } from "@/lib/data";
import { UserAvatar } from "@/components/user-avatar";
import { HexBadge } from "@/components/badge-hex";

export default async function ProfilePage() {
  const user = await requireUser();
  const stats = await getStats(user.id, user.points);
  const [badges, all] = await Promise.all([
    prisma.userBadge.findMany({ where: { userId: user.id }, include: { badge: true } }),
    prisma.prediction.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <Link href="/settings" title="Changer ma photo" className="group relative">
          <UserAvatar name={user.name} avatar={user.avatar} size={96} />
          <span className="absolute bottom-0 right-0 grid size-8 place-items-center rounded-full bg-brand text-white shadow-md ring-2 ring-white transition group-hover:scale-110">
            <Camera size={15} />
          </span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-slate-500">{user.points.toLocaleString("fr-FR")} points · #{stats.rank} mondial</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[["Prédictions", all], ["Réussies", stats.correct], ["Précision", `${stats.precision}%`]].map(([l, v]) => (
          <div key={l as string} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-[#0b3a9e]">{l}</p>
            <p className="mt-1 text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">Mes badges</h2>
          <Link href="/badges" className="rounded-lg bg-blue-50 px-3 py-1 text-xs font-medium text-brand">Voir tout</Link>
        </div>
        <div className="flex flex-wrap gap-3">
          {badges.map((b) => (
            <div key={b.badgeId} className="rounded-2xl p-3 shadow-sm ring-1 ring-slate-100"><HexBadge code={b.badge.code} size={68} /></div>
          ))}
          {badges.length === 0 && <p className="text-sm text-slate-500">Aucun badge pour le moment.</p>}
        </div>
      </div>
    </div>
  );
}
