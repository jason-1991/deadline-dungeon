# Requirements — Boss & Settlement

## Introduction
The deadline is the Boss. Its HP is all remaining work; every defeated monster drains it. Reaching the deadline decides victory or defeat.

## Requirements

### Requirement 1: Boss HP from remaining work
**User story:** As a player, I want the Boss HP bar to always equal my remaining workload, so "how far to the end" is visible at a glance.

#### Acceptance Criteria
1. THE SYSTEM SHALL set Boss max HP to the sum of all monsters' maxHp at dungeon creation.
2. WHEN any monster takes damage, THE SYSTEM SHALL reduce Boss HP by the same applied amount.
3. THE SYSTEM SHALL render the Boss bar (26px, clock end-cap) with the mascot switching to its anxious state when remaining time < 24h or Boss HP fraction < 15%.

### Requirement 2: Victory and defeat
**User story:** As a player, I want a clear ending when the deadline arrives or the work is done.

#### Acceptance Criteria
1. WHEN all monsters are defeated before the deadline, THE SYSTEM SHALL show the victory settlement with the celebrate mascot.
2. WHEN the deadline passes with monsters remaining, THE SYSTEM SHALL show the "slain by the Deadline Boss" settlement and offer Continue (extend deadline) or New Dungeon.
3. WHEN the user extends the deadline, THE SYSTEM SHALL resume the same dungeon with the new deadline and record the extension in the run history.
