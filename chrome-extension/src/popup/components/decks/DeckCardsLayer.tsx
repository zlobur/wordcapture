import { theme as t } from "@/shared/theme";
import { useCards } from "@/popup/stores/dataStore";
import { Layer } from "@/popup/components/Layer";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import { TagPill } from "@/popup/components/shared/TagPill";
import type { Category, Deck, Card } from "@/shared/types";

interface Props {
  deck: Deck;
  category: Category;
  onSelectCard: (card: Card) => void;
  onBack: () => void;
}

export function DeckCardsLayer({ deck, category, onSelectCard, onBack }: Props) {
  const { getByDeck, getDueCount } = useCards();
  const cards = getByDeck(deck.id);
  const dueCount = getDueCount(deck.id);

  return (
    <Layer depth={2} edgeLabel={`← ${deck.name}`} edgeColor={`${category?.color || t.accent}18`} onBack={onBack}>
      <div style={{ padding: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: category?.color || t.accent }} />
          <span style={{ color: t.text, fontWeight: 700, fontSize: 13 }}>{deck.name}</span>
          <span style={{ fontSize: 9, color: t.textGhost, marginLeft: "auto" }}>{cards.length}</span>
        </div>
        {dueCount > 0 && (
          <button onClick={() => alert("Review coming in Stage 4")} style={{
            width: "100%", padding: "7px 0", marginBottom: 6, borderRadius: 7,
            background: t.gradient, border: "none", color: "#fff",
            fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: t.fontFamily,
          }}>▶ Review {dueCount}</button>
        )}
        {cards.map((card) => (
          <div key={card.id} onClick={() => onSelectCard(card)}
            style={{
              padding: "6px 7px", marginBottom: 2, background: t.bgCard,
              borderRadius: 6, cursor: "pointer", border: `1px solid ${t.border}`,
              transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCardHover; (e.currentTarget as HTMLDivElement).style.borderColor = t.borderHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCard; (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
              <span style={{ color: t.text, fontWeight: 600, fontSize: 11 }}>{card.original}</span>
              <CefrBadge level={card.cefr} />
              {card.partOfSpeech && <span style={{ fontSize: 8, color: t.textGhost, fontStyle: "italic" }}>{card.partOfSpeech}</span>}
            </div>
            <div style={{ fontSize: 9, color: t.accentText, marginTop: 1 }}>{card.translation}</div>
            {card.tags.length > 0 && (
              <div style={{ display: "flex", gap: 2, marginTop: 2, flexWrap: "wrap" }}>
                {card.tags.slice(0, 3).map((tg) => <TagPill key={tg} tag={tg} small />)}
              </div>
            )}
          </div>
        ))}
        {cards.length === 0 && <div style={{ textAlign: "center", padding: 16, color: t.textGhost, fontSize: 10 }}>Empty</div>}
      </div>
    </Layer>
  );
}
