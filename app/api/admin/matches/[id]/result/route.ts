import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { computePoints } from "@/lib/scoring";
import { updateElo } from "@/lib/ai";
import { checkBadges } from "@/lib/badges";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (req.headers.get("x-admin-key") !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = z
    .object({ homeScore: z.number().int().min(0), awayScore: z.number().int().min(0) })
    .safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Scores invalides" }, { status: 400 });
  const { homeScore, awayScore } = parsed.data;

  const match = await prisma.match.findUnique({
    where: { id: Number(id) },
    include: { home: true, away: true, predictions: true },
  });
  if (!match) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  if (match.status === "FINISHED") return NextResponse.json({ error: "Déjà terminé" }, { status: 400 });

  await prisma.match.update({
    where: { id: match.id },
    data: { status: "FINISHED", homeScore, awayScore },
  });

  const elo = updateElo(match.home.elo, match.away.elo, homeScore, awayScore);
  await prisma.team.update({ where: { id: match.homeId }, data: { elo: elo.home } });
  await prisma.team.update({ where: { id: match.awayId }, data: { elo: elo.away } });

  for (const p of match.predictions) {
    const { points, isCorrect } = computePoints(p, { homeScore, awayScore });
    await prisma.prediction.update({ where: { id: p.id }, data: { points, isCorrect } });
    await prisma.user.update({ where: { id: p.userId }, data: { points: { increment: points } } });
  }
  for (const p of match.predictions) await checkBadges(p.userId);

  return NextResponse.json({ ok: true, updated: match.predictions.length });
}