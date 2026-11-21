import type { Dungeon, PlayerProgress } from "./types.ts";

export const STORAGE_KEY = "deadline-dungeon:v1";

export interface GameState {
  dungeon: Dungeon | null;
  player: PlayerProgress;
}

export function defaultPlayer(): PlayerProgress {
  return {
    totalXp: 0,
    level: 1,
    streakDays: 0,
    lastStreakDateISO: null,
    earnedBadgeIds: [],
    focusMinutes: 0,
  };
}

export function loadState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return { dungeon: null, player: defaultPlayer() };
    const parsed = JSON.parse(raw) as GameState;
    // Back-fill fields added after initial release
    if (!parsed.player.earnedBadgeIds) parsed.player.earnedBadgeIds = [];
    if (parsed.player.focusMinutes == null) parsed.player.focusMinutes = 0;
    return parsed;
  } catch {
    return { dungeon: null, player: defaultPlayer() };
  }
}

export function saveState(state: GameState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
