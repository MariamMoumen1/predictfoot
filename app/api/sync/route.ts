import { NextResponse } from "next/server";
import { syncPremierLeague } from "@/lib/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

async function handle(req: Request) {
  const secret = process.env.CRON_SECRET;
  const bearer = req.headers.get("authorization");
  const key = new URL(req.url).searchParams.get("key");
  if (!secret || (bearer !== `Bearer ${secret}` && key !== secret)) {
    return NextResponse.json({ error: "Interdit" }, { status: 403 });
  }
  try {
    return NextResponse.json({ ok: true, ...(await syncPremierLeague()) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Erreur" }, { status: 500 });
  }
}

export const GET = handle;
export const POST = handle;
