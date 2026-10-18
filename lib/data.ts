import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function requireUser() {
  const id = await getUserId();
  if (!id) redirect("/login");
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) redirect("/login");
  return user;
}

export async function getStats(userId: string, points: number) {
  const [better, total, correct, badges] = await Promise.all([
    prisma.user.count({ where: { points: { gt: points } } }),
    prisma.prediction.count({ where: { userId, points: { not: null } } }),
    prisma.prediction.count({ where: { userId, isCorrect: true } }),
    prisma.userBadge.count({ where: { userId } }),
  ]);
  return {
    rank: better + 1,
    total,
    correct,
    precision: total ? Math.round((correct / total) * 100) : 0,
    badges,
  };
}

export function formatTime(d: Date) {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDay(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
export function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}

