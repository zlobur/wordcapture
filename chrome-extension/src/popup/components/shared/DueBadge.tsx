import { theme as t } from "@/shared/theme";

export function DueBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, padding: "0 5px", borderRadius: 8,
      background: t.warnBg, color: t.warn, lineHeight: "16px",
    }}>{count}</span>
  );
}
