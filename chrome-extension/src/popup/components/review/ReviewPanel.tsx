import { theme as t } from "@/shared/theme";
import { useDecks, useCards, useCategories } from "@/popup/stores/dataStore";
import { CategoryDot } from "@/popup/components/shared/CategoryDot";
import { DueBadge } from "@/popup/components/shared/DueBadge";

export function ReviewPanel() {
  const { decks } = useDecks();
  const { getDueCount, getDueCountTotal } = useCards();
  const { categories } = useCategories();

  const totalDue = getDueCountTotal();
  const dueDecks = decks.filter((d) => getDueCount(d.id) > 0);

  return (
    <div style={{ padding: 12, textAlign: "center" }}>
      <div style={{ fontSize: 15, color: t.text, fontWeight: 700, marginBottom: 3, marginTop: 20 }}>{totalDue} cards due</div>
      <div style={{ fontSize: 10, color: t.textDim, marginBottom: 14 }}>from {dueDecks.length} decks</div>
      <button onClick={() => alert("Review coming in Stage 4")} style={{
        padding: "11px 40px", borderRadius: 9, background: t.gradient,
        border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
        cursor: "pointer", marginBottom: 16, fontFamily: t.fontFamily,
      }}>▶ Start Review</button>
      {dueDecks.length > 0 && (
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 9, color: t.textGhost, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>By deck</div>
          {dueDecks.map((d) => {
            const cat = categories.find((c) => c.id === d.categoryId);
            const due = getDueCount(d.id);
            return (
              <div key={d.id} style={{
                display: "flex", alignItems: "center", gap: 6, padding: "5px 7px", marginBottom: 2,
                background: t.bgCard, borderRadius: 5, border: `1px solid ${t.border}`,
              }}>
                <CategoryDot color={cat?.color} size={5} />
                <span style={{ fontSize: 11, color: t.text, flex: 1 }}>{d.name}</span>
                <DueBadge count={due} />
                <button onClick={() => alert("Review coming in Stage 4")} style={{
                  fontSize: 9, background: t.accentGlow, color: t.accent,
                  border: `1px solid ${t.borderHover}`, borderRadius: 4,
                  padding: "2px 7px", cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily,
                }}>▶</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
