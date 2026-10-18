const AVG_GOALS = 1.35;
const HOME_ADV = 1.1;

function poisson(k: number, lambda: number) {
  let fact = 1;
  for (let i = 2; i <= k; i++) fact *= i;
  return (Math.exp(-lambda) * Math.pow(lambda, k)) / fact;
}

type TeamStats = { elo: number; attack: number; defense: number };

export function predictMatch(home: TeamStats, away: TeamStats) {
  const eloDiff = (home.elo - away.elo) / 400;
  const lambdaHome = AVG_GOALS * HOME_ADV * home.attack * away.defense * Math.pow(10, eloDiff / 2);
  const lambdaAway = AVG_GOALS * away.attack * home.defense * Math.pow(10, -eloDiff / 2);

  let pHome = 0, pDraw = 0, pAway = 0;
  let best = { h: 0, a: 0, p: 0 };
  for (let h = 0; h <= 8; h++) {
    for (let a = 0; a <= 8; a++) {
      const p = poisson(h, lambdaHome) * poisson(a, lambdaAway);
      if (h > a) pHome += p;
      else if (h === a) pDraw += p;
      else pAway += p;
      if (p > best.p) best = { h, a, p };
    }
  }
  const total = pHome + pDraw + pAway;
  return {
    home: Math.round((pHome / total) * 100),
    draw: Math.round((pDraw / total) * 100),
    away: Math.round((pAway / total) * 100),
    likelyScore: `${best.h}-${best.a}`,
    model: "v1.4",
  };
}

export function updateElo(eloHome: number, eloAway: number, hs: number, as: number, K = 30) {
  const expected = 1 / (1 + Math.pow(10, (eloAway - eloHome) / 400));
  const actual = hs > as ? 1 : hs === as ? 0.5 : 0;
  const delta = K * (actual - expected);
  return { home: eloHome + delta, away: eloAway - delta };
}