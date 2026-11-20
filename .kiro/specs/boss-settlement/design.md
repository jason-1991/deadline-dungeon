# Design — Boss & Settlement

## Derivation, not duplication
- Boss HP is a derived value: `bossHpLeft = Σ monster.hp` over all rooms; `bossMaxHp = Σ monster.maxHp`. No separate boss state to desync.
- `bossState(dungeon, now)`: `victory` if total hp = 0; `defeated` if now > deadline and hp > 0; else `ongoing`. Anxious-mascot predicate: time left < 24h OR hp fraction < 0.15.

## Components
- `BossBar` — wide HP bar with boss art thumbnail and countdown to deadline.
- `SettlementScreen` — victory/defeat variants, stats summary, Continue (datetime picker) / New Dungeon actions.

## Correctness properties (for PBT)
- For any damage sequence: bossHpLeft = bossMaxHp − total applied damage, always ≥ 0.
- bossState is `victory` ⇔ total remaining hp = 0, regardless of deadline.
