import type { TaskMonster } from '../game/types';
import HpBar from './HpBar';

const MONSTER_ART: Record<number, string> = {
  1: '/assets/monster-1-alarm-imp.png',
  2: '/assets/monster-2-doc-slime.png',
  3: '/assets/monster-3-stickynote-bat.png',
  4: '/assets/monster-4-coffee-golem.png',
  5: '/assets/monster-5-inbox-hydra.png',
  6: '/assets/monster-6-printer-behemoth.png',
};

const TIER_COLORS: Record<number, string> = {
  1: 'var(--color-success)',
  2: 'var(--color-success)',
  3: 'var(--color-pumpkin)',
  4: 'var(--color-pumpkin)',
  5: 'var(--color-danger)',
  6: 'var(--color-danger)',
};

const TIER_LABELS: Record<number, string> = {
  1: 'T1',
  2: 'T2',
  3: 'T3',
  4: 'T4',
  5: 'T5',
  6: 'T6',
};

interface Props {
  monster: TaskMonster;
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function MonsterCard({ monster, selected, onSelect }: Props) {
  const defeated = monster.hp <= 0;

  function handleClick() {
    if (!defeated) onSelect(monster.id);
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        borderRadius: '10px',
        border: defeated
          ? '2px solid transparent'
          : selected
          ? '2px solid var(--color-pumpkin)'
          : '2px solid var(--color-panel-edge)',
        background: 'var(--color-panel)',
        cursor: defeated ? 'default' : 'pointer',
        transition: 'border 150ms ease, box-shadow 150ms ease',
        boxShadow: selected && !defeated ? '0 0 8px 2px rgba(255,140,26,0.3)' : 'none',
        filter: defeated ? 'grayscale(1)' : 'none',
        opacity: defeated ? 0.6 : 1,
        position: 'relative',
        minWidth: '180px',
      }}
    >
      {/* Tier badge */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          right: '8px',
          fontFamily: "'Press Start 2P', monospace",
          fontSize: '8px',
          color: TIER_COLORS[monster.tier],
          background: 'rgba(0,0,0,0.4)',
          padding: '2px 5px',
          borderRadius: '4px',
          border: `1px solid ${TIER_COLORS[monster.tier]}`,
        }}
      >
        {TIER_LABELS[monster.tier]}
      </div>

      {/* Art + name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src={MONSTER_ART[monster.tier]}
          alt={monster.title}
          width={48}
          height={48}
          style={{ imageRendering: 'pixelated' }}
        />
        <div>
          <div
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: '13px',
              color: 'var(--color-text)',
              lineHeight: 1.3,
            }}
          >
            {monster.title}
          </div>
          {!defeated && (
            <div
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontSize: '11px',
                color: 'var(--color-secondary)',
                marginTop: '2px',
              }}
            >
              {monster.hp} / {monster.maxHp} HP
            </div>
          )}
        </div>
      </div>

      {/* HP bar or defeated stamp */}
      {defeated ? (
        <div
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: '9px',
            color: 'var(--color-success)',
            textAlign: 'center',
            padding: '4px 0',
          }}
        >
          DEFEATED
        </div>
      ) : (
        <HpBar hp={monster.hp} maxHp={monster.maxHp} />
      )}
    </div>
  );
}
