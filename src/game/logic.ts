import type { Dungeon, Tier } from "./types.ts";

export function damageForMinutes(minutes: number): number {
  return Math.max(0, Math.floor(minutes));
}

export function applyDamage(
  hp: number,
  damage: number,
): { hpLeft: number; appliedDamage: number } {
  const clamped = Math.max(0, damage);
  const hpLeft = Math.max(0, hp - clamped);
  const appliedDamage = hp - hpLeft;
  return { hpLeft, appliedDamage };
}

export function xpForMonster(damageDealtTotal: number, maxHp: number): number {
  return Math.min(Math.max(0, damageDealtTotal), maxHp);
}

export function levelForXp(xp: number): number {
  let level = 1;
  while (true) {
    const nextLevel = level + 1;
    const threshold = (50 * nextLevel * (nextLevel - 1)) / 2;
    if (xp >= threshold) {
      level = nextLevel;
    } else {
      break;
    }
  }
  return level;
}

export function tierForEstimate(estimateHours: number): Tier {
  if (estimateHours <= 0.5) return 1;
  if (estimateHours <= 1) return 2;
  if (estimateHours <= 2) return 3;
  if (estimateHours <= 3) return 4;
  if (estimateHours <= 5) return 5;
  return 6;
}

export function bossMaxHp(dungeon: Dungeon): number {
  return dungeon.rooms.reduce(
    (sum, room) => sum + room.monsters.reduce((s, m) => s + m.maxHp, 0),
    0,
  );
}

export function bossHpLeft(dungeon: Dungeon): number {
  return dungeon.rooms.reduce(
    (sum, room) => sum + room.monsters.reduce((s, m) => s + m.hp, 0),
    0,
  );
}

export function bossState(
  dungeon: Dungeon,
  now: Date,
): "ongoing" | "victory" | "defeated" {
  const hpLeft = bossHpLeft(dungeon);
  if (hpLeft === 0) return "victory";
  if (now > new Date(dungeon.deadlineISO)) return "defeated";
  return "ongoing";
}
