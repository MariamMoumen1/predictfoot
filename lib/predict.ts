import { predictMatch } from "@/lib/ai";

type T = { name: string; elo: number; attack: number; defense: number };

export async function getPrediction(home: T, away: T) {
  const base = predictMatch(home, away);
  const url = process.env.ML_API_URL;
  if (!url) return base;
  try {
    const res = await fetch(`${url}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ home: home.name, away: away.name }),
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return base;
    const ml = await res.json();
    return { ...base, home: ml.home, draw: ml.draw, away: ml.away, model: ml.model as string };
  } catch {
    return base;
  }
}
