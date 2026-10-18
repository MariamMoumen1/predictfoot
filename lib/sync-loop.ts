import { syncPremierLeague } from "@/lib/sync";

const g = globalThis as unknown as { __syncStarted?: boolean };

export function startSyncLoop() {
  if (g.__syncStarted || process.env.VERCEL || !process.env.FOOTBALL_DATA_TOKEN) return;
  g.__syncStarted = true;

  const run = async () => {
    try {
      const r = await syncPremierLeague();
      if (!r.skipped) console.log(`[sync] ${r.created} créés, ${r.updated} mis à jour, ${r.finalized} terminés`);
    } catch (e) {
      console.error("[sync]", e instanceof Error ? e.message : e);
    }
  };
  run();
  setInterval(run, 60_000);
}
