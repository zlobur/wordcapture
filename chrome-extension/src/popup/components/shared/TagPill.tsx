import { theme as t } from "@/shared/theme";

const TAG_COLORS: Record<string, string> = {
  verb: t.accent, noun: t.purple, adj: t.orange, preposition: t.teal,
  intermediate: t.warn, advanced: t.danger, difficult: t.danger,
  async: t.purple, dotnet: t.purple, memory: t.orange, concurrency: t.teal,
  business: t.accent, finance: t.purple, culture: t.orange, travel: t.teal,
  tense: t.orange, grammar: t.orange, rule: t.warn,
};

export function TagPill({ tag, small, onRemove }: { tag: string; small?: boolean; onRemove?: () => void }) {
  const color = TAG_COLORS[tag] || t.textDim;
  return (
    <span style={{
      fontSize: small ? 8 : 9, padding: small ? "1px 4px" : "1px 6px", borderRadius: 3,
      background: `${color}15`, color, fontWeight: 500,
      display: "inline-flex", alignItems: "center", gap: 2,
    }}>
      #{tag}
      {onRemove && (
        <span onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ cursor: "pointer", opacity: 0.6, fontSize: 7 }}>✕</span>
      )}
    </span>
  );
}
