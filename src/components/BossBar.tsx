import { useState, useEffect } from 'react';
import HpBar from './HpBar';
import type { Dungeon } from '../game/types';
import { bossMaxHp, bossHpLeft } from '../game/logic';
import { ART } from '../assets/images';

interface Props {
  dungeon: Dungeon;
  now: Date;
}

function formatCountdown(deadlineISO: string, now: Date): string {
  const diff = new Date(deadlineISO).getTime() - now.getTime();
  if (diff <= 0) return 'EXPIRED';
  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hrs = Math.floor((totalSecs % 86400) / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  if (days > 0) return `${days}d ${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return `${mins}m`;
}

export default function BossBar({ dungeon, now }: Props) {
  const [tick, setTick] = useState(now);

  useEffect(() => {
    const id = setInterval(() => setTick(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const maxHp = bossMaxHp(dungeon);
  const hpLeft = bossHpLeft(dungeon);
  const hpPct = maxHp > 0 ? hpLeft / maxHp : 0;

  const msLeft = new Date(dungeon.deadlineISO).getTime() - tick.getTime();
  const under24h = msLeft < 24 * 60 * 60 * 1000;
  const isDefeated = hpLeft === 0;
  const isVictory = isDefeated;

  let mascot: string;
  if (isVictory) mascot = 'mascot-celebrate';
  else if (under24h || hpPct < 0.15) mascot = 'mascot-anxious';
  else mascot = 'mascot-encourage';

  const countdown = formatCountdown(dungeon.deadlineISO, tick);

  return (
    <div style={styles.wrap}>
      <img src={ART['boss-deadline']} alt="The Deadline Boss" style={styles.bossArt} />
      <div style={styles.body}>
        <div style={styles.topRow}>
          <span style={styles.label}>THE DEADLINE</span>
          <div style={styles.countdownWrap}>
            <span style={styles.countdownLabel}>TIME LEFT</span>
            <span style={{ ...styles.countdown, color: under24h ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {countdown}
            </span>
          </div>
        </div>
        <div style={styles.barWrap}>
          <HpBar hp={hpLeft} maxHp={maxHp} boss />
        </div>
        <div style={styles.hpNumbers}>{hpLeft} / {maxHp} HP</div>
      </div>
      <img src={ART[mascot]} alt="Ghost mascot" style={styles.mascot} />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    background: 'var(--color-panel)',
    border: '2px solid var(--color-panel-edge)',
    borderRadius: '12px',
    padding: '14px 18px',
    width: '100%',
  },
  bossArt: { width: 72, height: 72, imageRendering: 'pixelated', flexShrink: 0 },
  body: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', minWidth: 0 },
  topRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '4px' },
  label: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    color: 'var(--color-secondary)',
    letterSpacing: '0.05em',
  },
  countdownWrap: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
  countdownLabel: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '7px',
    color: 'var(--color-secondary)',
  },
  countdown: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '12px',
  },
  barWrap: { width: '100%' },
  hpNumbers: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '10px',
    color: 'var(--color-text)',
    textAlign: 'right',
  },
  mascot: { width: 56, height: 56, flexShrink: 0 },
};
