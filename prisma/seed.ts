import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const teams = [
  { name: "Real Madrid", elo: 1900 },
  { name: "Barcelona", elo: 1880 },
  { name: "Atletico", elo: 1800 },
  { name: "PSG", elo: 1850 },
  { name: "Lyon", elo: 1680 },
  { name: "Milan", elo: 1760 },
  { name: "Roma", elo: 1700 },
  { name: "Bayern", elo: 1890 },
  { name: "Dortmund", elo: 1760 },
  { name: "Man United", elo: 1740 },
  { name: "Chelsea", elo: 1750 },
];

const badges = [
  { code: "FIRST", name: "Premier match", description: "Faire sa première prédiction" },
  { code: "STREAK5", name: "Série de 5", description: "5 prédictions correctes d'affilée" },
  { code: "PRECISION10", name: "Précision", description: "10 prédictions correctes" },
  { code: "CHAMPION", name: "Champion", description: "Atteindre la 1ère place" },
  { code: "EXPERT20", name: "Expert", description: "20 prédictions" },
  { code: "LEGEND50", name: "Légende", description: "50 prédictions" },
  { code: "MASTER100", name: "Maître", description: "100 prédictions" },
  { code: "VIP200", name: "VIP", description: "200 prédictions" },
];

const users = [
  { name: "Sarah", username: "sarah", points: 1540 },
  { name: "Youssef", username: "youssef", points: 1490 },
  { name: "Mariam", username: "mariam", points: 1420 },
  { name: "Ahmed", username: "ahmed", points: 1390 },
  { name: "Imane", username: "imane", points: 1350 },
  { name: "Khalid", username: "khalid", points: 1310 },
];

function at(dayOffset: number, hour: number, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  // Nettoyage (ordre important à cause des relations)
  await prisma.userBadge.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.leagueMember.deleteMany();
  await prisma.league.deleteMany();
  await prisma.match.deleteMany();
  await prisma.team.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.user.deleteMany();

  for (const t of teams) await prisma.team.create({ data: t });
  for (const b of badges) await prisma.badge.create({ data: b });

  const hash = await bcrypt.hash("password123", 10);
  for (const u of users) {
    await prisma.user.create({
      data: { ...u, email: `${u.username}@test.com`, password: hash },
    });
  }

  const t = async (name: string) =>
    (await prisma.team.findUniqueOrThrow({ where: { name } })).id;

  const upcoming = [
    ["La Liga", "Real Madrid", "Barcelona", at(0, 22)],
    ["Ligue 1", "PSG", "Lyon", at(0, 23)],
    ["Serie A", "Milan", "Roma", at(1, 20, 45)],
    ["Bundesliga", "Bayern", "Dortmund", at(1, 18, 30)],
    ["Premier League", "Man United", "Chelsea", at(2, 17)],
    ["La Liga", "Atletico", "Real Madrid", at(2, 21)],
  ] as const;

  for (const [league, h, a, kickoff] of upcoming) {
    await prisma.match.create({
      data: { league, homeId: await t(h), awayId: await t(a), kickoff },
    });
  }

  const finished = [
    ["La Liga", "Barcelona", "Atletico", at(-2, 21), 2, 1],
    ["Ligue 1", "Lyon", "PSG", at(-2, 20), 0, 2],
    ["Serie A", "Roma", "Milan", at(-1, 20, 45), 1, 1],
  ] as const;

  for (const [league, h, a, kickoff, hs, as] of finished) {
    await prisma.match.create({
      data: {
        league, homeId: await t(h), awayId: await t(a), kickoff,
        status: "FINISHED", homeScore: hs, awayScore: as,
      },
    });
  }

  // Ligues
  const mariam = await prisma.user.findUniqueOrThrow({ where: { username: "mariam" } });
  const sarah = await prisma.user.findUniqueOrThrow({ where: { username: "sarah" } });
  const leagueData = [
    { name: "Friends League", code: "FRIENDS1", ownerId: mariam.id },
    { name: "Family League", code: "FAMILY01", ownerId: mariam.id },
    { name: "Work League", code: "WORK0001", ownerId: sarah.id },
  ];
  for (const l of leagueData) {
    const league = await prisma.league.create({ data: l });
    await prisma.leagueMember.create({ data: { userId: l.ownerId, leagueId: league.id } });
    if (l.ownerId !== mariam.id) {
      await prisma.leagueMember.create({ data: { userId: mariam.id, leagueId: league.id } });
    }
  }

  console.log("Seed terminé ✅");
}

main().catch(console.error).finally(() => prisma.$disconnect());