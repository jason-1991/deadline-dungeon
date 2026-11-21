import { ALL_BADGES } from '../game/logic';
import type { BadgeId } from '../game/types';

const BADGE_EMOJI: Record<BadgeId, string> = {
  first_blood:   '🗡️',
  dungeon_clear: '🏰',
  speed_runner:  '⚡',
  no_extend:     '🚫',
  streak_3:      '🎩',
  streak_7:      '⚔️',
  centurion:     '💯',
  exterminator:  '🧹',
  boss_slayer:   '☠️',
  overtime:      '⏰',
};

interface Props {
  earnedIds: BadgeId[];
}

export default function BadgeShelf({ earnedIds }: Props) {
  const earnedSet = new Set<BadgeId>(earnedIds);

  return (
    <div style={styles.grid}>
      {ALL_BADGES.map((badge) => {
        const earned = earnedSet.has(badge.id);
        return (
          <div
            key={badge.id}
            title={badge.description}
            style={{ ...styles.badge, ...(earned ? styles.earned : styles.locked) }}
          >
            <span style={styles.emoji}>{BADGE_EMOJI[badge.id]}</span>
            <span style={styles.name}>{badge.name}</span>
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'flex-start',
  },
  badge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '10px 12px',
    borderRadius: '10px',
    border: '2px solid',
    minWidth: '72px',
    cursor: 'default',
    transition: 'opacity 150ms ease',
  },
  earned: {
    background: 'rgba(74,222,128,0.12)',
    borderColor: 'var(--color-success)',
  },
  locked: {
    background: 'rgba(167,155,199,0.06)',
    borderColor: 'var(--color-secondary)',
    opacity: 0.4,
    filter: 'grayscale(0.6)',
  },
  emoji: {
    fontSize: '22px',
    lineHeight: 1,
  },
  name: {
    fontFamily: "'Press Start 2P', monospace",
    fontSize: '6px',
    color: 'var(--color-secondary)',
    textAlign: 'center',
    lineHeight: 1.4,
  },
};
