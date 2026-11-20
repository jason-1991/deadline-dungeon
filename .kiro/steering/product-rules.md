# Product Rules — Deadline Dungeon (steering)

## Game balance (locked unless the balance agent proposes and a human approves)
- Monster HP is stored in focus-minutes: HP = estimated hours × 60 (0.5h task = 30 HP).
- Damage: 1 focused minute = 1 damage. No multipliers, no crits in MVP.
- XP: equals damage actually applied to a monster over its lifetime (overkill never counts).
- Level curve: level n requires cumulative XP ≥ 50 × n × (n − 1) / 2 (L2=50, L3=150, L4=300, L5=500…).
- Monster tiers by estimate: T1 ≤0.5h, T2 ≤1h, T3 ≤2h, T4 ≤3h, T5 ≤5h, T6 >5h. Art mapping: monster-1..6 in tier order; tier badge colors T1–2 green, T3–4 orange, T5–6 red.
- Streak: ≥1 monster defeated on a calendar day extends the streak; a fully missed day resets it to 0.
- Boss HP is always derived (sum of monster HP), never stored separately.

## Tone & copy
- UI copy in English, spooky-cute, encouraging — never shaming. Defeat copy blames the Boss, not the player.
- The ghost mascot is the guide: encourage (default), anxious (<24h to deadline or Boss <15%), celebrate (victory/report).

## Theme (from visual spec, locked)
- Palette: Night Deep #1B1035 bg, Dungeon Panel #2A1A4E, Panel Edge #4A2F7F, Pumpkin #FF8C1A primary, Ghost Green #4ADE80 success, Bone #F4F1E6 text, Muted Lavender #A79BC7 secondary, Danger #E5484D.
- Art only on dark backgrounds. No light theme.
