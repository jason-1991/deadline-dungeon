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

/**
 * Update streak after a monster is defeated on `nowDate`.
 * - same calendar day as lastDate → streak unchanged
 * - consecutive day → streak + 1
 * - gap of ≥2 days → streak resets to 1
 */
export function updateStreak(
  streakDays: number,
  lastStreakDateISO: string | null,
  nowDate: Date,
): { streakDays: number; lastStreakDateISO: string } {
  const todayISO = nowDate.toISOString().slice(0, 10);
  if (!lastStreakDateISO) {
    return { streakDays: 1, lastStreakDateISO: todayISO };
  }
  const last = new Date(lastStreakDateISO);
  const today = new Date(todayISO);
  const diffDays = Math.round(
    (today.getTime() - last.getTime()) / (24 * 60 * 60 * 1000),
  );
  if (diffDays === 0) {
    // Same calendar day — keep streak, update date (already same)
    return { streakDays, lastStreakDateISO: todayISO };
  }
  if (diffDays === 1) {
    return { streakDays: streakDays + 1, lastStreakDateISO: todayISO };
  }
  // Gap — reset
  return { streakDays: 1, lastStreakDateISO: todayISO };
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

// ── Badge evaluation ─────────────────────────────────────────────────────────

import type { BadgeId } from "./types.ts";
import type { PlayerProgress } from "./types.ts";

export interface BadgeDefinition {
  id: BadgeId;
  name: string;
  description: string;
}

export const ALL_BADGES: BadgeDefinition[] = [
  { id: 'first_blood',   name: 'First Blood',    description: 'Defeat your first monster' },
  { id: 'dungeon_clear', name: 'Dungeon Clear',   description: 'Defeat all monsters before the deadline' },
  { id: 'speed_runner',  name: 'Speed Runner',    description: 'Clear the dungeon with ≥50% time remaining' },
  { id: 'no_extend',     name: 'No Mercy',        description: 'Win a dungeon without any deadline extensions' },
  { id: 'streak_3',      name: 'Hat Trick',       description: 'Maintain a 3-day streak' },
  { id: 'streak_7',      name: 'Week Warrior',    description: 'Maintain a 7-day streak' },
  { id: 'centurion',     name: 'Centurion',       description: 'Earn 100 XP in a single dungeon' },
  { id: 'exterminator',  name: 'Exterminator',    description: 'Defeat every monster in a dungeon' },
  { id: 'boss_slayer',   name: 'Boss Slayer',     description: 'Win any dungeon (Boss HP = 0)' },
  { id: 'overtime',      name: 'Overtime',        description: 'Extend the deadline at least once and still win' },
];

/** Pure function: given the current state, return all badge IDs that should now be earned.
 *  Never returns duplicates. Already-earned badges are excluded. */
export function evaluateBadges(
  dungeon: Dungeon,
  player: PlayerProgress,
  now: Date,
): BadgeId[] {
  const earned = new Set<BadgeId>(player.earnedBadgeIds ?? []);
  const result: BadgeId[] = [];

  function award(id: BadgeId) {
    if (!earned.has(id)) {
      earned.add(id);
      result.push(id);
    }
  }

  const totalMonsters = dungeon.rooms.reduce((s, r) => s + r.monsters.length, 0);
  const defeatedMonsters = dungeon.rooms.reduce(
    (s, r) => s + r.monsters.filter((m) => m.defeated).length,
    0,
  );
  const hpLeft = bossHpLeft(dungeon);
  const maxHp = bossMaxHp(dungeon);
  const state = bossState(dungeon, now);
  const extensions = dungeon.extensions ?? 0;

  // first_blood: at least one monster defeated
  if (defeatedMonsters >= 1) award('first_blood');

  // exterminator: all monsters defeated
  if (defeatedMonsters === totalMonsters && totalMonsters > 0) award('exterminator');

  // boss_slayer + dungeon_clear: victory state
  if (state === 'victory') {
    award('boss_slayer');
    award('dungeon_clear');
  }

  // speed_runner: victory with ≥50% time remaining
  if (state === 'victory') {
    const created = new Date(dungeon.createdAt).getTime();
    const deadline = new Date(dungeon.deadlineISO).getTime();
    const totalDuration = deadline - created;
    const elapsed = now.getTime() - created;
    if (totalDuration > 0 && elapsed / totalDuration <= 0.5) award('speed_runner');
  }

  // no_extend: victory with zero extensions
  if (state === 'victory' && extensions === 0) award('no_extend');

  // overtime: victory after at least one extension
  if (state === 'victory' && extensions >= 1) award('overtime');

  // streak badges
  if (player.streakDays >= 3) award('streak_3');
  if (player.streakDays >= 7) award('streak_7');

  // centurion: total XP ≥ 100
  if (player.totalXp >= 100) award('centurion');

  // suppress compiler unused var warnings
  void hpLeft; void maxHp;

  return result;
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
