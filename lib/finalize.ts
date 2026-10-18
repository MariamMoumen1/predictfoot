import { prisma } from "@/lib/db";
import { computePoints } from "@/lib/scoring";
import { updateElo } from "@/lib/ai";
import { checkBadges } from "@/lib/badges";

// Clôture un match : score, points des prédictions, Elo des équipes, badges.
// Ne s'exécute qu'une seule fois par match (protégé contre les doubles appels).
export async function finalizeMatch(matchId: number, homeScore: number, awayScore: number) {
  const claimed = await prisma.match.updateMany({
    where: { id: matchId, status: { not: "FINISHED" } },
    data: { status: "FINISHED", homeScore, awayScore },
  });
  if (claimed.count === 0) return false;

  const match = await prisma.match.findUniqueOrThrow({
    where: { id: matchId },
    include: { home: true, away: true, predictions: true },
  });

  const elo = updateElo(match.home.elo, match.away.elo, homeScore, awayScore);
  await prisma.team.update({ where: { id: match.homeId }, data: { elo: elo.home } });
  await prisma.team.update({ where: { id: match.awayId }, data: { elo: elo.away } });

  for (const p of match.predictions) {
    const { points, isCorrect } = computePoints(p, { homeScore, awayScore });
    await prisma.prediction.update({ where: { id: p.id }, data: { points, isCorrect } });
    await prisma.user.update({ where: { id: p.userId }, data: { points: { increment: points } } });
  }
  for (const userId of new Set(match.predictions.map((p) => p.userId))) {
    await checkBadges(userId);
  }
  return true;
}
