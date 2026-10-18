import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const schema = z.object({
  name: z.string().trim().min(2).max(40),
  username: z.string().trim().min(3).max(30),
  email: z.string().trim().toLowerCase().email(),
});

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  const { name, username, email } = parsed.data;

  const taken = await prisma.user.findFirst({
    where: { id: { not: userId }, OR: [{ email }, { username }] },
  });
  if (taken) return NextResponse.json({ error: "Email ou pseudo déjà utilisé" }, { status: 409 });

  await prisma.user.update({ where: { id: userId }, data: { name, username, email } });
  return NextResponse.json({ ok: true });
}
