import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides (pseudo 3 car. min, mot de passe 6 car. min)" },
        { status: 400 }
      );
    }
    const { name, username, password } = parsed.data;
    const email = parsed.data.email.trim().toLowerCase();

    const exists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (exists) {
      return NextResponse.json({ error: "Email ou pseudo déjà utilisé" }, { status: 409 });
    }

    const user = await prisma.user.create({
      data: { name, username, email, password: await bcrypt.hash(password, 10) },
    });
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("REGISTER ERROR:", e);
    return NextResponse.json(
      { error: "Erreur serveur : " + (e instanceof Error ? e.message : "inconnue") },
      { status: 500 }
    );
  }
}
