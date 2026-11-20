import { bossMaxHp, bossHpLeft } from './game/logic';
import type { Dungeon, TaskMonster } from './game/types';

const DEMO: Dungeon = {
  id: 'demo',
  name: 'Kiroween — Deadline Dungeon',
  deadlineISO: '2026-12-05T23:59:59Z',
  createdAt: '2026-11-01T00:00:00Z',
  rooms: [
    {
      id: 'r1',
      title: 'Build the dungeon',
      monsters: [
        { id: 'm1', title: 'Scaffold repo', estimateHours: 0.5, hp: 0,  maxHp: 30,  tier: 1, defeated: true  },
        { id: 'm2', title: 'Wire up routing', estimateHours: 1,   hp: 20, maxHp: 60,  tier: 2, defeated: false },
      ],
    },
    {
      id: 'r2',
      title: 'Combat and Boss',
      monsters: [
        { id: 'm3', title: 'Timer & damage loop', estimateHours: 2,   hp: 120, maxHp: 120, tier: 3, defeated: false },
        { id: 'm4', title: 'Boss HP bar',         estimateHours: 0.5, hp: 30,  maxHp: 30,  tier: 1, defeated: false },
      ],
    },
    {
      id: 'r3',
      title: 'Ship it',
      monsters: [
        { id: 'm5', title: 'Deploy to Cloudflare', estimateHours: 1, hp: 60, maxHp: 60, tier: 2, defeated: false },
      ],
    },
  ],
};

const MONSTER_ART: Record<number, string> = {
  1: '/assets/monster-1-alarm-imp.png',
  2: '/assets/monster-2-doc-slime.png',
  3: '/assets/monster-3-stickynote-bat.png',
  4: '/assets/monster-4-coffee-golem.png',
  5: '/assets/monster-5-inbox-hydra.png',
  6: '/assets/monster-6-printer-behemoth.png',
};

const css = {
  page: {
    minHeight: '100vh',
    background: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontFamily: "'Nunito', sans-serif",
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '24px 16px 48px',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  title: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '14px',
    color: 'var(--color-pumpkin)',
    lineHeight: 1.6,
    margin: 0,
  },
  panel: {
    background: 'var(--color-panel)',
    border: '2px solid var(--color-panel-edge)',
    borderRadius: '12px',
    padding: '16px',
    width: '100%',
    maxWidth: '900px',
  },
  bossLabel: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    color: 'var(--color-secondary)',
    marginBottom: '8px',
  },
  hpTrack: {
    height: '26px',
    background: '#150A29',
    borderRadius: '9px',
    border: '2px solid #000',
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  hpNumbers: {
    marginTop: '6px',
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    color: 'var(--color-text)',
    textAlign: 'right' as const,
  },
  roomRow: {
    display: 'flex',
    gap: '12px',
    width: '100%',
    maxWidth: '900px',
    flexWrap: 'wrap' as const,
  },
  roomPanel: {
    flex: '1 1 240px',
    background: 'var(--color-panel)',
    border: '2px solid var(--color-panel-edge)',
    borderRadius: '12px',
    padding: '14px',
  },
  roomTitle: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '9px',
    color: 'var(--color-secondary)',
    marginBottom: '12px',
  },
  monsterCard: (defeated: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
    opacity: defeated ? 0.5 : 1,
    filter: defeated ? 'grayscale(1)' : 'none',
  }),
  monsterName: {
    fontSize: '12px',
    fontWeight: 700,
    color: 'var(--color-text)',
  },
  monsterHp: {
    fontSize: '11px',
    color: 'var(--color-secondary)',
  },
  slain: {
    fontSize: '10px',
    color: 'var(--color-danger)',
    fontFamily: "'Press Start 2P', monospace",
  },
  footer: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '8px',
    color: 'var(--color-secondary)',
    textAlign: 'center' as const,
    maxWidth: '600px',
    lineHeight: 1.8,
  },
};

function MonsterCard({ monster }: { monster: TaskMonster }) {
  return (
    <div style={css.monsterCard(monster.defeated)}>
      <img
        src={MONSTER_ART[monster.tier]}
        alt={monster.title}
        width={48}
        height={48}
        style={{ imageRendering: 'pixelated' }}
      />
      <div>
        <div style={css.monsterName}>{monster.title}</div>
        {monster.defeated
          ? <div style={css.slain}>SLAIN</div>
          : <div style={css.monsterHp}>{monster.hp} / {monster.maxHp} HP</div>}
      </div>
    </div>
  );
}

export default function App() {
  const maxHp  = bossMaxHp(DEMO);
  const hpLeft = bossHpLeft(DEMO);
  const fillPct = maxHp > 0 ? (hpLeft / maxHp) * 100 : 0;

  return (
    <div style={css.page}>
      {/* Header */}
      <div style={css.header}>
        <img src="/assets/mascot-encourage.png" alt="Ghost mascot" width={64} height={64} />
        <h1 style={css.title}>{DEMO.name}</h1>
      </div>

      {/* Boss HP bar */}
      <div style={css.panel}>
        <div style={css.bossLabel}>BOSS — The Deadline</div>
        <div style={css.hpTrack}>
          <div style={{
            height: '100%',
            width: `${fillPct}%`,
            background: 'linear-gradient(90deg, #c86000, var(--color-pumpkin))',
            borderRadius: '9px',
            transition: 'width 300ms ease-out',
          }} />
        </div>
        <div style={css.hpNumbers}>{hpLeft} / {maxHp} HP</div>
      </div>

      {/* Room panels */}
      <div style={css.roomRow}>
        {DEMO.rooms.map(room => (
          <div key={room.id} style={css.roomPanel}>
            <div style={css.roomTitle}>{room.title}</div>
            {room.monsters.map(m => <MonsterCard key={m.id} monster={m} />)}
          </div>
        ))}
      </div>

      {/* Boss art */}
      <img src="/assets/boss-deadline.png" alt="The Deadline boss" width={96} height={96} />

      {/* Footer */}
      <div style={css.footer}>
        Skeleton build — full gameplay arrives via the specs in /.kiro
      </div>
    </div>
  );
}
