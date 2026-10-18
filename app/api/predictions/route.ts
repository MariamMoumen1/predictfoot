import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const schema = z.object({
  matchId: z.number().int(),
  outcome: z.enum(["HOME", "DRAW", "AWAY"]),
  homeScore: z.number().int().min(0).max(20).nullable().optional(),
  awayScore: z.number().int().min(0).max(20).nullable().optional(),
});

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const { matchId, outcome, homeScore = null, awayScore = null } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) return NextResponse.json({ error: "Match introuvable" }, { status: 404 });
  if (match.status !== "SCHEDULED" || match.kickoff <= new Date()) {
    return NextResponse.json({ error: "Le match a déjà commencé" }, { status: 400 });
  }

  if (homeScore !== null && awayScore !== null) {
    const real = homeScore > awayScore ? "HOME" : homeScore === awayScore ? "DRAW" : "AWAY";
    if (real !== outcome) {
      return NextResponse.json({ error: "Le score ne correspond pas au résultat choisi" }, { status: 400 });
    }
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId, matchId } },
    update: { outcome, homeScore, awayScore },
    create: { userId, matchId, outcome, homeScore, awayScore },
  });
  return NextResponse.json({ ok: true });
}