# Design — Focus Combat

## Core math (src/game/logic.ts) — pure functions, PBT targets
- `damageForMinutes(minutes: number): number` — identity mapping with floor and clamp at ≥ 0.
- `applyDamage(hp, damage): { hpLeft, overkill }` — hpLeft never negative.
- `xpForMonster(damageDealtTotal)` — XP equals total damage actually applied (capped at maxHp).
- `levelForXp(xp)` — level curve from steering (xp thresholds: level n needs 50·n·(n−1)/2 cumulative… final curve owned by balance agent config).

## Components
- `FocusTimer` — 25/50 presets + custom; start/pause/abandon; on complete or abandon, dispatch damage.
- `MonsterCard` — art by tier, HP bar (three-band), tier badge colors per visual spec.
- `CombatPanel` — current room's monsters; manual-complete confirm dialog.

## State
- Single `useDungeon` hook owns dungeon + player state; all mutations go through logic.ts functions so PBT covers the real code path.

## Correctness properties (for PBT)
- For all minutes m ≥ 0: damageForMinutes(m) = floor(m), and applying it never makes hpLeft < 0.
- For any sequence of damage events on a monster: total XP awarded ≤ maxHp, and monster is defeated ⇔ cumulative applied damage ≥ maxHp.
- Level is monotonic non-decreasing in XP.
