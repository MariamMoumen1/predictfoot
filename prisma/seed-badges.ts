import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

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

async function main() {
  for (const b of badges) {
    await prisma.badge.upsert({ where: { code: b.code }, update: b, create: b });
  }
  console.log(`${badges.length} badges prêts ✅`);
}
main().catch(console.error).finally(() => prisma.$disconnect());