import { useState, useEffect } from 'react';
import { bossMaxHp, bossHpLeft, roomStatus } from './game/logic';
import type { Dungeon, TaskMonster } from './game/types';
import { loadState, saveState, defaultPlayer } from './game/storage';
import type { GameState } from './game/storage';
import CreateDungeonForm from './components/CreateDungeonForm';
import HpBar from './components/HpBar';

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
    width: '100%',
    maxWidth: '900px',
    justifyContent: 'space-between',
  },
  titleRow: {
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
  roomTitle: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '9px',
    color: 'var(--color-secondary)',
    marginBottom: '12px',
  },
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
  newBtn: {
    background: 'transparent',
    border: '1px solid var(--color-panel-edge)',
    borderRadius: '6px',
    color: 'var(--color-secondary)',
    cursor: 'pointer',
    fontFamily: "'Nunito', sans-serif",
    fontSize: '13px',
    fontWeight: 800,
    padding: '5px 12px',
    whiteSpace: 'nowrap' as const,
  },
};

function roomPanelStyle(status: 'cleared' | 'current' | 'locked'): React.CSSProperties {
  const base: React.CSSProperties = {
    flex: '1 1 240px',
    background: 'var(--color-panel)',
    borderRadius: '12px',
    padding: '14px',
    transition: 'border 150ms ease',
  };
  if (status === 'cleared') {
    return { ...base, border: '2px solid var(--color-success)' };
  }
  if (status === 'current') {
    return {
      ...base,
      border: '2px solid var(--color-pumpkin)',
      boxShadow: '0 0 10px 2px rgba(255,140,26,0.35)',
    };
  }
  // locked
  return {
    ...base,
    border: '2px solid var(--color-panel-edge)',
    opacity: 0.5,
    filter: 'grayscale(0.4)',
  };
}

function MonsterCard({ monster }: { monster: TaskMonster }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '10px',
        opacity: monster.defeated ? 0.5 : 1,
        filter: monster.defeated ? 'grayscale(1)' : 'none',
      }}
    >
      <img
        src={MONSTER_ART[monster.tier]}
        alt={monster.title}
        width={48}
        height={48}
        style={{ imageRendering: 'pixelated' }}
      />
      <div>
        <div style={css.monsterName}>{monster.title}</div>
        {monster.defeated ? (
          <div style={css.slain}>SLAIN</div>
        ) : (
          <div style={css.monsterHp}>
            {monster.hp} / {monster.maxHp} HP
          </div>
        )}
      </div>
    </div>
  );
}

function DungeonView({
  dungeon,
  onNewDungeon,
}: {
  dungeon: Dungeon;
  onNewDungeon: () => void;
}) {
  const maxHp = bossMaxHp(dungeon);
  const hpLeft = bossHpLeft(dungeon);

  return (
    <>
      {/* Header */}
      <div style={css.header}>
        <div style={css.titleRow}>
          <img src="/assets/mascot-encourage.png" alt="Ghost mascot" width={64} height={64} />
          <h1 style={css.title}>{dungeon.name}</h1>
        </div>
        <button style={css.newBtn} onClick={onNewDungeon}>
          New Dungeon
        </button>
      </div>

      {/* Boss HP bar */}
      <div style={css.panel}>
        <div style={css.bossLabel}>BOSS — The Deadline</div>
        <HpBar hp={hpLeft} maxHp={maxHp} />
        <div style={css.hpNumbers}>
          {hpLeft} / {maxHp} HP
        </div>
      </div>

      {/* Room panels */}
      <div style={css.roomRow}>
        {dungeon.rooms.map((room, idx) => {
          const status = roomStatus(dungeon.rooms, idx);
          return (
            <div key={room.id} style={roomPanelStyle(status)}>
              <div style={css.roomTitle}>{room.title}</div>
              {room.monsters.map((m) => (
                <MonsterCard key={m.id} monster={m} />
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}

export default function App() {
  const [state, setState] = useState<GameState>(() => loadState());

  useEffect(() => {
    setState(loadState());
  }, []);

  const handleCreate = (dungeon: Dungeon) => {
    const next: GameState = { dungeon, player: state.player };
    saveState(next);
    setState(next);
  };

  const handleNewDungeon = () => {
    if (!confirm('Start a new dungeon? Your current progress will be lost.')) return;
    const next: GameState = { dungeon: null, player: defaultPlayer() };
    saveState(next);
    setState(next);
  };

  if (state.dungeon === null) {
    return (
      <div style={css.page}>
        <CreateDungeonForm onCreate={handleCreate} />
      </div>
    );
  }

  return (
    <div style={css.page}>
      <DungeonView dungeon={state.dungeon} onNewDungeon={handleNewDungeon} />
    </div>
  );
}
