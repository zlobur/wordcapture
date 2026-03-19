import { theme as t } from "@/shared/theme";
import { useCategories, useDecks, useCards } from "@/popup/stores/dataStore";
import { DueBadge } from "@/popup/components/shared/DueBadge";
import { LangPairBadge } from "@/popup/components/shared/LangPairBadge";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import { SearchInput, useCardSearch } from "@/popup/components/shared/SearchInput";
import type { Category, Card } from "@/shared/types";

interface Props {
  onSelectCategory: (cat: Category) => void;
  onEditCategories: () => void;
  onSelectCard: (card: Card) => void;
}

export function CategoriesPanel({ onSelectCategory, onEditCategories, onSelectCard }: Props) {
  const { categories } = useCategories();
  const { decks } = useDecks();
  const { cards, getDueCount } = useCards();
  const { query, setQuery, filtered, matchCount } = useCardSearch(cards);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 16 }}>📂</span>
        <span style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>Categories</span>
        <button onClick={onEditCategories} style={{
          marginLeft: "auto", fontSize: 9, color: t.textGhost,
          background: "none", border: "none", cursor: "pointer", fontFamily: t.fontFamily,
        }}>⚙ Edit</button>
      </div>
      <SearchInput query={query} onChange={setQuery} matchCount={matchCount} placeholder="Search all cards..." />
      {query ? (
        <>
          {filtered.map((card) => {
            const deck = decks.find((d) => d.id === card.deckId);
            return (
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
                  {deck && <span style={{ fontSize: 8, color: t.textGhost, marginLeft: "auto" }}>{deck.name}</span>}
                </div>
                <div style={{ fontSize: 9, color: t.accentText, marginTop: 1 }}>{card.translation}</div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: 16, color: t.textGhost, fontSize: 10 }}>No cards found</div>}
        </>
      ) : (
        <>
          {categories.map((cat) => {
            const catDecks = decks.filter((d) => d.categoryId === cat.id);
            const catDeckIds = new Set(catDecks.map((d) => d.id));
            const catCards = cards.filter((c) => c.deckId && catDeckIds.has(c.deckId)).length;
            const catDue = catDecks.reduce((sum, d) => sum + getDueCount(d.id), 0);
            return (
              <div key={cat.id} onClick={() => onSelectCategory(cat)}
                style={{
                  padding: "11px 12px", marginBottom: 4, borderRadius: 9, cursor: "pointer",
                  background: t.bgCard, border: `1px solid ${t.border}`,
                  borderLeft: `3px solid ${cat.color}`, transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCardHover; (e.currentTarget as HTMLDivElement).style.borderColor = t.borderHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCard; (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 14, height: 14, borderRadius: 3, background: cat.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ color: t.text, fontWeight: 700, fontSize: 13 }}>{cat.name}</span>
                      {cat.type === "language" && <LangPairBadge from={cat.sourceLang} to={cat.targetLang} small />}
                      {cat.type === "concept" && (
                        <span style={{ fontSize: 7, color: t.textGhost, background: "rgba(255,255,255,0.04)", padding: "0 4px", borderRadius: 3 }}>concepts</span>
                      )}
                    </div>
                    <div style={{ fontSize: 9, color: t.textDim, marginTop: 1 }}>
                      {catDecks.length} deck{catDecks.length !== 1 ? "s" : ""} · {catCards} card{catCards !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <DueBadge count={catDue} />
                  <span style={{ color: t.textGhost, fontSize: 13 }}>›</span>
                </div>
              </div>
            );
          })}
          <button onClick={onEditCategories} style={{
            width: "100%", marginTop: 6, padding: "8px 0", fontSize: 10, color: t.accent,
            background: "transparent", border: `1px dashed ${t.borderHover}`,
            borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily,
          }}>+ New Category</button>
        </>
      )}
    </div>
  );
}
