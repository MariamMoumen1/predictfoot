import { prisma } from "@/lib/db";
import { finalizeMatch } from "@/lib/finalize";

const BASE = "https://api.football-data.org/v4";

// Noms de l'API -> noms courts utilisés dans l'app (et par le modèle ML)
const NAMES: Record<string, string> = {
  "Manchester United FC": "Man United",
  "Manchester City FC": "Man City",
  "Nottingham Forest FC": "Nott'm Forest",
  "Brighton & Hove Albion FC": "Brighton",
  "Tottenham Hotspur FC": "Tottenham",
  "Newcastle United FC": "Newcastle",
  "Leeds United FC": "Leeds",
  "AFC Bournemouth": "Bournemouth",
  "Ipswich Town FC": "Ipswich",
  "Hull City AFC": "Hull",
  "Coventry City FC": "Coventry",
  "Sunderland AFC": "Sunderland",
  "Wolverhampton Wanderers FC": "Wolves",
  "West Ham United FC": "West Ham",
  "Leicester City FC": "Leicester",
};
const normalize = (n: string) => NAMES[n] ?? n.replace(/^AFC /, "").replace(/ (AFC|FC)$/, "");

type ApiTeam = { name: string; crest?: string | null };
type ApiMatch = {
  id: number;
  utcDate: string;
  status: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: { fullTime: { home: number | null; away: number | null } };
};

function mapStatus(s: string): "SCHEDULED" | "LIVE" | "FINISHED" | null {
  if (s === "FINISHED" || s === "AWARDED") return "FINISHED";
  if (s === "IN_PLAY" || s === "PAUSED" || s === "LIVE") return "LIVE";
  if (s === "CANCELLED") return null;
  return "SCHEDULED";
}

const g = globalThis as unknown as { __syncRunning?: boolean };

export type SyncResult = { created: number; updated: number; finalized: number; skipped?: boolean };

export async function syncPremierLeague(): Promise<SyncResult> {
  const token = process.env.FOOTBALL_DATA_TOKEN;
  if (!token) throw new Error("FOOTBALL_DATA_TOKEN manquant dans .env");
  if (g.__syncRunning) return { created: 0, updated: 0, finalized: 0, skipped: true };
  g.__syncRunning = true;

  try {
    const now = new Date();
    const season = now.getUTCMonth() >= 6 ? now.getUTCFullYear() : now.getUTCFullYear() - 1;

    const res = await fetch(`${BASE}/competitions/PL/matches?season=${season}`, {
      headers: { "X-Auth-Token": token },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`football-data.org ${res.status} : ${(await res.text()).slice(0, 200)}`);
    const { matches } = (await res.json()) as { matches: ApiMatch[] };
    matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate));

    // Nettoyage unique des anciens matchs fictifs (sans identifiant API)
    const legacy = await prisma.match.findMany({ where: { externalId: null }, select: { id: true } });
    if (legacy.length) {
      const ids = legacy.map((m) => m.id);
      await prisma.prediction.deleteMany({ where: { matchId: { in: ids } } });
      await prisma.match.deleteMany({ where: { id: { in: ids } } });
    }

    const teams = new Map((await prisma.team.findMany()).map((t) => [t.name, t]));
    async function teamId(t: ApiTeam) {
      const name = normalize(t.name);
      const known = teams.get(name);
      if (known) {
        if (t.crest && known.logo !== t.crest) {
          await prisma.team.update({ where: { id: known.id }, data: { logo: t.crest } });
          known.logo = t.crest;
        }
        return known.id;
      }
      const created = await prisma.team.create({ data: { name, logo: t.crest ?? null } });
      teams.set(name, created);
      return created.id;
    }

    const existing = new Map(
      (
        await prisma.match.findMany({
          where: { externalId: { not: null } },
          select: { id: true, externalId: true, status: true, kickoff: true, homeScore: true, awayScore: true },
        })
      ).map((m) => [m.externalId as number, m])
    );

    const r: SyncResult = { created: 0, updated: 0, finalized: 0 };

    for (const m of matches) {
      const status = mapStatus(m.status);
      if (!status || !m.homeTeam?.name || !m.awayTeam?.name) continue;
      const kickoff = new Date(m.utcDate);
      const hs = m.score.fullTime.home;
      const aw = m.score.fullTime.away;
      const row = existing.get(m.id);

      if (!row) {
        const created = await prisma.match.create({
          data: {
            externalId: m.id,
            league: "Premier League",
            homeId: await teamId(m.homeTeam),
            awayId: await teamId(m.awayTeam),
            kickoff,
            status: status === "LIVE" ? "LIVE" : "SCHEDULED",
            homeScore: status === "LIVE" ? hs ?? 0 : null,
            awayScore: status === "LIVE" ? aw ?? 0 : null,
          },
        });
        r.created++;
        if (status === "FINISHED" && hs !== null && aw !== null) {
          await finalizeMatch(created.id, hs, aw);
          r.finalized++;
        }
        continue;
      }

      if (row.status === "FINISHED") continue;

      if (status === "FINISHED" && hs !== null && aw !== null) {
        if (await finalizeMatch(row.id, hs, aw)) r.finalized++;
        continue;
      }

      const liveScoreChanged = status === "LIVE" && (row.homeScore !== (hs ?? 0) || row.awayScore !== (aw ?? 0));
      if (row.kickoff.getTime() !== kickoff.getTime() || row.status !== status || liveScoreChanged) {
        await prisma.match.update({
          where: { id: row.id },
          data: {
            kickoff,
            status: status === "LIVE" ? "LIVE" : "SCHEDULED",
            homeScore: status === "LIVE" ? hs ?? 0 : null,
            awayScore: status === "LIVE" ? aw ?? 0 : null,
          },
        });
        r.updated++;
      }
    }
    return r;
  } finally {
    g.__syncRunning = false;
  }
}
