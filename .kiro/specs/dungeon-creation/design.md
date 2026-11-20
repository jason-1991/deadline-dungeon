# Design — Dungeon Creation

## Data models (src/game/types.ts)
- `TaskMonster { id, title, estimateHours, hp, maxHp, tier (1-6), defeated }` — hp is stored in "focus minutes" internally (estimateHours × 60) so combat math is integer-friendly.
- `Room { id, title, monsters: TaskMonster[] }`
- `Dungeon { id, name, deadlineISO, rooms: Room[], createdAt }`

## Components
- `CreateDungeonForm` — name, deadline datetime, template picker, milestone/task editor rows.
- `DungeonMap` — horizontal room chain; derives room state from monster states (all defeated → cleared; first non-cleared → current; rooms after a locked gate → locked).

## Persistence
- `src/game/storage.ts` — load/save `deadline-dungeon:v1` in localStorage; versioned key so future migrations are possible.

## Correctness properties (for PBT)
- Room derivation: a room is cleared ⇔ every monster in it is defeated.
- Generation: number of rooms equals number of milestones; total monster maxHp equals sum of estimates × 60.
