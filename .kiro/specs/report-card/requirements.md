# Requirements — Report Card & Badges

## Introduction
Finishing a dungeon produces a shareable report card; playing earns achievement badges. Both are local-only and screenshot-friendly.

## Requirements

### Requirement 1: Report card
**User story:** As a player who cleared a dungeon, I want a report card I can screenshot and share.

#### Acceptance Criteria
1. WHEN a dungeon reaches victory settlement, THE SYSTEM SHALL render a report card showing: project name, completion rate, total focus minutes, best streak, player level, and the celebrate mascot.
2. THE SYSTEM SHALL render the card at a fixed share-friendly size (1200×630) in the dungeon theme (no light backgrounds; art only on Night Deep per visual spec).
3. THE SYSTEM SHALL NOT require any network call to produce the card.

### Requirement 2: Achievement badges
**User story:** As a player, I want badges for milestones of play.

#### Acceptance Criteria
1. THE SYSTEM SHALL award badges for: first kill, first room cleared, half-way boss HP, victory, 3-day streak, 7-day streak, night-owl session (focus after 23:00).
2. WHEN a badge is earned, THE SYSTEM SHALL show a one-time toast and persist the badge in localStorage.
3. THE SYSTEM SHALL show earned/locked badges on the player panel.
