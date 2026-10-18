import { describe, it, expect } from "vitest";
import { computePoints } from "@/lib/scoring";

describe("computePoints", () => {
  it("score exact = 15 points", () => {
    expect(computePoints({ outcome: "HOME", homeScore: 2, awayScore: 1 }, { homeScore: 2, awayScore: 1 }))
      .toEqual({ points: 15, isCorrect: true });
  });
  it("bon résultat sans le bon score = 10 points", () => {
    expect(computePoints({ outcome: "HOME", homeScore: null, awayScore: null }, { homeScore: 3, awayScore: 0 }))
      .toEqual({ points: 10, isCorrect: true });
  });
  it("match nul bien prédit = 10 points", () => {
    expect(computePoints({ outcome: "DRAW" }, { homeScore: 1, awayScore: 1 }).points).toBe(10);
  });
  it("mauvais résultat = 0 point", () => {
    expect(computePoints({ outcome: "AWAY" }, { homeScore: 2, awayScore: 0 }))
      .toEqual({ points: 0, isCorrect: false });
  });
});