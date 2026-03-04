import { useState, useCallback } from "react";
import { theme as t } from "@/shared/theme";
import { computeNextReview, previewIntervals } from "@/shared/srs";
import { useCards } from "@/popup/stores/dataStore";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import type { Card } from "@/shared/types";
import type { SrsRating } from "@/shared/srs";

interface Props {
  cards: Card[];
  onFinish: () => void;
}

const RATINGS: { rating: SrsRating; label: string; color: string; bg: string }[] = [
  { rating: 0, label: "Again", color: "#ef4444", bg: "rgba(239,68,68,0.12)" },
  { rating: 1, label: "Hard",  color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { rating: 2, label: "Good",  color: "#22c55e", bg: "rgba(34,197,94,0.12)" },
  { rating: 3, label: "Easy",  color: "#38a3ed", bg: "rgba(56,163,237,0.12)" },
];
const KEYS = ["again", "hard", "good", "easy"] as const;

export function ReviewSession({ cards: initialCards, onFinish }: Props) {
  const { update } = useCards();
  const [queue] = useState<Card[]>(() => [...initialCards]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  const card = queue[index];
  const total = queue.length;
  const done = index >= total;
  const previews = card ? previewIntervals(card.srs) : [];

  const handleRate = useCallback((rating: SrsRating) => {
    if (!card) return;
    const newSrs = computeNextReview(card.srs, rating);
    update(card.id, { srs: newSrs });
    const key = KEYS[rating];
    setStats((s) => ({ ...s, [key]: s[key] + 1 }));
    setFlipped(false);
    setIndex((i) => i + 1);
  }, [card, update]);

  if (done) {
    return (
      <div style={{ padding: 16, textAlign: "center", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", gap: 12 }}>
        <div style={{ fontSize: 28, marginBottom: 4 }}>{"\u2705"}</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: t.text }}>Session complete</div>
        <div style={{ fontSize: 11, color: t.textDim }}>{total} cards reviewed</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8 }}>
          {RATINGS.map((r) => (
            <div key={r.rating} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: r.color }}>{stats[KEYS[r.rating]]}</div>
              <div style={{ fontSize: 8, color: t.textGhost }}>{r.label}</div>
            </div>
          ))}
        </div>
        <button onClick={onFinish} style={{
          marginTop: 16, padding: "10px 30px", borderRadius: 8,
          background: t.gradient, border: "none", color: "#fff",
          fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: t.fontFamily,
        }}>Done</button>
      </div>
    );
  }

  const enrichIsSource = card.sourceLang === "en";

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <div style={{ flex: 1, height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
          <div style={{ width: `${((index) / total) * 100}%`, height: "100%", background: t.gradient, transition: "width 0.3s" }} />
        </div>
        <span style={{ fontSize: 9, color: t.textGhost, flexShrink: 0 }}>{index + 1}/{total}</span>
        <button onClick={onFinish} style={{ fontSize: 8, background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontFamily: t.fontFamily }}>End</button>
      </div>

      <div onClick={() => !flipped && setFlipped(true)} style={{
        flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
        background: t.bgCard, borderRadius: 12, border: `1px solid ${t.border}`,
        padding: 20, cursor: flipped ? "default" : "pointer",
        transition: "all 0.2s", textAlign: "center",
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: t.text, marginBottom: 4 }}>{card.original}</div>
        {enrichIsSource && card.cefr && <CefrBadge level={card.cefr} />}
        {enrichIsSource && card.transcription && (
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>{card.transcription}</div>
        )}
        {card.partOfSpeech && (
          <div style={{ fontSize: 9, color: t.textGhost, fontStyle: "italic", marginTop: 2 }}>{card.partOfSpeech}</div>
        )}

        {flipped ? (
          <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${t.border}`, width: "100%" }}>
            <div style={{ fontSize: 18, color: t.accentText, fontWeight: 600 }}>{card.translation}</div>
            {!enrichIsSource && card.transcription && (
              <div style={{ fontSize: 10, color: t.textDim, marginTop: 3 }}>{card.transcription}</div>
            )}
            {card.definition && (
              <div style={{ fontSize: 10, color: t.textMuted, fontStyle: "italic", marginTop: 6, lineHeight: 1.5 }}>{card.definition}</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 10, color: t.textGhost, marginTop: 16 }}>Tap to reveal</div>
        )}
      </div>

      {flipped && (
        <div style={{ display: "flex", gap: 3, marginTop: 8 }}>
          {RATINGS.map((r) => {
            const preview = previews.find((p) => p.rating === r.rating);
            return (
              <button key={r.rating} onClick={() => handleRate(r.rating)} style={{
                flex: 1, padding: "8px 0", borderRadius: 7,
                background: r.bg, border: `1px solid ${r.color}30`,
                cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                fontFamily: t.fontFamily,
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: r.color }}>{r.label}</span>
                <span style={{ fontSize: 7, color: t.textGhost }}>{preview?.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
