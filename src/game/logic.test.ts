import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  damageForMinutes,
  applyDamage,
  bossHpLeft,
  bossMaxHp,
  levelForXp,
  buildDungeon,
  roomStatus,
  evaluateBadges,
} from "./logic.ts";
import type { Dungeon, TaskMonster, PlayerProgress } from "./types.ts";

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

// ── STEP 3: buildDungeon and roomStatus property tests ───────────────────────
describe("buildDungeon: room count and total maxHp match inputs", () => {
  it("rooms.length === input.length and sum of monster maxHp === sum of Math.round(estimateHours*60)", () => {
    const taskArb = fc.record({
      title: fc.string({ minLength: 1, maxLength: 40 }),
      estimateHours: fc.float({ min: 0.5, max: 10, noNaN: true }),
    });
    const roomInputArb = fc.record({
      title: fc.string({ minLength: 1, maxLength: 40 }),
      tasks: fc.array(taskArb, { minLength: 1, maxLength: 5 }),
    });
    const futureISO = new Date(Date.now() + 7 * 86_400_000).toISOString();
    fc.assert(
      fc.property(
        fc.array(roomInputArb, { minLength: 1, maxLength: 6 }),
        (roomInputs) => {
          const dungeon = buildDungeon("X", futureISO, roomInputs);
          expect(dungeon.rooms.length).toBe(roomInputs.length);
          const expectedHp = roomInputs.reduce(
            (sum, room) =>
              sum + room.tasks.reduce((s, t) => s + Math.round(t.estimateHours * 60), 0),
            0,
          );
          const actualHp = dungeon.rooms.reduce(
            (sum, room) => sum + room.monsters.reduce((s, m) => s + m.maxHp, 0),
            0,
          );
          expect(actualHp).toBe(expectedHp);
        },
      ),
    );
  });
});
describe("roomStatus: cleared iff every monster.defeated is true", () => {
  it("roomStatus([room], 0) === 'cleared' iff all monsters are defeated", () => {
    const monsterWithFlagArb = fc.boolean().map(
      (defeated): TaskMonster => ({
        id: "m1",
        title: "Task",
        estimateHours: 1,
        hp: defeated ? 0 : 60,
        maxHp: 60,
        tier: 2,
        defeated,
      }),
    );
    const roomWithFlagsArb = fc
      .array(monsterWithFlagArb, { minLength: 1, maxLength: 8 })
      .map((monsters) => ({ id: "r1", title: "Room", monsters }));
    fc.assert(
      fc.property(roomWithFlagsArb, (room) => {
        const allDefeated = room.monsters.every((m) => m.defeated);
        const status = roomStatus([room], 0);
        expect(status === "cleared").toBe(allDefeated);
      }),
    );
  });
});

describe("roomStatus: upcoming, locked, and overdue states", () => {
  const clearedRoom = (id: string) => ({
    id,
    title: "Room",
    monsters: [{ id: `${id}-m`, title: "T", estimateHours: 1, hp: 0, maxHp: 60, tier: 2 as const, defeated: true }],
  });
  const activeRoom = (id: string) => ({
    id,
    title: "Room",
    monsters: [{ id: `${id}-m`, title: "T", estimateHours: 1, hp: 60, maxHp: 60, tier: 2 as const, defeated: false }],
  });

  it("room immediately after current is 'upcoming'", () => {
    const rooms = [activeRoom("r0"), activeRoom("r1"), activeRoom("r2")];
    expect(roomStatus(rooms, 1)).toBe("upcoming");
  });

  it("rooms two or more past current are 'locked'", () => {
    const rooms = [activeRoom("r0"), activeRoom("r1"), activeRoom("r2")];
    expect(roomStatus(rooms, 2)).toBe("locked");
  });

  it("current room is 'overdue' when overdue=true", () => {
    const rooms = [activeRoom("r0"), activeRoom("r1")];
    expect(roomStatus(rooms, 0, true)).toBe("overdue");
  });

  it("current room is 'current' when overdue=false (default)", () => {
    const rooms = [clearedRoom("r0"), activeRoom("r1")];
    expect(roomStatus(rooms, 1)).toBe("current");
  });

  it("cleared room stays 'cleared' regardless of overdue flag", () => {
    const rooms = [clearedRoom("r0"), activeRoom("r1")];
    expect(roomStatus(rooms, 0, true)).toBe("cleared");
  });

  it("upcoming room stays 'upcoming' even when overdue=true", () => {
    const rooms = [activeRoom("r0"), activeRoom("r1"), activeRoom("r2")];
    expect(roomStatus(rooms, 1, true)).toBe("upcoming");
  });
});

// ── STEP 4: evaluateBadges tests ─────────────────────────────────────────────

function makePlayer(overrides: Partial<PlayerProgress> = {}): PlayerProgress {
  return {
    totalXp: 0,
    level: 1,
    streakDays: 0,
    lastStreakDateISO: null,
    earnedBadgeIds: [],
    focusMinutes: 0,
    ...overrides,
  };
}

function makeDungeon(overrides: Partial<Dungeon> = {}): Dungeon {
  const now = Date.now();
  return {
    id: "d1",
    name: "Test Dungeon",
    deadlineISO: new Date(now + 7 * 86_400_000).toISOString(),
    createdAt: new Date(now - 24 * 86_400_000).toISOString(),
    rooms: [{
      id: "r1",
      title: "Room 1",
      monsters: [{
        id: "m1",
        title: "Task 1",
        estimateHours: 1,
        hp: 0,
        maxHp: 60,
        tier: 2,
        defeated: true,
      }],
    }],
    ...overrides,
  };
}

describe("evaluateBadges: no duplicate awards", () => {
  it("evaluateBadges never returns duplicate badge IDs in a single call", () => {
    fc.assert(
      fc.property(fc.nat({ max: 500 }), fc.nat({ max: 10 }), (xp, streak) => {
        const dungeon = makeDungeon();
        const player = makePlayer({ totalXp: xp, streakDays: streak });
        const result = evaluateBadges(dungeon, player, new Date());
        const unique = new Set(result);
        expect(result.length).toBe(unique.size);
      }),
    );
  });

  it("calling evaluateBadges twice with already-earned badges yields no new awards", () => {
    const dungeon = makeDungeon();
    const player = makePlayer();
    const first = evaluateBadges(dungeon, player, new Date());
    const playerAfter = { ...player, earnedBadgeIds: first };
    const second = evaluateBadges(dungeon, playerAfter, new Date());
    expect(second).toHaveLength(0);
  });
});

describe("evaluateBadges: correct awards for a sample completed state", () => {
  it("awards first_blood when at least one monster is defeated", () => {
    const dungeon = makeDungeon(); // has one defeated monster
    const player = makePlayer();
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("first_blood");
  });

  it("awards dungeon_clear and boss_slayer on victory (all hp=0)", () => {
    const dungeon = makeDungeon();
    const player = makePlayer();
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("dungeon_clear");
    expect(badges).toContain("boss_slayer");
  });

  it("awards no_extend on victory with extensions=0", () => {
    const dungeon = makeDungeon({ extensions: 0 });
    const player = makePlayer();
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("no_extend");
  });

  it("awards overtime on victory with extensions>=1", () => {
    const dungeon = makeDungeon({ extensions: 2 });
    const player = makePlayer();
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("overtime");
    expect(badges).not.toContain("no_extend");
  });

  it("awards streak_3 when streakDays >= 3", () => {
    const dungeon = makeDungeon();
    const player = makePlayer({ streakDays: 5 });
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("streak_3");
    expect(badges).not.toContain("streak_7");
  });

  it("awards streak_7 when streakDays >= 7", () => {
    const dungeon = makeDungeon();
    const player = makePlayer({ streakDays: 7 });
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("streak_7");
  });

  it("awards centurion when totalXp >= 100", () => {
    const dungeon = makeDungeon();
    const player = makePlayer({ totalXp: 150 });
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).toContain("centurion");
  });

  it("does NOT award dungeon_clear when boss has HP remaining", () => {
    const dungeon = makeDungeon({
      rooms: [{
        id: "r1",
        title: "Room 1",
        monsters: [{
          id: "m1",
          title: "Task",
          estimateHours: 1,
          hp: 10,
          maxHp: 60,
          tier: 2,
          defeated: false,
        }],
      }],
    });
    const player = makePlayer();
    const badges = evaluateBadges(dungeon, player, new Date());
    expect(badges).not.toContain("dungeon_clear");
  });
});

// ── XP rule: partial damage awards partial XP, overkill clamps ───────────────

describe("applyDamage XP rule: damage applied equals XP earned (overkill clamped)", () => {
  it("partial damage on a monster awards exactly the damage dealt (< maxHp)", () => {
    // Monster with 60 HP, deal 20 damage — appliedDamage = 20, XP should be 20
    const { appliedDamage } = applyDamage(60, 20);
    expect(appliedDamage).toBe(20);
  });

  it("overkill clamps: dealing more damage than HP remaining yields appliedDamage === hp", () => {
    // Monster with 10 HP remaining, deal 50 damage — only 10 should be applied
    const { hpLeft, appliedDamage } = applyDamage(10, 50);
    expect(hpLeft).toBe(0);
    expect(appliedDamage).toBe(10);
  });

  it("property: appliedDamage always equals Math.min(hp, damage) for non-negative inputs", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000 }),
        fc.integer({ min: 0, max: 20_000 }),
        (hp, damage) => {
          const { appliedDamage } = applyDamage(hp, damage);
          expect(appliedDamage).toBe(Math.min(hp, damage));
        },
      ),
    );
  });

  it("cumulative XP from sequential hits never exceeds monster maxHp", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10_000 }),
        fc.array(fc.integer({ min: 0, max: 5_000 }), { minLength: 1, maxLength: 20 }),
        (maxHp, hits) => {
          let hp = maxHp;
          let totalXp = 0;
          for (const hit of hits) {
            const { hpLeft, appliedDamage } = applyDamage(hp, hit);
            totalXp += appliedDamage; // XP = appliedDamage per the rule
            hp = hpLeft;
          }
          expect(totalXp).toBeLessThanOrEqual(maxHp);
        },
      ),
    );
  });
});
