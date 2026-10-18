import { describe, it, expect } from "vitest";
import { predictMatch, updateElo } from "@/lib/ai";

const strong = { elo: 1900, attack: 1, defense: 1 };
const weak = { elo: 1600, attack: 1, defense: 1 };

describe("predictMatch (Elo + Poisson)", () => {
  it("les probabilités totalisent environ 100 %", () => {
    const p = predictMatch(strong, weak);
    expect(p.home + p.draw + p.away).toBeGreaterThanOrEqual(98);
    expect(p.home + p.draw + p.away).toBeLessThanOrEqual(102);
  });
  it("l'équipe la plus forte est favorite", () => {
    const p = predictMatch(strong, weak);
    expect(p.home).toBeGreaterThan(p.away);
  });
  it("renvoie un score le plus probable au bon format", () => {
    expect(predictMatch(strong, weak).likelyScore).toMatch(/^\d+-\d+$/);
  });
});

describe("updateElo", () => {
  it("conserve la somme des points Elo", () => {
    const r = updateElo(1700, 1650, 2, 1);
    expect(r.home + r.away).toBeCloseTo(3350, 5);
  });
  it("le vainqueur gagne des points", () => {
    expect(updateElo(1500, 1500, 1, 0).home).toBeGreaterThan(1500);
  });
});