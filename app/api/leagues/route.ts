import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const parsed = z.object({ name: z.string().min(2).max(40) }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Nom invalide" }, { status: 400 });

  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  const league = await prisma.league.create({
    data: {
      name: parsed.data.name,
      code,
      ownerId: userId,
      members: { create: { userId } },
    },
  });
  return NextResponse.json({ ok: true, code: league.code });
}
