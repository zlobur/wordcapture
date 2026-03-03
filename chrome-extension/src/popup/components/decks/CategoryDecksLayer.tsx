import { theme as t } from "@/shared/theme";
import { useDecks, useCards } from "@/popup/stores/dataStore";
import { Layer } from "@/popup/components/Layer";
import { DueBadge } from "@/popup/components/shared/DueBadge";
import { LangPairBadge } from "@/popup/components/shared/LangPairBadge";
import type { Category, Deck } from "@/shared/types";

interface Props {
  category: Category;
  onSelectDeck: (deck: Deck) => void;
  onBack: () => void;
}

export function CategoryDecksLayer({ category, onSelectDeck, onBack }: Props) {
  const { decks, add: addDeck } = useDecks();
  const { getByDeck, getDueCount } = useCards();
  const catDecks = decks.filter((d) => d.categoryId === category.id);

  const handleNew = () => {
    const name = prompt("Deck name:");
    if (!name?.trim()) return;
    addDeck({ name: name.trim(), categoryId: category.id });
  };

  return (
    <Layer depth={1} edgeLabel={`← ${category.name}`} edgeColor={`${category.color}25`} onBack={onBack}>
      <div style={{ padding: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: category.color }} />
          <span style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>{category.name}</span>
          {category.type === "language" && <LangPairBadge from={category.sourceLang} to={category.targetLang} />}
        </div>
        {catDecks.map((deck) => {
          const cardCount = getByDeck(deck.id).length;
          const dueCount = getDueCount(deck.id);
          return (
            <div key={deck.id} onClick={() => onSelectDeck(deck)}
              style={{
                display: "flex", alignItems: "center", padding: "9px 10px", marginBottom: 3,
                background: t.bgCard, borderRadius: 8, cursor: "pointer",
                border: `1px solid ${t.border}`, transition: "all 0.12s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCardHover; (e.currentTarget as HTMLDivElement).style.borderColor = t.borderHover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCard; (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
            >
              <div style={{ width: 8, height: 8, borderRadius: 2, background: category.color, marginRight: 8, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: t.text, fontWeight: 600, fontSize: 12 }}>{deck.name}</div>
                <div style={{ fontSize: 9, color: t.textDim }}>{cardCount} cards</div>
              </div>
              <DueBadge count={dueCount} />
              <span style={{ color: t.textGhost, fontSize: 12, marginLeft: 4 }}>›</span>
            </div>
          );
        })}
        {catDecks.length === 0 && (
          <div style={{ textAlign: "center", padding: 16, color: t.textGhost, fontSize: 10 }}>No decks yet</div>
        )}
        <button onClick={handleNew} style={{
          width: "100%", marginTop: 4, padding: "7px 0", fontSize: 10, color: t.accent,
          background: "transparent", border: `1px dashed ${t.borderHover}`,
          borderRadius: 7, cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily,
        }}>+ New Deck</button>
      </div>
    </Layer>
  );
}
