import { useState } from "react";
import { theme as t } from "@/shared/theme";
import { useCards, useDecks, useCategories } from "@/popup/stores/dataStore";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import { CategoryDot } from "@/popup/components/shared/CategoryDot";
import { SearchInput, useCardSearch } from "@/popup/components/shared/SearchInput";
import type { Card } from "@/shared/types";

interface Props {
  onOpenBatch: () => void;
  onOpenCard?: (card: Card) => void;
}

export function InboxPanel({ onOpenBatch, onOpenCard }: Props) {
  const { inbox, moveToDecks } = useCards();
  const { decks, add: addDeck } = useDecks();
  const { categories } = useCategories();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const { query, setQuery, filtered, matchCount } = useCardSearch(inbox);

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const selectAll = () => {
    selected.size === inbox.length ? setSelected(new Set()) : setSelected(new Set(inbox.map((c) => c.id)));
  };

  const handleMove = (deckId: string) => {
    moveToDecks(Array.from(selected), deckId);
    setSelected(new Set());
  };

  const handleNewDeck = () => {
    const name = prompt("Deck name:");
    if (!name?.trim()) return;
    const catId = categories[0]?.id;
    if (!catId) return;
    const newDeck = addDeck({ name: name.trim(), categoryId: catId });
    if (newDeck) handleMove(newDeck.id);
  };

  const getCatColor = (card: { sourceLang: string }) => {
    const cat = categories.find((c) => c.type === "language" && c.sourceLang === card.sourceLang);
    return cat?.color;
  };

  const handleCardClick = (card: Card, e: React.MouseEvent) => {
    // If clicking the checkbox area, toggle selection
    const target = e.target as HTMLElement;
    if (target.closest("[data-checkbox]")) {
      toggle(card.id);
      return;
    }
    // If we have selections, toggle
    if (selected.size > 0) {
      toggle(card.id);
      return;
    }
    // Otherwise open card detail
    onOpenCard?.(card);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 12px 6px", borderBottom: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <span style={{ fontSize: 16 }}>📥</span>
          <span style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>Inbox</span>
          <span style={{ fontSize: 10, color: t.textDim }}>{inbox.length}</span>
          <button onClick={onOpenBatch} style={{
            marginLeft: "auto", fontSize: 10, background: t.gradient, color: "#fff",
            border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer",
            fontWeight: 700, fontFamily: t.fontFamily,
          }}>+ Batch</button>
        </div>
        {inbox.length > 0 && (
          <button onClick={selectAll} style={{
            fontSize: 9, color: t.accent, background: "none", border: "none",
            cursor: "pointer", padding: 0, fontFamily: t.fontFamily,
          }}>
            {selected.size === inbox.length ? "Deselect all" : "Select all"}
          </button>
        )}
      </div>

      {inbox.length > 0 && (
        <SearchInput query={query} onChange={setQuery} matchCount={matchCount} placeholder="Search inbox..." />
      )}
      <div style={{ flex: 1, overflow: "auto", padding: "4px 8px" }}>
        {inbox.length === 0 && (
          <div style={{ textAlign: "center", padding: 30, color: t.textGhost, fontSize: 11 }}>
            Inbox is empty. Translate a word and save it here.
          </div>
        )}
        {filtered.map((card) => {
          const isPending = !card.translation || card.translation === "translating...";
          return (
            <div key={card.id} onClick={(e) => handleCardClick(card, e)} style={{
              display: "flex", alignItems: "center", padding: "6px 7px", marginBottom: 2,
              background: selected.has(card.id) ? t.accentGlow : t.bgCard,
              borderRadius: 6, cursor: "pointer",
              border: `1px solid ${selected.has(card.id) ? t.borderHover : t.border}`,
              transition: "all 0.12s",
            }}>
              <div data-checkbox="true" style={{
                width: 15, height: 15, borderRadius: 3, marginRight: 7, flexShrink: 0,
                border: `2px solid ${selected.has(card.id) ? t.accent : "rgba(255,255,255,0.12)"}`,
                background: selected.has(card.id) ? t.accent : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {selected.has(card.id) && <span style={{ color: "#fff", fontSize: 8, fontWeight: 700 }}>✓</span>}
              </div>
              <CategoryDot color={getCatColor(card)} size={6} />
              <div style={{ flex: 1, marginLeft: 6, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ color: t.text, fontWeight: 600, fontSize: 11 }}>{card.original}</span>
                  <CefrBadge level={card.cefr} />
                </div>
                <div style={{
                  fontSize: 9,
                  color: isPending ? t.warn : t.accentText,
                  overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  fontStyle: isPending ? "italic" : "normal",
                }}>
                  {isPending ? "⏳ translating..." : card.translation}
                </div>
              </div>
              {!selected.size && (
                <span style={{ color: t.textGhost, fontSize: 10, marginLeft: 4 }}>›</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Triage bar */}
      {selected.size > 0 && (
        <div style={{
          padding: "7px 8px", background: t.bgLight,
          borderTop: `2px solid ${t.accent}40`,
        }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5, marginBottom: 5,
            fontSize: 11, color: t.text, fontWeight: 600,
          }}>
            <span>Move {selected.size}</span>
            <span style={{ color: t.accent, fontSize: 10 }}>→</span>
            <span style={{ color: t.textDim, fontWeight: 400, fontSize: 10 }}>pick deck</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {decks.map((deck) => {
              const cat = categories.find((c) => c.id === deck.categoryId);
              return (
                <button key={deck.id} onClick={() => handleMove(deck.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: 3,
                    padding: "3px 7px", borderRadius: 5, cursor: "pointer",
                    background: t.bgCard, border: `1px solid ${t.border}`,
                    color: t.text, fontSize: 9, fontWeight: 500,
                    transition: "all 0.12s", fontFamily: t.fontFamily,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.accentGlow; (e.currentTarget as HTMLButtonElement).style.borderColor = t.borderHover; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.bgCard; (e.currentTarget as HTMLButtonElement).style.borderColor = t.border; }}
                >
                  <CategoryDot color={cat?.color} size={5} />
                  <span>{deck.name}</span>
                  <span style={{ color: t.accent, fontWeight: 700, fontSize: 9 }}>▶</span>
                </button>
              );
            })}
            <button onClick={handleNewDeck} style={{
              padding: "3px 7px", borderRadius: 5, cursor: "pointer",
              background: "transparent", border: `1px dashed ${t.borderHover}`,
              color: t.accent, fontSize: 9, fontWeight: 600, fontFamily: t.fontFamily,
            }}>+ New</button>
          </div>
        </div>
      )}
    </div>
  );
}
