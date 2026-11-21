# Deadline Dungeon

**Slay your tasks before the Deadline Boss slays you.**

Deadline Dungeon turns your hackathon or project plan into a dungeon crawler:
milestones become rooms, tasks become monsters, and the deadline itself is the
Boss. Focus with the built-in timer to deal damage, clear rooms, earn XP and
badges — and beat the Boss by finishing your real work before the deadline.

Built for **Kiroween** (Costume Contest). 100% static: no backend, no login,
all progress saved in your browser's localStorage.

Live demo: https://jason-1991.github.io/deadline-dungeon/

## Run it locally

```bash
npm install
npm run dev      # develop
npm run build    # production build (dist/)
npm test         # property-based tests for the game math
```

## How it plays

1. **Create a dungeon** from your project: name, deadline, milestones, tasks
   (or start from a template — e.g. "Hackathon 48h").
2. **Fight with focus**: start a 25/50-minute focus session; each focused
   minute deals 1 damage to the current task-monster. Or mark a task done to
   slay it outright.
3. **Watch the Boss bleed**: Boss HP = all remaining work. Every hit on a
   monster drains the Boss.
4. **Win or fall**: clear everything before the deadline for the victory
   report card — or face the "Slain by the Deadline Boss" settlement (and
   extend your deadline to keep fighting).

## Built with Kiro (spec-driven)

Deadline Dungeon was built spec-first in Kiro. Four feature specs guided
implementation, steering docs defined the game rules and technical
constraints, agent hooks reran tests and production builds after file
changes, and property-based testing with fast-check verifies the game math.
The evidence chain is committed in `/.kiro` on purpose:

- `/.kiro/specs/` — four feature specs (dungeon creation, focus combat, boss &
  settlement, report card), each with requirements (EARS), design, and tasks.
- `/.kiro/steering/` — product rules (game balance, tone, theme) and tech
  rules (stack, conventions) that steer every generation.
- `/.kiro/hooks/` — typecheck-on-save and logic-tests-on-save hooks.
- `/.kiro/agents/` — a custom "balance-designer" agent for tuning HP/XP curves.
- Property-based tests (fast-check) prove the damage/XP invariants from the
  specs: damage = focused minutes, HP never goes negative, lifetime XP for a
  monster never exceeds its max HP, Boss HP is conserved.

## Tech

React + Vite + TypeScript · localStorage persistence · Vitest + fast-check

## License

MIT — see [LICENSE](LICENSE).
