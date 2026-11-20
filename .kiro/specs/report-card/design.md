# Design — Report Card & Badges

## Components
- `ReportCard` — fixed 1200×630 themed card, pure presentational; data from settlement stats.
- `BadgeShelf` — badge grid (earned in Ghost Green, locked in Muted Lavender).
- `badge rules` in logic.ts: `evaluateBadges(state): BadgeId[]` — pure function over player+dungeon state, unit-testable.

## Stats derivation
- completionRate = defeated monsters / total monsters.
- totalFocusMinutes = Σ applied damage (1 damage = 1 minute by combat design).
