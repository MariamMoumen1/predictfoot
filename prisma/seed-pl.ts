import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Noms identiques à ceux du dataset football-data.co.uk (utile pour le modèle ML).
// Elo de départ approximatif : le modèle ML recalcule le sien.
const teams: Record<string, number> = {
  "Man City": 1900, "Arsenal": 1890, "Liverpool": 1870, "Chelsea": 1800,
  "Newcastle": 1780, "Tottenham": 1760, "Aston Villa": 1760, "Man United": 1750,
  "Brighton": 1740, "Crystal Palace": 1710, "Brentford": 1700, "Bournemouth": 1700,
  "Fulham": 1690, "Nott'm Forest": 1690, "Everton": 1680, "Leeds": 1670,
  "Sunderland": 1620, "Coventry": 1600, "Ipswich": 1600, "Hull": 1570,
};

// [coup d'envoi en UTC, domicile, extérieur, buts dom., buts ext.] (null = pas encore joué)
const matches: [string, string, string, number | null, number | null][] = [
  // --- Matchs terminés ---
  ["2026-08-23T15:00:00Z", "Brighton", "Aston Villa", 4, 0],
  ["2026-08-29T15:00:00Z", "Bournemouth", "Everton", 1, 1],
  ["2026-09-13T15:00:00Z", "Man United", "Man City", 0, 1],
  ["2026-09-13T15:00:00Z", "Coventry", "Brighton", 0, 5],
  ["2026-09-20T15:00:00Z", "Man City", "Sunderland", 5, 3],
  ["2026-10-10T11:30:00Z", "Arsenal", "Leeds", 2, 1],
  ["2026-10-10T14:00:00Z", "Aston Villa", "Brentford", 2, 2],
  ["2026-10-10T14:00:00Z", "Chelsea", "Bournemouth", 5, 1],
  ["2026-10-10T14:00:00Z", "Ipswich", "Fulham", 2, 1],
  ["2026-10-10T14:00:00Z", "Sunderland", "Brighton", 0, 2],
  ["2026-10-10T16:30:00Z", "Man United", "Tottenham", 1, 1],
  // --- Matchs à venir ---
  ["2026-10-11T13:00:00Z", "Crystal Palace", "Nott'm Forest", null, null],
  ["2026-10-11T13:00:00Z", "Hull", "Everton", null, null],
  ["2026-10-11T15:30:00Z", "Liverpool", "Man City", null, null],
  ["2026-10-12T19:00:00Z", "Coventry", "Newcastle", null, null],
  ["2026-10-17T11:30:00Z", "Everton", "Chelsea", null, null],
  ["2026-10-17T14:00:00Z", "Brentford", "Liverpool", null, null],
  ["2026-10-17T14:00:00Z", "Fulham", "Hull", null, null],
  ["2026-10-17T14:00:00Z", "Man City", "Ipswich", null, null],
  ["2026-10-17T15:00:00Z", "Newcastle", "Aston Villa", null, null],
  ["2026-10-18T13:00:00Z", "Bournemouth", "Sunderland", null, null],
  ["2026-10-18T13:00:00Z", "Brighton", "Crystal Palace", null, null],
  ["2026-10-18T13:00:00Z", "Leeds", "Man United", null, null],
  ["2026-10-18T15:30:00Z", "Nott'm Forest", "Arsenal", null, null],
  ["2026-10-19T19:00:00Z", "Tottenham", "Coventry", null, null],
];

async function main() {
  // On garde les utilisateurs, badges et ligues. On remplace équipes, matchs et prédictions.
  await prisma.prediction.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();

  for (const [name, elo] of Object.entries(teams)) {
    await prisma.team.create({ data: { name, elo } });
  }
  const ids = Object.fromEntries((await prisma.team.findMany()).map((t) => [t.name, t.id]));

  for (const [iso, home, away, hg, ag] of matches) {
    const finished = hg !== null && ag !== null;
    await prisma.match.create({
      data: {
        league: "Premier League",
        homeId: ids[home],
        awayId: ids[away],
        kickoff: new Date(iso),
        status: finished ? "FINISHED" : "SCHEDULED",
        homeScore: hg,
        awayScore: ag,
      },
    });
  }
  console.log(`Premier League chargée : ${matches.length} matchs ✅`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
