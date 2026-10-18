import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/auth";

const IMAGE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const PRESET = "https://api.dicebear.com/9.x/avataaars/svg?seed=";

const schema = z.object({
  avatar: z
    .string()
    .max(400_000)
    .nullable()
    .refine((v) => v === null || IMAGE.test(v) || (v.startsWith(PRESET) && v.length < 200), "Image invalide"),
});

export async function PATCH(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Image invalide ou trop lourde" }, { status: 400 });

  await prisma.user.update({ where: { id: userId }, data: { avatar: parsed.data.avatar } });
  return NextResponse.json({ ok: true });
}
