# Requirements — Focus Combat

## Introduction
Work is combat: a focus timer deals damage equal to the minutes focused; finishing a task outright slays its monster.

## Requirements

### Requirement 1: Focus timer damage
**User story:** As a player, I want to start a 25- or 50-minute focus session against the current monster, so that focused work visibly damages it.

#### Acceptance Criteria
1. WHEN a focus session of N minutes completes, THE SYSTEM SHALL deal exactly N damage to the target monster (1 minute = 1 damage).
2. WHEN damage meets or exceeds remaining HP, THE SYSTEM SHALL mark the monster defeated, award XP, and advance the current room if it was the last monster.
3. IF the user abandons a session early, THE SYSTEM SHALL deal damage equal to whole minutes elapsed (floor), minimum 0.
4. THE SYSTEM SHALL show the timer, target monster art, and live HP bar with the three-band color rule (>35% ghost green, 15–35% pumpkin, <15% danger pulse).

### Requirement 2: Manual completion
**User story:** As a player, I want to mark a task done directly when I finished it outside a timer.

#### Acceptance Criteria
1. WHEN the user confirms "task done", THE SYSTEM SHALL slay the monster immediately and award full XP for its maxHp.
2. THE SYSTEM SHALL require an explicit confirm (no single misclick kills).

### Requirement 3: XP, levels, streaks
**User story:** As a player, I want XP, levels and a daily streak so progress feels cumulative.

#### Acceptance Criteria
1. WHEN a monster is defeated, THE SYSTEM SHALL award XP equal to the damage actually dealt to it over its lifetime (no XP farming by overkill).
2. THE SYSTEM SHALL compute level from cumulative XP with the curve in steering/product-rules.md.
3. WHEN the user defeats at least one monster on a calendar day, THE SYSTEM SHALL extend the daily streak; a missed day resets it.
