import { useState, useEffect, useRef } from 'react';

interface Props {
  onDealDamage: (minutes: number) => void;
  disabled?: boolean;
}

type Phase = 'idle' | 'running' | 'paused';

const btn: React.CSSProperties = { fontFamily: "'Nunito', sans-serif", fontWeight: 800, fontSize: '13px', padding: '6px 14px', borderRadius: '6px', border: '1px solid var(--color-panel-edge)', cursor: 'pointer', background: 'var(--color-panel)', color: 'var(--color-text)' };
const btnPrimary: React.CSSProperties = { ...btn, background: 'var(--color-pumpkin)', border: '3px solid #1E1033', borderRadius: 12, color: 'var(--color-text)' };
const btnDanger: React.CSSProperties = { ...btn, border: '1px solid var(--color-danger)', color: 'var(--color-danger)' };

export default function FocusTimer({ onDealDamage, disabled }: Props) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [customInput, setCustomInput] = useState('');
  const [useCustom, setUseCustom] = useState(false);
  const [msRemaining, setMsRemaining] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  const effectivePlanned = useCustom ? Math.max(1, parseInt(customInput || '1', 10) || 1) : plannedMinutes;

  function clearTick() {
    if (intervalRef.current !== null) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }

  function startTick(endTs: number) {
    clearTick();
    intervalRef.current = setInterval(() => {
      const left = endTs - Date.now();
      if (left <= 0) {
        clearTick(); setMsRemaining(0); setPhase('idle');
        elapsedBeforePauseRef.current = 0;
        onDealDamage(effectivePlanned);
      } else {
        setMsRemaining(left);
      }
    }, 250);
  }

  useEffect(() => () => clearTick(), []);

  function handleStart() {
    const totalMs = effectivePlanned * 60 * 1000;
    const endTs = Date.now() + totalMs;
    startedAtRef.current = Date.now();
    elapsedBeforePauseRef.current = 0;
    setMsRemaining(totalMs); setPhase('running');
    startTick(endTs);
  }

  function handlePause() {
    clearTick();
    elapsedBeforePauseRef.current += Date.now() - startedAtRef.current;
    setPhase('paused');
  }

  function handleResume() {
    const endTs = Date.now() + msRemaining;
    startedAtRef.current = Date.now();
    setPhase('running'); startTick(endTs);
  }

  function handleAbandon() {
    clearTick();
    const totalElapsedMs = phase === 'running'
      ? elapsedBeforePauseRef.current + (Date.now() - startedAtRef.current)
      : elapsedBeforePauseRef.current;
    const elapsedMinutes = Math.floor(totalElapsedMs / 60_000);
    setPhase('idle'); setMsRemaining(0); elapsedBeforePauseRef.current = 0;
    if (elapsedMinutes >= 1) onDealDamage(elapsedMinutes);
  }

  const displayMs = phase === 'idle' ? effectivePlanned * 60 * 1000 : msRemaining;
  const totalSec = Math.ceil(displayMs / 1000);
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--color-panel)', border: '2px solid var(--color-panel-edge)', borderRadius: '12px', width: '100%', maxWidth: '420px', margin: '0 auto', opacity: disabled && phase === 'idle' ? 0.5 : 1, pointerEvents: disabled && phase === 'idle' ? 'none' : 'auto' }}>
      {/* Countdown */}
      <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '32px', color: phase === 'running' ? 'var(--color-pumpkin)' : 'var(--color-text)', letterSpacing: '2px' }}>
        {mm}:{ss}
      </div>

      {/* Preset + custom — only while idle */}
      {phase === 'idle' && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {([25, 50] as const).map((n) => (
            <button key={n} style={!useCustom && plannedMinutes === n ? btnPrimary : btn}
              onClick={() => { setPlannedMinutes(n); setUseCustom(false); }}>
              {n} min
            </button>
          ))}
          <input type="number" min={1} max={999} placeholder="custom" value={customInput}
            onChange={(e) => { const v = e.target.value; setCustomInput(v); if (v !== '') { setUseCustom(true); } else { setUseCustom(false); } }}
            onFocus={() => setUseCustom(true)}
            style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: useCustom ? '1px solid var(--color-pumpkin)' : '1px solid var(--color-panel-edge)', background: 'var(--color-panel)', color: 'var(--color-text)', fontFamily: "'Nunito', sans-serif", fontWeight: 600, fontSize: '13px' }} />
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {phase === 'idle' && <button style={btnPrimary} onClick={handleStart}>Start</button>}
        {phase === 'running' && <button style={btn} onClick={handlePause}>Pause</button>}
        {phase === 'paused' && <button style={btnPrimary} onClick={handleResume}>Resume</button>}
        {phase !== 'idle' && <button style={btnDanger} onClick={handleAbandon}>Abandon</button>}
      </div>

      {phase !== 'idle' && (
        <div style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>
          {phase === 'running' ? 'Focus in progress…' : 'Paused — resume when ready'}
        </div>
      )}
    </div>
  );
}
