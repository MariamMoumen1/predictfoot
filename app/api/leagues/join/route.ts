import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const { code } = await req.json();
  const league = await prisma.league.findUnique({
    where: { code: String(code ?? "").trim().toUpperCase() },
  });
  if (!league) return NextResponse.json({ error: "Code invalide" }, { status: 404 });

  await prisma.leagueMember.upsert({
    where: { userId_leagueId: { userId, leagueId: league.id } },
    update: {},
    create: { userId, leagueId: league.id },
  });
  return NextResponse.json({ ok: true });
}
