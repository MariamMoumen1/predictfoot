import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.userBadge.deleteMany();
  const r = await prisma.user.updateMany({ data: { points: 0 } });
  console.log(`${r.count} utilisateurs remis à 0 point ✅`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
