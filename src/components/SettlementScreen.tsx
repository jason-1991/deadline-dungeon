import type { Dungeon, PlayerProgress } from '../game/types';
import { bossHpLeft } from '../game/logic';

interface Props {
  dungeon: Dungeon;
  player: PlayerProgress;
  variant: 'victory' | 'defeated';
  onViewReport: () => void;
  onNewDungeon: () => void;
  onExtend: () => void;
}

function formatTimeRemaining(deadlineISO: string): string {
  const diff = new Date(deadlineISO).getTime() - Date.now();
  if (diff <= 0) return '0m';
  const totalMins = Math.floor(diff / 60_000);
  const days = Math.floor(totalMins / 1440);
  const hrs = Math.floor((totalMins % 1440) / 60);
  const mins = totalMins % 60;
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function SettlementScreen({ dungeon, player, variant, onViewReport, onNewDungeon, onExtend }: Props) {
  const isVictory = variant === 'victory';
  const totalMonsters = dungeon.rooms.reduce((s, r) => s + r.monsters.length, 0);
  const slain = dungeon.rooms.reduce((s, r) => s + r.monsters.filter((m) => m.defeated).length, 0);
  const hpLeft = bossHpLeft(dungeon);
  const timeLeft = formatTimeRemaining(dungeon.deadlineISO);

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <img
          src={`/assets/${isVictory ? 'mascot-celebrate' : 'mascot-anxious'}.png`}
          alt="Ghost mascot"
          style={styles.mascot}
        />

        <h1 style={{ ...styles.title, color: isVictory ? 'var(--color-success)' : 'var(--color-danger)' }}>
          {isVictory ? '✦ VICTORY ✦' : '✦ DEFEATED ✦'}
        </h1>

        <p style={styles.flavour}>
          {isVictory
            ? 'The Deadline crumbles! Your focus conquered the dungeon!'
            : 'The Deadline struck while tasks remained. The Boss claims this dungeon...'}
        </p>

        <div style={styles.statsGrid}>
          <Stat label="TOTAL XP" value={String(player.totalXp)} />
          <Stat label="LEVEL" value={String(player.level)} />
          <Stat label="STREAK" value={`${player.streakDays}🔥`} />
          <Stat label="SLAIN" value={`${slain}/${totalMonsters}`} />
          {isVictory
            ? <Stat label="TIME LEFT" value={timeLeft} />
            : <Stat label="HP LEFT" value={`${hpLeft} HP`} />}
        </div>

        <div style={styles.buttons}>
          {!isVictory && (
            <button style={{ ...styles.btn, ...styles.btnPrimary }} onClick={onExtend}>
              Extend Deadline +24h
            </button>
          )}
          <button style={{ ...styles.btn, ...styles.btnSecondary }} onClick={onViewReport}>
            View Report Card
          </button>
          <button style={{ ...styles.btn, ...styles.btnGhost }} onClick={onNewDungeon}>
            New Dungeon
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={statStyles.wrap}>
      <span style={statStyles.label}>{label}</span>
      <span style={statStyles.value}>{value}</span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(27,16,53,0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    padding: '16px',
  },
  card: {
    background: 'var(--color-panel)',
    border: '2px solid var(--color-panel-edge)',
    borderRadius: '16px',
    padding: '32px 28px',
    maxWidth: '520px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
  },
  mascot: { width: 96, height: 96 },
  title: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '18px',
    margin: 0,
    textAlign: 'center',
    lineHeight: 1.5,
  },
  flavour: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 600,
    fontSize: '14px',
    color: 'var(--color-secondary)',
    textAlign: 'center',
    margin: 0,
    lineHeight: 1.6,
  },
  statsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px',
    justifyContent: 'center',
    width: '100%',
  },
  buttons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    width: '100%',
  },
  btn: {
    fontFamily: "'Nunito', sans-serif",
    fontWeight: 800,
    fontSize: '15px',
    padding: '12px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    border: 'none',
    width: '100%',
  },
  btnPrimary: {
    background: 'var(--color-pumpkin)',
    border: '3px solid #1E1033',
    borderRadius: 12,
    color: 'var(--color-text)',
  },
  btnSecondary: {
    background: 'var(--color-panel-edge)',
    color: 'var(--color-text)',
  },
  btnGhost: {
    background: 'transparent',
    border: '1px solid var(--color-panel-edge)',
    color: 'var(--color-secondary)',
  },
};

const statStyles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 14px',
    background: 'var(--color-bg)',
    border: '1px solid var(--color-panel-edge)',
    borderRadius: '8px',
    minWidth: '80px',
  },
  label: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '7px',
    color: 'var(--color-secondary)',
  },
  value: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '12px',
    color: 'var(--color-pumpkin)',
  },
};
