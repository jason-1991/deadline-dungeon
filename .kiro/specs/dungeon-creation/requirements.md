# Requirements — Dungeon Creation

## Introduction
Turn a real project plan into a playable dungeon: the project is the dungeon, milestones are rooms, tasks are monsters, and the deadline is the Boss.

## Requirements

### Requirement 1: Create a dungeon from a plan
**User story:** As a hackathon participant, I want to enter my project name, deadline, milestones and tasks, so that a dungeon map is generated from my real plan.

#### Acceptance Criteria
1. WHEN the user submits a project name, a future deadline, and at least one milestone with at least one task, THE SYSTEM SHALL generate a dungeon with one room per milestone, chained in input order.
2. WHEN a task is created, THE SYSTEM SHALL require an estimated effort in hours (minimum 0.5) and set the monster HP to that estimate.
3. WHEN the user picks a template (Hackathon 48h / Course Project / Custom), THE SYSTEM SHALL prefill milestones and tasks that the user can edit before confirming.
4. IF the deadline is in the past or a milestone has no tasks, THE SYSTEM SHALL reject creation with a specific inline error.

### Requirement 2: Persist locally
**User story:** As a returning user, I want my dungeon to survive a browser restart without any account.

#### Acceptance Criteria
1. WHEN a dungeon is created or modified, THE SYSTEM SHALL save it to localStorage.
2. WHEN the app loads and a saved dungeon exists, THE SYSTEM SHALL restore it exactly, including per-task remaining HP.
3. THE SYSTEM SHALL NOT send dungeon data to any server.

### Requirement 3: Room states
**User story:** As a player, I want to see at a glance which rooms are cleared, current, or locked.

#### Acceptance Criteria
1. THE SYSTEM SHALL render rooms in five states: cleared, current, upcoming, locked, and overdue-boss, following the visual spec (door, torches, chains, dashed Bone path).
2. THE SYSTEM SHALL mark exactly one room as current: the first room with any undefeated monster.
