import { prisma } from "@/lib/db";

export async function checkBadges(userId: string) {
  const [total, correct, user, last5, better] = await Promise.all([
    prisma.prediction.count({ where: { userId } }),
    prisma.prediction.count({ where: { userId, isCorrect: true } }),
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.prediction.findMany({
      where: { userId, points: { not: null } },
      orderBy: { match: { kickoff: "desc" } },
      take: 5,
    }),
    prisma.user.count({ where: { points: { gt: (await prisma.user.findUnique({ where: { id: userId } }))?.points ?? 0 } } }),
  ]);

  const earned: string[] = [];
  if (total >= 1) earned.push("FIRST");
  if (total >= 20) earned.push("EXPERT20");
  if (total >= 50) earned.push("LEGEND50");
  if (total >= 100) earned.push("MASTER100");
  if (total >= 200) earned.push("VIP200");
  if (correct >= 10) earned.push("PRECISION10");
  if (last5.length === 5 && last5.every((p) => p.isCorrect)) earned.push("STREAK5");
  if (user && better === 0 && user.points > 0) earned.push("CHAMPION");

  for (const code of earned) {
    const badge = await prisma.badge.findUnique({ where: { code } });
    if (!badge) continue;
    await prisma.userBadge.upsert({
      where: { userId_badgeId: { userId, badgeId: badge.id } },
      update: {},
      create: { userId, badgeId: badge.id },
    });
  }
}