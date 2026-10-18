import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await prisma.user.findUnique({
      where: { email: String(email).trim().toLowerCase() },
    });
    if (!user || !(await bcrypt.compare(String(password), user.password))) {
      return NextResponse.json({ error: "Email ou mot de passe incorrect" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("LOGIN ERROR:", e);
    return NextResponse.json(
      { error: "Erreur serveur : " + (e instanceof Error ? e.message : "inconnue") },
      { status: 500 }
    );
  }
}
