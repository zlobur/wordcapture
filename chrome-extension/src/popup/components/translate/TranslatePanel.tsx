import { useState, useEffect, useRef } from "react";
import { theme as t } from "@/shared/theme";
import { api } from "@/shared/api";
import { LANGUAGES, LANG_FEATURES } from "@/shared/constants";
import { useCards } from "@/popup/stores/dataStore";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import { LangDropdown } from "./LangDropdown";
import { resolvePopupDirection } from "@/shared/langResolve";
import type { LangCode } from "@/shared/types";

interface Props {
  langFrom: LangCode;
  langTo: LangCode;
  onChangeLangFrom: (l: LangCode) => void;
  onChangeLangTo: (l: LangCode) => void;
}

interface TransResult {
  original: string;
  translation: string;
  definition?: string;
  transcription?: string;
  cefr?: string;
  pos?: string;
  enriching?: boolean; // true while enrich is loading
}

export function TranslatePanel({ langFrom, langTo, onChangeLangFrom, onChangeLangTo }: Props) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState<TransResult | null>(null);
  const [translating, setTranslating] = useState(false);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const enrichAbort = useRef(0); // generation counter to cancel stale enrich
  const { add: addCard } = useCards();
  const fromLang = LANGUAGES.find((l) => l.code === langFrom);
  const toLang = LANGUAGES.find((l) => l.code === langTo);

  const swap = () => {
    const newFrom = langTo === "auto" as string ? langFrom : langTo;
    const newTo = langFrom === "auto" as string ? langTo : langFrom;
    onChangeLangFrom(newFrom);
    onChangeLangTo(newTo);
    if (input.trim()) {
      setTimeout(() => doTranslate(input), 0);
    }
  };

  const doTranslate = async (text: string) => {
    if (!text.trim()) return;
    const generation = ++enrichAbort.current;
    setTranslating(true);
    setSaved(false);
    setResult(null);

    const resolved = resolvePopupDirection(text, langFrom, langTo);
    const effectiveFrom = resolved.from as LangCode;
    const effectiveTo = resolved.to as LangCode;
    if (resolved.changed) {
      onChangeLangFrom(effectiveFrom);
      onChangeLangTo(effectiveTo);
    }

    try {
      const tr = await api.translate(text.trim(), effectiveFrom, effectiveTo);
      if (generation !== enrichAbort.current) return; // stale

      const res: TransResult = {
        original: text.trim(),
        translation: tr.translation,
        enriching: true, // enrich loading indicator
      };
      setResult(res);
      setTranslating(false); // <-- UI shows translation NOW

      // Step 2: Enrich — slow, non-blocking, updates result when ready
      const enrichWord = LANG_FEATURES[effectiveFrom]?.enrich ? text.trim()
        : LANG_FEATURES[effectiveTo]?.enrich ? tr.translation
        : null;

      if (enrichWord) {
        try {
          const enrich = await api.enrich(enrichWord);
          if (generation !== enrichAbort.current) return; // stale
          setResult((prev) => prev ? {
            ...prev,
            definition: enrich.context || undefined,
            transcription: enrich.transcription || undefined,
            cefr: enrich.cefr || undefined,
            pos: enrich.partOfSpeech || enrich.tag || undefined,
            enriching: false,
          } : prev);
        } catch {
          if (generation === enrichAbort.current) {
            setResult((prev) => prev ? { ...prev, enriching: false } : prev);
          }
        }
      } else {
        setResult((prev) => prev ? { ...prev, enriching: false } : prev);
      }
    } catch {
      if (generation === enrichAbort.current) {
        setResult({ original: text.trim(), translation: "Translation error" });
        setTranslating(false);
      }
    }
  };

  // Auto-translate on debounce
  useEffect(() => {
    if (!input.trim()) { setResult(null); return; }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => doTranslate(input), 800);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [input, langFrom, langTo]);

  const handleSave = () => {
    if (!result) return;
    addCard({
      original: result.original,
      translation: result.translation,
      definition: result.definition,
      transcription: result.transcription,
      cefr: result.cefr as any,
      partOfSpeech: result.pos,
      deckId: null,
      sourceLang: langFrom,
      targetLang: langTo,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const enrichIsSource = !!LANG_FEATURES[langFrom]?.enrich;

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Language dropdowns */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <LangDropdown value={langFrom} onChange={onChangeLangFrom} showAuto />
        <button onClick={swap} style={{
          background: "none", border: "none", color: t.accent,
          cursor: "pointer", fontSize: 16, padding: "4px",
          borderRadius: 6, flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.15s", fontFamily: t.fontFamily,
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = t.accentGlow; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
        >{"\u21c4"}</button>
        <LangDropdown value={langTo} onChange={onChangeLangTo} />
      </div>

      {/* Input */}
      <div style={{
        display: "flex", gap: 4, marginBottom: 10,
        background: t.bgCard, borderRadius: 8, padding: 3,
        border: `2px solid ${t.borderHover}`,
      }}>
        <input value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={`Type in ${fromLang?.name || "source"}...`}
          onKeyDown={(e) => { if (e.key === "Enter") { if (timerRef.current) clearTimeout(timerRef.current); doTranslate(input); } }}
          style={{
            flex: 1, background: "transparent", border: "none",
            color: t.text, fontSize: 13, padding: "8px 8px",
            outline: "none", fontFamily: t.fontFamily,
          }} />
        <button onClick={() => { if (timerRef.current) clearTimeout(timerRef.current); doTranslate(input); }} style={{
          background: t.gradient, border: "none", color: "#fff",
          borderRadius: 6, padding: "8px 14px", fontSize: 12, fontWeight: 700,
          cursor: "pointer", flexShrink: 0,
        }}>{"\u2192"}</button>
      </div>

      {/* Translating spinner (only for DeepL phase) */}
      {translating && (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: t.textGhost, fontSize: 12 }}>
          Translating...
        </div>
      )}

      {/* Result card — shown as soon as DeepL returns */}
      {result && !translating && (
        <div style={{
          background: t.bgCard, borderRadius: 10, padding: 14,
          border: `1px solid ${t.border}`, flex: 1,
        }}>
          {/* Source word + enrich data (if source=EN) */}
          <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 3, flexWrap: "wrap" }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: t.text }}>{result.original}</span>
            {enrichIsSource && result.cefr && <CefrBadge level={result.cefr as any} />}
            {enrichIsSource && result.pos && <span style={{ fontSize: 10, color: t.textGhost, fontStyle: "italic" }}>{result.pos}</span>}
            {enrichIsSource && result.enriching && <span style={{ fontSize: 8, color: t.textGhost, fontStyle: "italic" }}>loading...</span>}
          </div>
          {enrichIsSource && result.transcription && (
            <div style={{ fontSize: 11, color: t.textDim, marginBottom: 6 }}>{result.transcription}</div>
          )}

          {/* Translation */}
          <div style={{ fontSize: 15, color: t.accentText, marginBottom: 2 }}>
            {toLang?.flag} {result.translation}
          </div>
          {/* Enrich on translation side (when target=EN) */}
          {!enrichIsSource && result.transcription && (
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 2 }}>
              {result.transcription}
              {result.cefr && <span style={{ marginLeft: 6 }}><CefrBadge level={result.cefr as any} /></span>}
              {result.pos && <span style={{ marginLeft: 4, fontSize: 9, color: t.textGhost, fontStyle: "italic" }}>{result.pos}</span>}
            </div>
          )}
          {!enrichIsSource && result.enriching && (
            <div style={{ fontSize: 8, color: t.textGhost, fontStyle: "italic", marginBottom: 2 }}>enriching...</div>
          )}

          {/* Definition */}
          {result.definition && (
            <div style={{ fontSize: 11, color: t.textMuted, fontStyle: "italic", marginTop: 4, marginBottom: 14 }}>
              {result.definition}
            </div>
          )}

          {/* Save buttons */}
          <div style={{ display: "flex", gap: 4, marginTop: result.definition ? 0 : 10 }}>
            <button onClick={handleSave} style={{
              flex: 1, padding: "9px 0", borderRadius: 8,
              background: saved ? t.successBg : t.gradient,
              border: "none", color: saved ? t.success : "#fff",
              fontSize: 11, fontWeight: 700, cursor: "pointer",
              fontFamily: t.fontFamily,
            }}>{saved ? "\u2713 Saved" : "Save to Inbox"}</button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !translating && (
        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          color: t.textGhost, fontSize: 11, gap: 8, textAlign: "center", padding: 20,
        }}>
          <div style={{ fontSize: 30, opacity: 0.4 }}>{"\u21c4"}</div>
          <div>Type a word or select text on any page</div>
          <div style={{ fontSize: 9 }}>Translation via DeepL</div>
        </div>
      )}
    </div>
  );
}
