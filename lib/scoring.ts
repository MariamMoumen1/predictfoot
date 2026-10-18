export function computePoints(
  p: { outcome: string; homeScore?: number | null; awayScore?: number | null },
  m: { homeScore: number; awayScore: number }
) {
  const real = m.homeScore > m.awayScore ? "HOME" : m.homeScore === m.awayScore ? "DRAW" : "AWAY";
  const exact = p.homeScore === m.homeScore && p.awayScore === m.awayScore;
  if (exact) return { points: 15, isCorrect: true };
  if (p.outcome === real) return { points: 10, isCorrect: true };
  return { points: 0, isCorrect: false };
}