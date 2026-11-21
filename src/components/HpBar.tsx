
type Props = { hp: number; maxHp: number; boss?: boolean };

export default function HpBar({ hp, maxHp, boss }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((hp / Math.max(1, maxHp)) * 100)));
  const color = pct > 35 ? "var(--color-hp-high)" : pct >= 15 ? "var(--color-hp-mid)" : "var(--color-hp-low)";
  const height = boss ? 26 : 18;
  return (
    <div style={{ background: "var(--color-panel)", border: "2px solid var(--color-border)", height, width: "100%", borderRadius: 9 }}>
      <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 9 }} />
    </div>
  );
}
