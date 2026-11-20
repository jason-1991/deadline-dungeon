# Tech Rules — Deadline Dungeon (steering)

## Stack
- React + Vite + TypeScript (strict). Pure static site: no backend, no login, no network calls at runtime.
- All persistence in localStorage under key `deadline-dungeon:v1`.

## Code conventions
- All game math lives in pure functions in `src/game/logic.ts` — components never re-implement formulas; this is what the property tests cover.
- Types in `src/game/types.ts`. State mutations only through logic.ts helpers.
- Components in `src/components/`, one component per file, props typed explicitly.
- Tests: Vitest + fast-check, in `src/game/logic.test.ts` (property tests named after the spec property they prove).

## Visual implementation
- Fonts: 'Press Start 2P' for titles/numbers only, 'Nunito' (600/800) for UI text; self-hosted from /fonts/.
- HP bars: 18px (Boss 26px), track #150A29, 2px ink border, radius 9; fill bands >35% ghost-green gradient, 15–35% pumpkin gradient, <15% danger gradient + 1s pulse; damage animation 300ms ease-out.
- Room nodes 72px (Boss 96px), five states per visual spec; rooms connected by 3px Bone dashed path.
- Motion budget: hit shake 120ms, kill fade 250ms, room advance 350ms; only two looping animations allowed (current-room ring pulse, mascot float 2.4s).
