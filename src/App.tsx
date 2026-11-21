import { useState, useEffect, useRef } from 'react';
import {
  bossMaxHp, bossHpLeft, bossState, roomStatus,
  applyDamage, xpForMonster, levelForXp, updateStreak, evaluateBadges,
} from './game/logic';
import type { Dungeon, Room, BadgeId } from './game/types';
import { loadState, saveState, defaultPlayer } from './game/storage';
import type { GameState } from './game/storage';
import CreateDungeonForm from './components/CreateDungeonForm';
import MonsterCard from './components/MonsterCard';
import FocusTimer from './components/FocusTimer';
import BossBar from './components/BossBar';
import SettlementScreen from './components/SettlementScreen';
import ReportCard from './components/ReportCard';

// ── Style tokens ──────────────────────────────────────────────────────────────
const P2 = "'Press Start 2P', monospace";
const NU = "'Nunito', sans-serif";
const SEC = 'var(--color-secondary)';
const PKN = 'var(--color-pumpkin)';

const css = {
  page:  { minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)',
    fontFamily: NU, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', padding: '24px 16px 48px', gap: '24px' },
  header:{ display: 'flex', alignItems: 'center', gap: '16px', width: '100%',
    maxWidth: '900px', justifyContent: 'space-between', flexWrap: 'wrap' as const },
  title: { fontFamily: P2, fontSize: '14px', color: PKN, lineHeight: 1.6, margin: 0 },
  roomRow: { display: 'flex', gap: '12px', width: '100%', maxWidth: '900px', flexWrap: 'wrap' as const },
  roomTitle: { fontFamily: P2, fontSize: '9px', color: SEC, marginBottom: '12px' },
  btn:   { background: 'transparent', border: '1px solid var(--color-panel-edge)',
    borderRadius: '6px', color: SEC, cursor: 'pointer', fontFamily: NU,
    fontSize: '13px', fontWeight: 800, padding: '5px 12px', whiteSpace: 'nowrap' as const },
  stat:  { display: 'flex', flexDirection: 'column' as const, alignItems: 'center',
    gap: '2px', padding: '6px 12px', background: 'var(--color-panel)',
    border: '1px solid var(--color-panel-edge)', borderRadius: '8px' },
  sLbl:  { fontFamily: P2, fontSize: '7px', color: SEC },
  sVal:  { fontFamily: P2, fontSize: '11px', color: PKN },
  manBtn:{ fontFamily: NU, fontWeight: 800, fontSize: '13px', padding: '8px 18px',
    borderRadius: '6px', border: `1px solid ${SEC}`, background: 'transparent', color: SEC, cursor: 'pointer' },
};

function roomStyle(s: 'cleared'|'current'|'locked'): React.CSSProperties {
  const base: React.CSSProperties = { flex:'1 1 240px', background:'var(--color-panel)',
    borderRadius:'12px', padding:'14px', transition:'border 150ms ease' };
  if (s==='cleared') return {...base, border:'2px solid var(--color-success)'};
  if (s==='current') return {...base, border:'2px solid var(--color-pumpkin)', boxShadow:'0 0 10px 2px rgba(255,140,26,0.35)'};
  return {...base, border:'2px solid var(--color-panel-edge)', opacity:0.5, filter:'grayscale(0.4)'};
}

function activeRoom(d: Dungeon): Room|undefined {
  return d.rooms.find((r) => r.monsters.some((m) => !m.defeated));
}

// ── Badge Toast ───────────────────────────────────────────────────────────────
function BadgeToast({ ids, onDone }: { ids: BadgeId[]; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 3500); return () => clearTimeout(t); }, [onDone]);
  if (!ids.length) return null;
  return (
    <div style={{ position:'fixed', bottom:24, right:24, background:'var(--color-panel)',
      border:'2px solid var(--color-success)', borderRadius:'12px', padding:'14px 18px',
      display:'flex', flexDirection:'column', gap:'6px', zIndex:300,
      boxShadow:'0 4px 24px rgba(74,222,128,0.25)' }}>
      <span style={{ fontFamily:P2, fontSize:'8px', color:'var(--color-success)' }}>🏆 BADGE EARNED!</span>
      {ids.map((id) => (
        <span key={id} style={{ fontFamily:NU, fontWeight:800, fontSize:'13px', color:'var(--color-text)' }}>
          {id.replace(/_/g,' ').toUpperCase()}
        </span>
      ))}
    </div>
  );
}

// ── DungeonView ───────────────────────────────────────────────────────────────
function DungeonView({ state, setState, onNewDungeon, onShowReport, settled }:
  { state: GameState; setState: (s: GameState) => void;
    onNewDungeon: () => void; onShowReport: () => void; settled: boolean }) {
  const { dungeon, player } = state;
  if (!dungeon) return null;

  const hpLeft = bossHpLeft(dungeon);
  const maxHp  = bossMaxHp(dungeon);
  const room   = activeRoom(dungeon);
  const now    = new Date();

  const [selId, setSelId]       = useState<string|null>(room?.monsters.find((m) => !m.defeated)?.id ?? null);
  const [toast, setToast]       = useState<BadgeId[]>([]);

  useEffect(() => {
    setSelId(room?.monsters.find((m) => !m.defeated)?.id ?? null);
  }, [dungeon.id, room?.id]);

  function dealDamage(minutes: number) {
    if (!dungeon || !room) return;
    const target = room.monsters.find((m) => m.id===selId && !m.defeated)
      ?? room.monsters.find((m) => !m.defeated);
    if (!target) return;
    const dmg = Math.floor(minutes);
    if (dmg <= 0) return;

    const { hpLeft: newHp, appliedDamage } = applyDamage(target.hp, dmg);
    const died = newHp <= 0;
    const xpGained = died ? xpForMonster(target.maxHp - target.hp + appliedDamage, target.maxHp) : 0;
    const newXp  = player.totalXp + xpGained;
    const { streakDays: ns, lastStreakDateISO: nl } = died
      ? updateStreak(player.streakDays, player.lastStreakDateISO, new Date())
      : { streakDays: player.streakDays, lastStreakDateISO: player.lastStreakDateISO };

    const newDungeon: Dungeon = { ...dungeon, rooms: dungeon.rooms.map((r) =>
      r.id!==room.id ? r : { ...r, monsters: r.monsters.map((m) =>
        m.id!==target.id ? m : { ...m, hp: newHp, defeated: died }) }) };
    const newPlayer = { ...player, totalXp: newXp, level: levelForXp(newXp), streakDays: ns, lastStreakDateISO: nl };

    const badges = evaluateBadges(newDungeon, newPlayer, new Date());
    if (badges.length) { newPlayer.earnedBadgeIds = [...(newPlayer.earnedBadgeIds??[]), ...badges]; setToast(badges); }

    const next: GameState = { dungeon: newDungeon, player: newPlayer };
    saveState(next); setState(next);
    if (died) setSelId(newDungeon.rooms.find((r) => r.id===room.id)?.monsters.find((m) => !m.defeated)?.id ?? null);
  }

  function manualComplete() {
    if (!room) return;
    const t = room.monsters.find((m) => m.id===selId && !m.defeated) ?? room.monsters.find((m) => !m.defeated);
    if (!t || !confirm(`Complete "${t.title}" without focus?`)) return;
    dealDamage(t.hp);
  }

  const hpPct  = hpLeft / Math.max(1, maxHp);
  const msLeft = new Date(dungeon.deadlineISO).getTime() - now.getTime();
  const mascot = hpLeft===0 ? 'mascot-celebrate' : (msLeft < 864e5 || hpPct < 0.15) ? 'mascot-anxious' : 'mascot-encourage';

  return (
    <>
      <div style={css.header}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <img src={`/assets/${mascot}.png`} alt="Ghost" width={64} height={64} />
          <h1 style={css.title}>{dungeon.name}</h1>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center', flexWrap:'wrap' }}>
          {(['LEVEL','XP','STREAK'] as const).map((lbl, i) => (
            <div key={lbl} style={css.stat}>
              <span style={css.sLbl}>{lbl}</span>
              <span style={css.sVal}>{[player.level, player.totalXp, `${player.streakDays}🔥`][i]}</span>
            </div>
          ))}
          {settled && <button style={{...css.btn, borderColor:PKN, color:PKN}} onClick={onShowReport}>Report Card</button>}
          <button style={css.btn} onClick={onNewDungeon}>New Dungeon</button>
        </div>
      </div>

      <div style={{ width:'100%', maxWidth:'900px' }}>
        <BossBar dungeon={dungeon} now={now} />
      </div>

      <div style={css.roomRow}>
        {dungeon.rooms.map((r, idx) => {
          const st = roomStatus(dungeon.rooms, idx);
          return (
            <div key={r.id} style={roomStyle(st)}>
              <div style={css.roomTitle}>{r.title}</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {r.monsters.map((m) => (
                  <MonsterCard key={m.id} monster={m} selected={st==='current' && m.id===selId} onSelect={setSelId} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {room && !settled && (
        <div style={{ width:'100%', maxWidth:'900px', display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
          <FocusTimer onDealDamage={dealDamage} disabled={!room.monsters.find((m) => !m.defeated)} />
          <button style={css.manBtn} onClick={manualComplete}>Complete without focus</button>
        </div>
      )}

      {toast.length > 0 && <BadgeToast ids={toast} onDone={() => setToast([])} />}
    </>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [state, setState]           = useState<GameState>(() => loadState());
  const [showSettlement, setSettle] = useState(false);
  const [showReport, setReport]     = useState(false);
  const variant = useRef<'victory'|'defeated'>('victory');

  useEffect(() => {
    function check() {
      const s = loadState();
      if (!s.dungeon) return;
      const bs = bossState(s.dungeon, new Date());
      if (bs==='ongoing') return;
      variant.current = bs; setState(s); setSettle(true);
    }
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!state.dungeon) return;
    const bs = bossState(state.dungeon, new Date());
    if (bs==='ongoing') return;
    const nb = evaluateBadges(state.dungeon, state.player, new Date());
    if (nb.length) {
      const up: GameState = { ...state, player: { ...state.player,
        earnedBadgeIds: [...(state.player.earnedBadgeIds??[]), ...nb] } };
      saveState(up); setState(up);
    }
    variant.current = bs; setSettle(true);
  }, [state.dungeon]);

  function handleCreate(dungeon: Dungeon) {
    const next: GameState = { dungeon, player: state.player };
    saveState(next); setState(next); setSettle(false); setReport(false);
  }

  function handleNew() {
    if (!confirm('Start a new dungeon? Your current progress will be lost.')) return;
    const next: GameState = { dungeon: null, player: defaultPlayer() };
    saveState(next); setState(next); setSettle(false); setReport(false);
  }

  function handleExtend() {
    if (!state.dungeon) return;
    const newDeadline = new Date(new Date(state.dungeon.deadlineISO).getTime() + 864e5).toISOString();
    const up: GameState = { ...state, dungeon: { ...state.dungeon, deadlineISO: newDeadline,
      extensions: (state.dungeon.extensions ?? 0) + 1 } };
    saveState(up); setState(up); setSettle(false);
  }

  if (!state.dungeon) {
    return <div style={css.page}><CreateDungeonForm onCreate={handleCreate} /></div>;
  }

  const settled = showSettlement || bossState(state.dungeon, new Date()) !== 'ongoing';

  return (
    <div style={css.page}>
      <DungeonView state={state} setState={setState}
        onNewDungeon={handleNew} onShowReport={() => setReport(true)} settled={settled} />

      {showSettlement && state.dungeon && (
        <SettlementScreen dungeon={state.dungeon} player={state.player} variant={variant.current}
          onViewReport={() => { setSettle(false); setReport(true); }}
          onNewDungeon={handleNew} onExtend={handleExtend} />
      )}

      {showReport && state.dungeon && (
        <ReportCard dungeon={state.dungeon} player={state.player}
          variant={variant.current} onClose={() => setReport(false)} />
      )}
    </div>
  );
}
