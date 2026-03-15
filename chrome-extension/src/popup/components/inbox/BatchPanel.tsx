import { useState, useRef, useEffect } from "react";
import { theme as t } from "@/shared/theme";
import { LANGUAGES } from "@/shared/constants";
import { useCards, useDecks } from "@/popup/stores/dataStore";
import { LangDropdown } from "@/popup/components/translate/LangDropdown";
import { TagPill } from "@/popup/components/shared/TagPill";
import type { LangCode } from "@/shared/types";

interface Props {
  onBack: () => void;
  langFrom: LangCode;
  langTo: LangCode;
}

export function BatchPanel({ onBack, langFrom: initFrom, langTo: initTo }: Props) {
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [target, setTarget] = useState("inbox");
  const [deckName, setDeckName] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tagCommitted, setTagCommitted] = useState("");
  const [from, setFrom] = useState<LangCode>(initFrom);
  const [to, setTo] = useState<LangCode>(initTo);
  const inputRef = useRef<HTMLInputElement>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const { add: addCard } = useCards();
  const { decks, add: addDeck } = useDecks();
  const fromLang = LANGUAGES.find((l) => l.code === from);
  const toLang = LANGUAGES.find((l) => l.code === to);

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { listEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [words]);

  const addWord = () => {
    const w = input.trim();
    if (w && !words.includes(w)) {
      setWords((p) => [...p, w]);
      setInput("");
    }
  };

  const commitTag = () => {
    const val = tagInput.trim().replace(/^#/, "");
    if (val) setTagCommitted(val);
    setTagInput("");
  };

  const handleSave = async () => {
    if (words.length === 0) return;
    let targetDeckId: string | null = null;
    if (target === "new") {
      if (!deckName.trim()) return;
      const newDeck = addDeck({ name: deckName.trim(), categoryId: "" });
      targetDeckId = newDeck.id;
    } else if (target !== "inbox") {
      targetDeckId = target;
    }
    const tags = tagCommitted ? [tagCommitted] : [];
    for (const w of words) {
      addCard({
        original: w, translation: "",
        sourceLang: from, targetLang: to,
        deckId: targetDeckId, tags,
        definition: undefined, transcription: undefined,
        cefr: undefined, partOfSpeech: undefined,
      });
    }
    setWords([]);
    setInput("");
    onBack();
  };

  const targetLabel = target === "inbox" ? "Inbox" : target === "new" ? (deckName || "New Deck") : decks.find((d) => d.id === target)?.name || target;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: t.accent, cursor: "pointer", fontSize: 14, padding: 0, fontFamily: t.fontFamily }}>{"\u2190"}</button>
        <span style={{ color: t.text, fontWeight: 700, fontSize: 13 }}>Batch Add</span>
        <span style={{ fontSize: 9, color: t.textGhost, marginLeft: "auto" }}>{words.length}</span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6 }}>
        <LangDropdown value={from} onChange={setFrom} />
        <span style={{ color: t.accent, fontWeight: 700, fontSize: 10, flexShrink: 0 }}>{"\u2192"}</span>
        <LangDropdown value={to} onChange={setTo} />
      </div>

      <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
        <select value={target} onChange={(e) => setTarget(e.target.value)}
          style={{ flex: 1, background: t.bgCard, color: t.text, border: `1px solid ${t.border}`, borderRadius: 5, padding: "4px 6px", fontSize: 10, outline: "none", fontFamily: t.fontFamily }}>
          <option value="inbox">Inbox</option>
          {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          <option value="new">New deck...</option>
        </select>
        {tagCommitted ? (
          <TagPill tag={tagCommitted} onRemove={() => setTagCommitted("")} />
        ) : (
          <input placeholder="#tag" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onBlur={commitTag}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commitTag(); } }}
            style={{
              width: 60, background: t.bgCard, border: `1px solid ${t.border}`,
              color: t.teal, fontSize: 9, borderRadius: 4, padding: "2px 5px",
              outline: "none", fontFamily: t.fontFamily,
            }} />
        )}
      </div>

      {target === "new" && (
        <input placeholder="Deck name..." value={deckName} onChange={(e) => setDeckName(e.target.value)}
          style={{ width: "100%", background: t.bgCard, border: `1px solid ${t.borderHover}`, color: t.text, fontSize: 10, borderRadius: 5, padding: "4px 7px", marginBottom: 5, outline: "none", fontFamily: t.fontFamily, boxSizing: "border-box" }} />
      )}

      <div style={{ display: "flex", gap: 3, marginBottom: 5, background: t.bgCard, borderRadius: 7, padding: 3, border: `2px solid ${t.borderHover}` }}>
        <input ref={inputRef}
          placeholder={`${fromLang?.flag || ""} word \u2192 Enter \u21b5`}
          value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addWord(); } }}
          style={{ flex: 1, background: "transparent", border: "none", color: t.text, fontSize: 12, padding: "6px 7px", outline: "none", fontFamily: t.fontFamily }} />
        <button onClick={addWord} style={{ background: t.gradient, border: "none", color: "#fff", borderRadius: 5, padding: "6px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer" }}>{"\u21b5"}</button>
      </div>

      <div style={{ flex: 1, overflow: "auto", marginBottom: 5 }}>
        {words.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20, color: t.textGhost, fontSize: 10, lineHeight: 2 }}>
            Type words, press Enter {"\u21b5"}<br />Auto-translate {fromLang?.flag}{"\u2192"}{toLang?.flag}<br />+ AI enrichment after save
          </div>
        ) : words.map((w, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "3px 5px", marginBottom: 1, background: t.bgCard, borderRadius: 4, border: `1px solid ${t.border}` }}>
            <span style={{ fontSize: 8, color: t.textGhost, marginRight: 5, fontFamily: "monospace", width: 14, textAlign: "right" }}>{i + 1}</span>
            <span style={{ fontSize: 11, color: t.text, flex: 1 }}>{w}</span>
            <button onClick={() => setWords(words.filter((_, idx) => idx !== i))}
              style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 8, padding: "1px" }}>{"\u2715"}</button>
          </div>
        ))}
        <div ref={listEndRef} />
      </div>

      <button disabled={words.length === 0} onClick={handleSave} style={{
        width: "100%", padding: "8px 0", borderRadius: 7,
        background: words.length > 0 ? t.gradient : t.bgCard,
        border: "none", color: words.length > 0 ? "#fff" : t.textDim,
        fontSize: 11, fontWeight: 700, cursor: words.length > 0 ? "pointer" : "default", fontFamily: t.fontFamily,
      }}>Save {words.length} words {"\u2192"} {targetLabel}</button>
    </div>
  );
}
