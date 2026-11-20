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

// ── Builder helpers ──────────────────────────────────────────────────────────

import type { Room, TaskMonster } from "./types.ts";

/** Build a TaskMonster from a task title and estimate. */
export function buildMonster(title: string, estimateHours: number): TaskMonster {
  const maxHp = Math.round(estimateHours * 60);
  return {
    id: crypto.randomUUID(),
    title,
    estimateHours,
    hp: maxHp,
    maxHp,
    tier: tierForEstimate(estimateHours),
    defeated: false,
  };
}

/** Build a full Dungeon from a name, ISO deadline, and room/task descriptors. */
export function buildDungeon(
  name: string,
  deadlineISO: string,
  rooms: { title: string; tasks: { title: string; estimateHours: number }[] }[],
): Dungeon {
  const builtRooms: Room[] = rooms.map((r) => ({
    id: crypto.randomUUID(),
    title: r.title,
    monsters: r.tasks.map((t) => buildMonster(t.title, t.estimateHours)),
  }));
  return {
    id: crypto.randomUUID(),
    name,
    deadlineISO,
    rooms: builtRooms,
    createdAt: new Date().toISOString(),
  };
}

/** Compute the status of a room at a given index in the room list. */
export type RoomStatus = "cleared" | "current" | "locked";

export function roomStatus(rooms: Room[], index: number): RoomStatus {
  const room = rooms[index];
  const allDefeated = room.monsters.every((m) => m.defeated);
  if (allDefeated) return "cleared";

  // The first room whose monsters are not all defeated is "current"
  for (let i = 0; i < index; i++) {
    if (!rooms[i].monsters.every((m) => m.defeated)) return "locked";
  }
  return "current";
}
