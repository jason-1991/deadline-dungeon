import { useState, useEffect } from 'react';
import { bossMaxHp, bossHpLeft, roomStatus, applyDamage, xpForMonster, levelForXp, updateStreak } from './game/logic';
import type { Dungeon, Room } from './game/types';
import { loadState, saveState, defaultPlayer } from './game/storage';
import type { GameState } from './game/storage';
import CreateDungeonForm from './components/CreateDungeonForm';
import HpBar from './components/HpBar';
import MonsterCard from './components/MonsterCard';
import FocusTimer from './components/FocusTimer';

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
    flexWrap: 'wrap' as const,
  },
  titleRow: { display: 'flex', alignItems: 'center', gap: '16px' },
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
  statBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '2px',
    padding: '6px 12px',
    background: 'var(--color-panel)',
    border: '1px solid var(--color-panel-edge)',
    borderRadius: '8px',
  },
  statLabel: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '7px',
    color: 'var(--color-secondary)',
  },
  statValue: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '11px',
    color: 'var(--color-pumpkin)',
  },
  manualBtn: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: '13px',
    padding: '8px 18px',
    borderRadius: '6px',
    border: '1px solid var(--color-secondary)',
    background: 'transparent',
    color: 'var(--color-secondary)',
    cursor: 'pointer',
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
  if (status === 'cleared') return { ...base, border: '2px solid var(--color-success)' };
  if (status === 'current') return { ...base, border: '2px solid var(--color-pumpkin)', boxShadow: '0 0 10px 2px rgba(255,140,26,0.35)' };
  return { ...base, border: '2px solid var(--color-panel-edge)', opacity: 0.5, filter: 'grayscale(0.4)' };
}

function currentRoom(dungeon: Dungeon): Room | undefined {
  return dungeon.rooms.find((r) => r.monsters.some((m) => !m.defeated));
}

function DungeonView({
  state,
  setState,
  onNewDungeon,
}: {
  state: GameState;
  setState: (s: GameState) => void;
  onNewDungeon: () => void;
}) {
  const { dungeon, player } = state;
  if (!dungeon) return null;

  const maxHp = bossMaxHp(dungeon);
  const hpLeft = bossHpLeft(dungeon);
  const room = currentRoom(dungeon);
  const firstUndefeated = room?.monsters.find((m) => !m.defeated);

  const [selectedId, setSelectedId] = useState<string | null>(firstUndefeated?.id ?? null);

  // Keep selectedId pointed at a live monster when dungeon changes
  useEffect(() => {
    const active = room?.monsters.find((m) => !m.defeated);
    setSelectedId(active?.id ?? null);
  }, [dungeon.id, room?.id]);

  function dealDamage(minutes: number) {
    if (!dungeon) return;
    if (!room) return;
    // Find target: selected if still alive, else first undefeated
    const target = room.monsters.find((m) => m.id === selectedId && !m.defeated)
      ?? room.monsters.find((m) => !m.defeated);
    if (!target) return;

    const damage = Math.floor(minutes);
    if (damage <= 0) return;

    const { hpLeft: newHp, appliedDamage } = applyDamage(target.hp, damage);
    const nowDefeated = newHp <= 0;
    const xpGained = nowDefeated ? xpForMonster(target.maxHp - target.hp + appliedDamage, target.maxHp) : 0;

    const newTotalXp = player.totalXp + xpGained;
    const newLevel = levelForXp(newTotalXp);
    const { streakDays: newStreak, lastStreakDateISO: newLastDate } = nowDefeated
      ? updateStreak(player.streakDays, player.lastStreakDateISO, new Date())
      : { streakDays: player.streakDays, lastStreakDateISO: player.lastStreakDateISO };

    const updatedDungeon: Dungeon = {
      ...dungeon,
      rooms: dungeon.rooms.map((r) =>
        r.id !== room.id
          ? r
          : {
              ...r,
              monsters: r.monsters.map((m) =>
                m.id !== target.id
                  ? m
                  : { ...m, hp: newHp, defeated: nowDefeated },
              ),
            },
      ),
    };

    const next: GameState = {
      dungeon: updatedDungeon,
      player: {
        totalXp: newTotalXp,
        level: newLevel,
        streakDays: newStreak,
        lastStreakDateISO: newLastDate,
      },
    };
    saveState(next);
    setState(next);

    // Advance selection to next alive monster in this room
    if (nowDefeated) {
      const nextAlive = updatedDungeon.rooms
        .find((r) => r.id === room.id)
        ?.monsters.find((m) => !m.defeated);
      setSelectedId(nextAlive?.id ?? null);
    }
  }

  function handleManualComplete() {
    if (!room) return;
    const target = room.monsters.find((m) => m.id === selectedId && !m.defeated)
      ?? room.monsters.find((m) => !m.defeated);
    if (!target) return;
    if (!confirm(`Complete "${target.title}" without focus?`)) return;
    dealDamage(target.hp); // deal exactly remaining HP
  }

  const mascot = hpLeft / Math.max(1, maxHp) < 0.15 ? 'anxious' : 'encourage';

  return (
    <>
      <div style={css.header}>
        <div style={css.titleRow}>
          <img src={`/assets/mascot-${mascot}.png`} alt="Ghost mascot" width={64} height={64} />
          <h1 style={css.title}>{dungeon.name}</h1>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={css.statBadge}>
            <span style={css.statLabel}>LEVEL</span>
            <span style={css.statValue}>{player.level}</span>
          </div>
          <div style={css.statBadge}>
            <span style={css.statLabel}>XP</span>
            <span style={css.statValue}>{player.totalXp}</span>
          </div>
          <div style={css.statBadge}>
            <span style={css.statLabel}>STREAK</span>
            <span style={css.statValue}>{player.streakDays}🔥</span>
          </div>
          <button style={css.newBtn} onClick={onNewDungeon}>New Dungeon</button>
        </div>
      </div>

      {/* Boss HP bar */}
      <div style={css.panel}>
        <div style={css.bossLabel}>BOSS — The Deadline</div>
        <HpBar hp={hpLeft} maxHp={maxHp} />
        <div style={css.hpNumbers}>{hpLeft} / {maxHp} HP</div>
      </div>

      {/* Room panels */}
      <div style={css.roomRow}>
        {dungeon.rooms.map((r, idx) => {
          const status = roomStatus(dungeon.rooms, idx);
          const isCurrent = status === 'current';
          return (
            <div key={r.id} style={roomPanelStyle(status)}>
              <div style={css.roomTitle}>{r.title}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {r.monsters.map((m) => (
                  <MonsterCard
                    key={m.id}
                    monster={m}
                    selected={isCurrent && m.id === selectedId}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Combat controls for the current room */}
      {room && (
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <FocusTimer onDealDamage={dealDamage} disabled={!firstUndefeated} />
          <button style={css.manualBtn} onClick={handleManualComplete} disabled={!firstUndefeated}>
            Complete without focus
          </button>
        </div>
      )}

      {hpLeft === 0 && (
        <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '14px', color: 'var(--color-success)', textAlign: 'center' }}>
          🎉 DUNGEON CLEARED! The Boss is defeated!
        </div>
      )}
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
      <DungeonView state={state} setState={setState} onNewDungeon={handleNewDungeon} />
    </div>
  );
}
