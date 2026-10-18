const HEX = "50,3 93,27 93,73 50,97 7,73 7,27";
const HEX_IN = "50,11 86,31 86,69 50,89 14,69 14,31";

const themes: Record<string, { a: string; b: string; glow: string; icon: string }> = {
  FIRST: { a: "#fde047", b: "#d97706", glow: "#f59e0b", icon: "crown" },
  STREAK5: { a: "#f87171", b: "#b91c1c", glow: "#ef4444", icon: "flame" },
  PRECISION10: { a: "#38bdf8", b: "#1d4ed8", glow: "#3b82f6", icon: "target" },
  CHAMPION: { a: "#fbbf24", b: "#ea580c", glow: "#f97316", icon: "crown" },
  EXPERT20: { a: "#a78bfa", b: "#6d28d9", glow: "#8b5cf6", icon: "crown" },
  LEGEND50: { a: "#34d399", b: "#047857", glow: "#10b981", icon: "crown" },
  MASTER100: { a: "#f472b6", b: "#be185d", glow: "#ec4899", icon: "crown" },
  VIP200: { a: "#22d3ee", b: "#0e7490", glow: "#06b6d4", icon: "crown" },
};

function Icon({ kind, color }: { kind: string; color: string }) {
  if (kind === "flame")
    return (
      <g>
        <path d="M50 24c3 10 14 16 14 30a14 14 0 0 1-28 0c0-7 4-11 7-15 1 5 4 7 6 7-3-8-1-14 1-22z" fill={color} />
        <path d="M50 46c2 6 8 9 8 16a8 8 0 0 1-16 0c0-4 3-7 5-9 0 3 1 4 3 4-1-4-1-7 0-11z" fill="#fde68a" opacity=".9" />
      </g>
    );
  if (kind === "target")
    return (
      <g>
        <circle cx="48" cy="52" r="20" fill={color} />
        <circle cx="48" cy="52" r="14" fill="#ef4444" />
        <circle cx="48" cy="52" r="8" fill={color} />
        <circle cx="48" cy="52" r="3.5" fill="#ef4444" />
        <path d="M50 50L70 30M64 28l8 0 0 8" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
    );
  return (
    <g>
      <path d="M30 66L26 38l15 12 9-18 9 18 15-12-4 28z" fill={color} />
      <rect x="30" y="68" width="40" height="6" rx="2" fill={color} />
      <circle cx="26" cy="37" r="3" fill={color} />
      <circle cx="50" cy="30" r="3" fill={color} />
      <circle cx="74" cy="37" r="3" fill={color} />
    </g>
  );
}

export function HexBadge({ code, locked = false, size = 72 }: { code: string; locked?: boolean; size?: number }) {
  const t = themes[code] ?? themes.FIRST;
  const id = `${code}-${locked ? "l" : "u"}`;
  const a = locked ? "#cbd5e1" : t.a;
  const b = locked ? "#64748b" : t.b;
  const iconColor = locked ? "#e2e8f0" : "#fff7d6";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={locked ? undefined : { filter: `drop-shadow(0 6px 10px ${t.glow}66)` }}
      aria-label={code}
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
        <linearGradient id={`s-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={HEX} fill={`url(#g-${id})`} stroke={b} strokeWidth="2.5" strokeLinejoin="round" />
      <polygon points={HEX_IN} fill={`url(#g-${id})`} stroke="#ffffff55" strokeWidth="1.5" strokeLinejoin="round" />
      <polygon points={HEX_IN} fill={`url(#s-${id})`} />
      <g opacity={locked ? 0.75 : 1}>
        <Icon kind={t.icon} color={iconColor} />
      </g>
    </svg>
  );
}
