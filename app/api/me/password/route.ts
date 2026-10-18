import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const schema = z.object({ current: z.string().min(1), next: z.string().min(6).max(100) });

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nouveau mot de passe : 6 caractères minimum" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !(await bcrypt.compare(parsed.data.current, user.password))) {
    return NextResponse.json({ error: "Mot de passe actuel incorrect" }, { status: 400 });
  }
  await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(parsed.data.next, 10) } });
  return NextResponse.json({ ok: true });
}
