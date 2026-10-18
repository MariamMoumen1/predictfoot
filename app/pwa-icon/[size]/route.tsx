import { ImageResponse } from "next/og";

export async function GET(req: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size } = await params;
  const s = Math.min(Math.max(Number(size) || 512, 48), 1024);
  const maskable = new URL(req.url).searchParams.has("maskable");
  const ball = Math.round(s * (maskable ? 0.5 : 0.62));

  return new ImageResponse(
    (
      <div
        style={{
          width: s,
          height: s,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #0d2d5e, #081b3f)",
          borderRadius: maskable ? 0 : Math.round(s * 0.22),
        }}
      >
        <svg width={ball} height={ball} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#9fc2ff" strokeWidth="3" />
          <polygon points="50,30 69,44 62,66 38,66 31,44" fill="#0b2a6b" />
          <path d="M50 30V4M69 44l26-8M62 66l16 22M38 66L22 88M31 44L5 36" stroke="#0b2a6b" strokeWidth="4" fill="none" />
        </svg>
      </div>
    ),
    { width: s, height: s }
  );
}
