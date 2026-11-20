/** Monster tier 1-6 (T1 <=0.5h ... T6 >5h). */
export type Tier = 1 | 2 | 3 | 4 | 5 | 6;

/** A single task represented as a dungeon monster. */
export interface TaskMonster {
  id: string;
  title: string;
  estimateHours: number;
  hp: number;
  maxHp: number;
  tier: Tier;
  defeated: boolean;
}

/** A room (milestone) containing one or more monsters. */
export interface Room {
  id: string;
  title: string;
  monsters: TaskMonster[];
}

/** A complete dungeon (project). Boss HP is always derived, never stored. */
export interface Dungeon {
  id: string;
  name: string;
  deadlineISO: string;
  rooms: Room[];
  createdAt: string;
}

/** Player progression across all dungeons. */
export interface PlayerProgress {
  totalXp: number;
  level: number;
  streakDays: number;
  lastStreakDateISO: string | null;
}

/** Computed state of the boss fight. */
export type BossState = 'ongoing' | 'victory' | 'defeated';
