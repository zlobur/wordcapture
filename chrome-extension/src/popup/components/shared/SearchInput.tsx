import { useState, useEffect, useRef } from "react";
import { theme as t } from "@/shared/theme";
import type { Card } from "@/shared/types";

function matchCard(card: Card, q: string): boolean {
  return (
    card.original.toLowerCase().includes(q) ||
    card.translation.toLowerCase().includes(q) ||
    (card.definition || "").toLowerCase().includes(q) ||
    card.notes.toLowerCase().includes(q) ||
    card.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function useCardSearch(cards: Card[]) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query.toLowerCase().trim()), 200);
    return () => clearTimeout(timerRef.current);
  }, [query]);

  const filtered = debouncedQuery ? cards.filter((c) => matchCard(c, debouncedQuery)) : cards;

  return { query, setQuery, filtered, matchCount: debouncedQuery ? filtered.length : null };
}

interface Props {
  query: string;
  onChange: (q: string) => void;
  matchCount: number | null;
  placeholder?: string;
}

export function SearchInput({ query, onChange, matchCount, placeholder }: Props) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "0 8px 6px" }}>
      <div style={{
        flex: 1, display: "flex", alignItems: "center",
        background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 8px",
      }}>
        <span style={{ fontSize: 11, color: t.textGhost, marginRight: 4 }}>&#x1F50D;</span>
        <input
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || "Search cards..."}
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: t.text, fontSize: 11, fontFamily: t.fontFamily, padding: 0,
          }}
        />
        {query && (
          <button onClick={() => onChange("")} style={{
            background: "none", border: "none", color: t.textGhost, cursor: "pointer",
            fontSize: 12, padding: "0 2px", lineHeight: 1,
          }}>{"\u00D7"}</button>
        )}
      </div>
      {matchCount !== null && (
        <span style={{ fontSize: 9, color: t.textDim, whiteSpace: "nowrap" }}>{matchCount} found</span>
      )}
    </div>
  );
}
