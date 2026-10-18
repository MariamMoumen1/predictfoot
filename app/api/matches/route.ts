import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { predictMatch } from "@/lib/ai";

export async function GET() {
  const matches = await prisma.match.findMany({
    include: { home: true, away: true },
    orderBy: { kickoff: "asc" },
  });

  const data = matches.map((m: (typeof matches)[number]) => ({
    id: m.id,
    league: m.league,
    kickoff: m.kickoff,
    status: m.status,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    home: m.home.name,
    away: m.away.name,
    ai: predictMatch(m.home, m.away),
  }));

  return NextResponse.json(data);
}