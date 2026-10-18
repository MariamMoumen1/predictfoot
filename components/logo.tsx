export function BallIcon({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="shrink-0">
      <circle cx="50" cy="50" r="48" fill="#fff" stroke="#0b2a6b" strokeWidth="4" />
      <polygon points="50,30 69,44 62,66 38,66 31,44" fill="#0b2a6b" />
      <path d="M50 30V4M69 44l26-8M62 66l16 22M38 66L22 88M31 44L5 36" stroke="#0b2a6b" strokeWidth="4" fill="none" />
    </svg>
  );
}

export function Logo({ light = false, size = 34 }: { light?: boolean; size?: number }) {
  return (
    <span className={`flex items-center gap-2 text-lg font-bold ${light ? "text-white" : "text-[#0b3a9e]"}`}>
      <BallIcon size={size} /> PredictFoot
    </span>
  );
}
