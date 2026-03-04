import { useState } from "react";
import { theme as t } from "@/shared/theme";
import { useDecks, useCards, useCategories } from "@/popup/stores/dataStore";
import { CategoryDot } from "@/popup/components/shared/CategoryDot";
import { DueBadge } from "@/popup/components/shared/DueBadge";
import { ReviewSession } from "./ReviewSession";
import type { Card } from "@/shared/types";

export function ReviewPanel() {
  const { decks } = useDecks();
  const { cards, getDueCount, getDueCountTotal } = useCards();
  const { categories } = useCategories();
  const [sessionCards, setSessionCards] = useState<Card[] | null>(null);

  const totalDue = getDueCountTotal();
  const now = new Date().toISOString();

  const getDueCards = (deckId?: string): Card[] => {
    return cards.filter((c) => {
      if (c.deckId === null) return false;
      if (deckId && c.deckId !== deckId) return false;
      return c.srs.nextReviewAt === null || c.srs.nextReviewAt <= now;
    });
  };

  const startAll = () => {
    const due = getDueCards();
    if (due.length > 0) setSessionCards(due);
  };

  const startDeck = (deckId: string) => {
    const due = getDueCards(deckId);
    if (due.length > 0) setSessionCards(due);
  };

  if (sessionCards) {
    return <ReviewSession cards={sessionCards} onFinish={() => setSessionCards(null)} />;
  }

  const dueDecks = decks.filter((d) => getDueCount(d.id) > 0);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ textAlign: "center", marginTop: 16, marginBottom: 14 }}>
        <div style={{ fontSize: 15, color: t.text, fontWeight: 700, marginBottom: 3 }}>
          {totalDue > 0 ? `${totalDue} cards due` : "All caught up!"}
        </div>
        <div style={{ fontSize: 10, color: t.textDim, marginBottom: 14 }}>
          {totalDue > 0 ? `from ${dueDecks.length} decks` : "No cards to review right now"}
        </div>
        {totalDue > 0 && (
          <button onClick={startAll} style={{
            padding: "11px 40px", borderRadius: 9, background: t.gradient,
            border: "none", color: "#fff", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: t.fontFamily,
          }}>{"\u25b6"} Start Review</button>
        )}
      </div>

      {dueDecks.length > 0 && (
        <div>
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
                <button onClick={() => startDeck(d.id)} style={{
                  fontSize: 9, background: t.accentGlow, color: t.accent,
                  border: `1px solid ${t.borderHover}`, borderRadius: 4,
                  padding: "2px 7px", cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily,
                }}>{"\u25b6"}</button>
              </div>
            );
          })}
        </div>
      )}

      {totalDue === 0 && (
        <div style={{ textAlign: "center", padding: 16, color: t.textGhost, fontSize: 10, lineHeight: 1.8 }}>
          Move cards from Inbox to a deck,<br />then they will appear here for review.
        </div>
      )}
    </div>
  );
}
