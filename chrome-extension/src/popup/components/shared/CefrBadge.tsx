import { theme as t } from "@/shared/theme";
import type { CefrLevel } from "@/shared/types";

const CEFR_COLORS: Record<string, string> = {
  A1: t.success, A2: t.success,
  B1: t.accent, B2: t.accent,
  C1: t.purple, C2: t.purple,
};

export function CefrBadge({ level }: { level?: CefrLevel | null }) {
  if (!level) return null;
  const color = CEFR_COLORS[level] || t.textDim;
  return (
    <span style={{
      fontSize: 8, fontWeight: 700, padding: "1px 4px", borderRadius: 3,
      background: `${color}18`, color,
    }}>{level}</span>
  );
}
