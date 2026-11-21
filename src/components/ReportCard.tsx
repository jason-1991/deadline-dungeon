import type { Dungeon, PlayerProgress, BadgeId } from '../game/types';
import { bossMaxHp, bossHpLeft } from '../game/logic';
import BadgeShelf from './BadgeShelf';

interface Props {
  dungeon: Dungeon;
  player: PlayerProgress;
  variant: 'victory' | 'defeated';
  onClose: () => void;
}

const P2 = "'Press Start 2P', monospace";
const NU = "'Nunito', sans-serif";
const SEC = 'var(--color-secondary)';
const PKN = 'var(--color-pumpkin)';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '5px 0', borderBottom: '1px solid rgba(74,47,127,0.4)' }}>
      <span style={{ fontFamily: P2, fontSize: '7px', color: SEC }}>{label}</span>
      <span style={{ fontFamily: P2, fontSize: '10px', color: PKN }}>{value}</span>
    </div>
  );
}

export default function ReportCard({ dungeon, player, variant, onClose }: Props) {
  const win = variant === 'victory';
  const totalM = dungeon.rooms.reduce((s, r) => s + r.monsters.length, 0);
  const slain  = dungeon.rooms.reduce((s, r) => s + r.monsters.filter((m) => m.defeated).length, 0);
  const clearedR = dungeon.rooms.filter((r) => r.monsters.every((m) => m.defeated)).length;
  const hpLeft = bossHpLeft(dungeon);
  const maxHp  = bossMaxHp(dungeon);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,16,53,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
      <div style={{ position: 'relative', width: '100%', maxWidth: '900px' }}>
        <button onClick={onClose} aria-label="Close" style={{ position: 'absolute', top: -16, right: -16,
          zIndex: 201, background: 'var(--color-panel)', border: '2px solid var(--color-panel-edge)',
          borderRadius: '50%', width: 36, height: 36, color: 'var(--color-text)', fontFamily: NU,
          fontWeight: 800, fontSize: '16px', cursor: 'pointer' }}>✕</button>

        {/* Card — 1200×630 target for screenshot; responsive at ≤900px */}
        <div style={{ background: 'var(--color-panel)', border: '2px solid var(--color-panel-edge)',
          borderRadius: '16px', display: 'flex', overflow: 'hidden', minHeight: '400px' }}>

          {/* Left */}
          <div style={{ flex: '1 1 55%', padding: '28px 24px', display: 'flex',
            flexDirection: 'column', gap: '14px', borderRight: '2px solid var(--color-panel-edge)' }}>
            <div style={{ fontFamily: P2, fontSize: '7px', color: SEC, letterSpacing: '0.08em' }}>DUNGEON REPORT</div>
            <div style={{ fontFamily: P2, fontSize: '14px', color: 'var(--color-text)', lineHeight: 1.5 }}>{dungeon.name}</div>
            <div style={{ display: 'inline-flex', alignSelf: 'flex-start', fontFamily: P2, fontSize: '11px',
              padding: '6px 14px', borderRadius: '6px', border: '2px solid',
              background: win ? 'rgba(74,222,128,0.18)' : 'rgba(229,72,77,0.18)',
              borderColor: win ? 'var(--color-success)' : 'var(--color-danger)',
              color: win ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {win ? 'VICTORY' : 'DEFEATED'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Row label="LEVEL"          value={String(player.level)} />
              <Row label="TOTAL XP"       value={String(player.totalXp)} />
              <Row label="STREAK"         value={`${player.streakDays} days`} />
              <Row label="MONSTERS SLAIN" value={`${slain} / ${totalM}`} />
              <Row label="ROOMS CLEARED"  value={`${clearedR} / ${dungeon.rooms.length}`} />
              <Row label="FOCUS MINS"     value={String(maxHp - hpLeft)} />
            </div>
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: P2, fontSize: '8px', color: SEC }}>BADGES</div>
              <BadgeShelf earnedIds={player.earnedBadgeIds as BadgeId[]} />
            </div>
          </div>

          {/* Right */}
          <div style={{ flex: '0 0 38%', padding: '28px 20px', display: 'flex',
            flexDirection: 'column', alignItems: 'center', gap: '12px', background: '#1B1035' }}>
            <img src="/assets/boss-deadline.png" alt="Deadline Boss"
              style={{ width: 120, height: 120, imageRendering: 'pixelated' }} />
            <div style={{ fontFamily: P2, fontSize: '9px', color: SEC }}>THE DEADLINE</div>
            <div>
              <span style={{ fontFamily: P2, fontSize: '20px', color: PKN }}>{hpLeft}</span>
              <span style={{ fontFamily: P2, fontSize: '14px', color: SEC }}> / </span>
              <span style={{ fontFamily: P2, fontSize: '20px', color: PKN }}>{maxHp}</span>
              <span style={{ fontFamily: P2, fontSize: '11px', color: SEC }}> HP</span>
            </div>
            <img src={`/assets/${win ? 'mascot-celebrate' : 'mascot-anxious'}.png`}
              alt="Ghost mascot" style={{ width: 80, height: 80 }} />
            <div style={{ fontFamily: NU, fontWeight: 600, fontSize: '12px', color: SEC,
              textAlign: 'center', fontStyle: 'italic', lineHeight: 1.6 }}>
              {win ? '"The Boss falls! Your focus prevails!"'
                   : '"The Deadline strikes again... but the ghost fights on."'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
