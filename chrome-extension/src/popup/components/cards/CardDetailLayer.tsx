import { useState } from "react";
import { theme as t } from "@/shared/theme";
import { useCards, useDecks } from "@/popup/stores/dataStore";
import { Layer } from "@/popup/components/Layer";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import { TagPill } from "@/popup/components/shared/TagPill";
import type { Card } from "@/shared/types";

interface Props { card: Card; onBack: () => void; }

export function CardDetailLayer({ card: initialCard, onBack }: Props) {
  const { cards, update, remove } = useCards();
  const { decks } = useDecks();
  const [tab, setTab] = useState<"info" | "notes" | "context">("info");
  const [editingOriginal, setEditingOriginal] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [newLinkTitle, setNewLinkTitle] = useState("");
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [newContext, setNewContext] = useState("");

  const card = cards.find((c) => c.id === initialCard.id) || initialCard;
  const isPending = !card.translation || card.translation === "translating...";

  const addTag = (tag: string) => {
    if (!tag || card.tags.includes(tag)) return;
    update(card.id, { tags: [...card.tags, tag] });
  };
  const removeTag = (tag: string) => update(card.id, { tags: card.tags.filter((x) => x !== tag) });

  const addLink = () => {
    if (!newLinkUrl.trim()) return;
    update(card.id, { links: [...card.links, { url: newLinkUrl.trim(), title: newLinkTitle.trim() || newLinkUrl.trim() }] });
    setNewLinkUrl(""); setNewLinkTitle(""); setShowLinkForm(false);
  };
  const removeLink = (i: number) => update(card.id, { links: card.links.filter((_, idx) => idx !== i) });

  const addContext = () => {
    if (!newContext.trim()) return;
    update(card.id, { contexts: [...card.contexts, { sentence: newContext.trim() }] });
    setNewContext("");
  };
  const removeContext = (i: number) => update(card.id, { contexts: card.contexts.filter((_, idx) => idx !== i) });

  const handleDelete = () => { if (confirm(`Delete "${card.original}"?`)) { remove(card.id); onBack(); } };

  const enrichIsSource = card.sourceLang === "en";

  return (
    <Layer depth={3} edgeLabel="Card" onBack={onBack}>
      <div style={{ padding: 10 }}>
        {/* Header card */}
        <div style={{ background: t.bgCard, borderRadius: 9, padding: 10, border: `1px solid ${t.border}`, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 2, flexWrap: "wrap" }}>
            {editingOriginal ? (
              <input autoFocus defaultValue={card.original}
                onBlur={(e) => { update(card.id, { original: e.target.value }); setEditingOriginal(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") { update(card.id, { original: (e.target as HTMLInputElement).value }); setEditingOriginal(false); } }}
                style={{ fontSize: 16, fontWeight: 700, color: t.text, background: t.bgLight, border: `1px solid ${t.borderHover}`, borderRadius: 4, padding: "2px 6px", outline: "none", fontFamily: t.fontFamily, flex: 1, width: "100%" }} />
            ) : (
              <span onClick={() => setEditingOriginal(true)}
                style={{ fontSize: 16, fontWeight: 700, color: t.text, cursor: "pointer", borderBottom: `1px dashed ${t.textGhost}` }}
                title="Click to edit">{card.original}</span>
            )}
            {enrichIsSource && card.cefr && <CefrBadge level={card.cefr} />}
            {enrichIsSource && card.partOfSpeech && <span style={{ fontSize: 9, color: t.textGhost, fontStyle: "italic" }}>{card.partOfSpeech}</span>}
          </div>
          {enrichIsSource && card.transcription && (
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>{card.transcription}</div>
          )}
          {editingTranslation ? (
            <input autoFocus defaultValue={card.translation}
              onBlur={(e) => { update(card.id, { translation: e.target.value }); setEditingTranslation(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { update(card.id, { translation: (e.target as HTMLInputElement).value }); setEditingTranslation(false); } }}
              style={{ fontSize: 13, color: t.accentText, background: t.bgLight, border: `1px solid ${t.borderHover}`, borderRadius: 4, padding: "2px 6px", outline: "none", fontFamily: t.fontFamily, width: "100%", marginBottom: 2 }} />
          ) : (
            <div onClick={() => setEditingTranslation(true)}
              style={{ fontSize: 13, color: isPending ? t.warn : t.accentText, cursor: "pointer", borderBottom: `1px dashed ${t.textGhost}`, display: "inline-block", fontStyle: isPending ? "italic" : "normal" }}
              title="Click to edit">{isPending ? "\u23f3 translating..." : card.translation}</div>
          )}
          {!enrichIsSource && card.transcription && (
            <div style={{ fontSize: 10, color: t.textDim, marginTop: 2 }}>
              {card.transcription}
              {card.cefr && <span style={{ marginLeft: 6 }}><CefrBadge level={card.cefr} /></span>}
              {card.partOfSpeech && <span style={{ marginLeft: 4, fontSize: 9, color: t.textGhost, fontStyle: "italic" }}>{card.partOfSpeech}</span>}
            </div>
          )}
          {card.definition && <div style={{ fontSize: 10, color: t.textMuted, fontStyle: "italic", marginTop: 3 }}>{card.definition}</div>}
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 2, marginBottom: 6 }}>
          {(["info", "notes", "context"] as const).map((tb) => (
            <button key={tb} onClick={() => setTab(tb)} style={{
              flex: 1, padding: "3px 0", fontSize: 9, fontWeight: tab === tb ? 600 : 400,
              color: tab === tb ? t.accent : t.textDim,
              background: tab === tb ? t.accentGlow : "transparent",
              border: "none", borderRadius: 4, cursor: "pointer", textTransform: "capitalize", fontFamily: t.fontFamily,
            }}>{tb}</button>
          ))}
        </div>

        {/* Info */}
        {tab === "info" && (<>
          <div style={{ background: t.bgCard, borderRadius: 7, padding: 7, border: `1px solid ${t.border}`, marginBottom: 4 }}>
            <div style={{ fontSize: 8, color: t.textDim, marginBottom: 3 }}>Tags</div>
            <div style={{ display: "flex", gap: 2, flexWrap: "wrap", marginBottom: 3 }}>
              {card.tags.map((tg) => <TagPill key={tg} tag={tg} onRemove={() => removeTag(tg)} />)}
            </div>
            <input placeholder="+ add tag..."
              onKeyDown={(e) => { if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) { addTag((e.target as HTMLInputElement).value.trim().toLowerCase()); (e.target as HTMLInputElement).value = ""; } }}
              style={{ width: "100%", background: "transparent", border: `1px dashed ${t.border}`, color: t.text, fontSize: 9, borderRadius: 3, padding: "2px 5px", outline: "none", fontFamily: t.fontFamily, boxSizing: "border-box" }} />
          </div>
          <div style={{ background: t.bgCard, borderRadius: 7, padding: 7, border: `1px solid ${t.border}`, marginBottom: 4 }}>
            <div style={{ fontSize: 8, color: t.textDim, marginBottom: 3 }}>SRS</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, marginBottom: 1 }}>
              <span style={{ color: t.textMuted }}>Reviews</span><span style={{ color: t.text }}>{card.srs.repetitions}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9 }}>
              <span style={{ color: t.textMuted }}>Next</span>
              <span style={{ color: t.warn }}>{card.srs.nextReviewAt ? new Date(card.srs.nextReviewAt).toLocaleDateString() : "Not scheduled"}</span>
            </div>
          </div>
          <div style={{ background: t.bgCard, borderRadius: 7, padding: 7, border: `1px solid ${t.border}`, marginBottom: 4 }}>
            <div style={{ fontSize: 8, color: t.textDim, marginBottom: 3 }}>Deck</div>
            <select value={card.deckId || ""} onChange={(e) => update(card.id, { deckId: e.target.value || null })}
              style={{ width: "100%", background: t.bgLight, color: t.text, border: `1px solid ${t.border}`, borderRadius: 4, padding: "3px 5px", fontSize: 9, outline: "none", fontFamily: t.fontFamily }}>
              <option value="">Inbox</option>
              {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <button onClick={handleDelete} style={{ width: "100%", padding: "6px 0", borderRadius: 5, fontSize: 9, background: t.dangerBg, border: "none", color: t.danger, cursor: "pointer", fontFamily: t.fontFamily }}>Delete card</button>
        </>)}

        {/* Notes */}
        {tab === "notes" && (<>
          <textarea defaultValue={card.notes} placeholder="Notes, rules, mnemonics..."
            onBlur={(e) => update(card.id, { notes: e.target.value })}
            style={{ width: "100%", minHeight: 80, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 7, padding: 7, color: t.text, fontSize: 10, fontFamily: t.fontFamily, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.6 }} />
          <div style={{ background: t.bgCard, borderRadius: 7, padding: 7, border: `1px solid ${t.border}`, marginTop: 4 }}>
            <div style={{ fontSize: 8, color: t.textDim, marginBottom: 3 }}>Links</div>
            {card.links.map((lk, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                <a href={lk.url} target="_blank" rel="noopener" style={{ fontSize: 9, color: t.accent, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{lk.title || lk.url}</a>
                <button onClick={() => removeLink(i)} style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 7 }}>{"\u2715"}</button>
              </div>
            ))}
            {showLinkForm ? (
              <div style={{ marginTop: 4 }}>
                <input placeholder="URL" value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)}
                  style={{ width: "100%", background: t.bgLight, border: `1px solid ${t.border}`, color: t.text, fontSize: 9, borderRadius: 3, padding: "3px 5px", outline: "none", fontFamily: t.fontFamily, boxSizing: "border-box", marginBottom: 3 }} />
                <input placeholder="Title (optional)" value={newLinkTitle} onChange={(e) => setNewLinkTitle(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addLink(); }}
                  style={{ width: "100%", background: t.bgLight, border: `1px solid ${t.border}`, color: t.text, fontSize: 9, borderRadius: 3, padding: "3px 5px", outline: "none", fontFamily: t.fontFamily, boxSizing: "border-box", marginBottom: 3 }} />
                <div style={{ display: "flex", gap: 3 }}>
                  <button onClick={() => setShowLinkForm(false)} style={{ flex: 1, fontSize: 8, padding: "3px", borderRadius: 3, background: "transparent", border: `1px solid ${t.border}`, color: t.textMuted, cursor: "pointer", fontFamily: t.fontFamily }}>Cancel</button>
                  <button onClick={addLink} style={{ flex: 1, fontSize: 8, padding: "3px", borderRadius: 3, background: t.accentGlow, border: `1px solid ${t.borderHover}`, color: t.accent, cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily }}>Add</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLinkForm(true)} style={{ fontSize: 8, color: t.accent, background: "transparent", border: `1px dashed ${t.borderHover}`, borderRadius: 3, padding: "2px 6px", cursor: "pointer", fontFamily: t.fontFamily, marginTop: 2 }}>+ Add link</button>
            )}
          </div>
        </>)}

        {/* Context */}
        {tab === "context" && (<>
          {card.contexts.map((ctx, i) => (
            <div key={i} style={{ background: t.bgCard, borderRadius: 7, padding: 7, border: `1px solid ${t.border}`, marginBottom: 2, display: "flex", alignItems: "flex-start", gap: 4 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: t.text, lineHeight: 1.5, borderLeft: `2px solid ${t.accent}`, paddingLeft: 7 }}>
                  "{ctx.sentence}"
                </div>
                {ctx.source && <div style={{ fontSize: 7, color: t.textGhost, marginTop: 2 }}>{ctx.source}</div>}
              </div>
              <button onClick={() => removeContext(i)} style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 7, flexShrink: 0, marginTop: 2 }}>{"\u2715"}</button>
            </div>
          ))}
          {card.contexts.length === 0 && (
            <div style={{ textAlign: "center", padding: 12, color: t.textGhost, fontSize: 9 }}>No contexts saved yet</div>
          )}
          {card.sourceUrl && (
            <div style={{ background: t.bgCard, borderRadius: 7, padding: 7, border: `1px solid ${t.border}`, marginTop: 4, marginBottom: 4 }}>
              <div style={{ fontSize: 7, color: t.textGhost }}>Source</div>
              <div style={{ fontSize: 9, color: t.accent }}>{card.sourceDomain || card.sourceUrl}</div>
            </div>
          )}
          <div style={{ marginTop: 4 }}>
            <textarea value={newContext} onChange={(e) => setNewContext(e.target.value)} placeholder="Type a sentence using this word..."
              style={{ width: "100%", minHeight: 50, background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 5, padding: 6, color: t.text, fontSize: 9, fontFamily: t.fontFamily, resize: "vertical", outline: "none", boxSizing: "border-box", lineHeight: 1.5 }} />
            <button onClick={addContext} disabled={!newContext.trim()} style={{
              width: "100%", marginTop: 3, padding: "5px 0", fontSize: 8, fontWeight: 600,
              color: newContext.trim() ? t.accent : t.textDim,
              background: newContext.trim() ? t.accentGlow : "transparent",
              border: `1px dashed ${newContext.trim() ? t.borderHover : t.border}`,
              borderRadius: 5, cursor: newContext.trim() ? "pointer" : "default", fontFamily: t.fontFamily,
            }}>+ Add context sentence</button>
          </div>
        </>)}
      </div>
    </Layer>
  );
}
