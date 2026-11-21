type Props = { hp: number; maxHp: number; boss?: boolean };

export default function HpBar({ hp, maxHp, boss }: Props) {
  const pct = Math.max(0, Math.min(100, Math.round((hp / Math.max(1, maxHp)) * 100)));
  const isLow = pct < 15;
  const fillGradient =
    pct > 35 ? "var(--color-hp-high)" : pct >= 15 ? "var(--color-hp-mid)" : "var(--color-hp-low)";
  const height = boss ? 26 : 18;
  const endCap = boss ? "⏰" : "💀";

  return (
    <div
      style={{
        background: "var(--color-track)",
        border: "2px solid var(--color-panel-edge)",
        height,
        width: "100%",
        borderRadius: 9,
        position: "relative",
        overflow: "visible",
      }}
    >
      <div
        style={{
          width: pct + "%",
          height: "100%",
          background: fillGradient,
          borderRadius: 9,
          animation: isLow ? "hp-pulse 1s ease-in-out infinite" : undefined,
          position: "relative",
        }}
      >
        {pct > 0 && (
          <span
            style={{
              position: "absolute",
              right: -8,
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: 14,
              lineHeight: 1,
              pointerEvents: "none",
              userSelect: "none",
            }}
          >
            {endCap}
          </span>
        )}
      </div>
    </div>
  );
}
