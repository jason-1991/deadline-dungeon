import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  damageForMinutes,
  applyDamage,
  bossHpLeft,
  bossMaxHp,
  levelForXp,
} from "./logic.ts";
import type { Dungeon, TaskMonster } from "./types.ts";

// ── STEP 1: first two property tests ────────────────────────────────────────

describe("damageForMinutes: equals floor and never negative", () => {
  it("equals Math.floor(minutes) for non-negative input", () => {
    fc.assert(
      fc.property(fc.float({ min: 0, max: 1e6, noNaN: true }), (minutes) => {
        expect(damageForMinutes(minutes)).toBe(Math.floor(minutes));
      }),
    );
  });

  it("is never negative for any real number input", () => {
    fc.assert(
      fc.property(fc.float({ min: -1e6, max: 1e6, noNaN: true }), (minutes) => {
        expect(damageForMinutes(minutes)).toBeGreaterThanOrEqual(0);
      }),
    );
  });
});

describe("applyDamage: hp never goes negative", () => {
  it("hpLeft is always >= 0 for arbitrary hp and damage", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: -1_000, max: 20_000 }),
        (hp, damage) => {
          const { hpLeft } = applyDamage(hp, damage);
          expect(hpLeft).toBeGreaterThanOrEqual(0);
        },
      ),
    );
  });
});

// ── STEP 2: remaining property tests ────────────────────────────────────────

// Arbitrary for a minimal Dungeon with one room and one monster
const monsterArb = fc
  .integer({ min: 1, max: 10_000 })
  .map((maxHp): TaskMonster => ({
    id: "m1",
    title: "Task",
    estimateHours: 1,
    hp: maxHp,
    maxHp,
    tier: 1,
    defeated: false,
  }));

const dungeonArb = monsterArb.map((monster): Dungeon => ({
  id: "d1",
  name: "Dungeon",
  deadlineISO: new Date(Date.now() + 86_400_000).toISOString(),
  createdAt: new Date().toISOString(),
  rooms: [{ id: "r1", title: "Room", monsters: [monster] }],
}));

describe("applyDamage: cumulative applied damage never exceeds maxHp", () => {
  it("sum of appliedDamage over a random hit sequence never exceeds initial hp", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000 }),
        fc.array(fc.integer({ min: 0, max: 5_000 }), { minLength: 1, maxLength: 20 }),
        (initialHp, hits) => {
          let hp = initialHp;
          let totalApplied = 0;
          for (const hit of hits) {
            const { hpLeft, appliedDamage } = applyDamage(hp, hit);
            totalApplied += appliedDamage;
            hp = hpLeft;
          }
          expect(totalApplied).toBeLessThanOrEqual(initialHp);
        },
      ),
    );
  });
});

describe("bossHpLeft = bossMaxHp - total applied damage", () => {
  it("bossHpLeft equals bossMaxHp minus sum of all monster damage taken", () => {
    fc.assert(
      fc.property(dungeonArb, (dungeon) => {
        const maxHp = bossMaxHp(dungeon);
        const hpLeft = bossHpLeft(dungeon);
        // Before any damage: maxHp == hpLeft because monsters start at full hp
        expect(hpLeft).toBe(maxHp);
      }),
    );
  });

  it("bossHpLeft equals bossMaxHp minus damage dealt after partial damage", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000 }),
        fc.integer({ min: 0, max: 10_000 }),
        (maxHp, damage) => {
          const { hpLeft: remainingHp, appliedDamage } = applyDamage(maxHp, damage);
          // Simulate a dungeon with the monster at remainingHp
          const dungeon: Dungeon = {
            id: "d1",
            name: "Dungeon",
            deadlineISO: new Date(Date.now() + 86_400_000).toISOString(),
            createdAt: new Date().toISOString(),
            rooms: [{
              id: "r1",
              title: "Room",
              monsters: [{
                id: "m1",
                title: "Task",
                estimateHours: 1,
                hp: remainingHp,
                maxHp,
                tier: 1,
                defeated: remainingHp === 0,
              }],
            }],
          };
          expect(bossHpLeft(dungeon)).toBe(bossMaxHp(dungeon) - appliedDamage);
        },
      ),
    );
  });
});

describe("levelForXp: monotonic (more XP never yields a lower level)", () => {
  it("levelForXp(a) <= levelForXp(b) whenever a <= b", () => {
    fc.assert(
      fc.property(
        fc.nat({ max: 100_000 }),
        fc.nat({ max: 100_000 }),
        (a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          expect(levelForXp(lo)).toBeLessThanOrEqual(levelForXp(hi));
        },
      ),
    );
  });
});
