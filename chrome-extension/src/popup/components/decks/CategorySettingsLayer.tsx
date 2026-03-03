import { useState } from "react";
import { theme as t } from "@/shared/theme";
import { LANGUAGES } from "@/shared/constants";
import { useCategories } from "@/popup/stores/dataStore";
import { Layer } from "@/popup/components/Layer";
import type { LangCode } from "@/shared/types";

const PALETTE = ["#38a3ed", "#ffcc00", "#a78bfa", "#fb923c", "#2dd4bf", "#22c55e", "#ef4444", "#f59e0b"];

interface Props {
  onBack: () => void;
}

export function CategorySettingsLayer({ onBack }: Props) {
  const { categories, add, update, remove } = useCategories();
  const [showNew, setShowNew] = useState(false);
  const [newIsLang, setNewIsLang] = useState(true);
  const [newFrom, setNewFrom] = useState<LangCode>("de");
  const [newTo, setNewTo] = useState<LangCode>("ru");
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PALETTE[0]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    add({
      name: newName.trim(),
      color: newColor,
      type: newIsLang ? "language" : "concept",
      sourceLang: newIsLang ? newFrom : undefined,
      targetLang: newIsLang ? newTo : undefined,
    });
    setNewName("");
    setShowNew(false);
  };

  return (
    <Layer depth={1} edgeLabel="Decks" onBack={onBack}>
      <div style={{ padding: 10 }}>
        <div style={{ color: t.text, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>Edit Categories</div>
        <div style={{ fontSize: 9, color: t.textGhost, marginBottom: 8, lineHeight: 1.5 }}>
          Language categories auto-set translation direction.
        </div>
        {categories.map((cat) => (
          <div key={cat.id} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "7px 7px", marginBottom: 2,
            background: t.bgCard, borderRadius: 6, border: `1px solid ${t.border}`,
          }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <input defaultValue={cat.name}
                onBlur={(e) => update(cat.id, { name: e.target.value })}
                style={{
                  width: "100%", background: "transparent", border: "none",
                  color: t.text, fontSize: 11, fontWeight: 600, outline: "none", fontFamily: t.fontFamily,
                }} />
              <div style={{ fontSize: 8, color: t.textGhost, marginTop: 1 }}>
                {cat.type === "language"
                  ? `${LANGUAGES.find((l) => l.code === cat.sourceLang)?.flag} ${LANGUAGES.find((l) => l.code === cat.sourceLang)?.name} → ${LANGUAGES.find((l) => l.code === cat.targetLang)?.flag} ${LANGUAGES.find((l) => l.code === cat.targetLang)?.name}`
                  : "Concepts"
                }
              </div>
            </div>
            <button onClick={() => { if (confirm(`Delete "${cat.name}"?`)) remove(cat.id); }}
              style={{ background: "none", border: "none", color: t.textGhost, cursor: "pointer", fontSize: 9, fontFamily: t.fontFamily }}>✕</button>
          </div>
        ))}

        {!showNew ? (
          <button onClick={() => setShowNew(true)} style={{
            width: "100%", marginTop: 4, padding: "7px 0", fontSize: 9, color: t.accent,
            background: "transparent", border: `1px dashed ${t.borderHover}`,
            borderRadius: 6, cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily,
          }}>+ Add Category</button>
        ) : (
          <div style={{ marginTop: 6, padding: 8, background: t.bgCard, borderRadius: 8, border: `1px solid ${t.borderHover}` }}>
            <div style={{ fontSize: 9, color: t.text, fontWeight: 600, marginBottom: 6 }}>New Category</div>
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
              <button onClick={() => setNewIsLang(true)} style={{
                flex: 1, padding: "4px 0", fontSize: 9, borderRadius: 5,
                background: newIsLang ? t.accentGlow : "transparent",
                color: newIsLang ? t.accent : t.textDim,
                border: `1px solid ${newIsLang ? t.borderHover : "transparent"}`, cursor: "pointer", fontFamily: t.fontFamily,
              }}>Language</button>
              <button onClick={() => setNewIsLang(false)} style={{
                flex: 1, padding: "4px 0", fontSize: 9, borderRadius: 5,
                background: !newIsLang ? t.purpleBg : "transparent",
                color: !newIsLang ? t.purple : t.textDim,
                border: `1px solid ${!newIsLang ? t.purple + "35" : "transparent"}`, cursor: "pointer", fontFamily: t.fontFamily,
              }}>Concepts</button>
            </div>
            {newIsLang && (
              <div style={{ display: "flex", gap: 3, marginBottom: 6, alignItems: "center" }}>
                <select value={newFrom} onChange={(e) => setNewFrom(e.target.value as LangCode)}
                  style={{ flex: 1, background: t.bgLight, color: t.text, border: `1px solid ${t.border}`, borderRadius: 5, padding: "5px 4px", fontSize: 10, outline: "none", fontFamily: t.fontFamily }}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                </select>
                <span style={{ color: t.accent, fontSize: 12, fontWeight: 700 }}>→</span>
                <select value={newTo} onChange={(e) => setNewTo(e.target.value as LangCode)}
                  style={{ flex: 1, background: t.bgLight, color: t.text, border: `1px solid ${t.border}`, borderRadius: 5, padding: "5px 4px", fontSize: 10, outline: "none", fontFamily: t.fontFamily }}>
                  {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
                </select>
              </div>
            )}
            {!newIsLang && (
              <div style={{ fontSize: 8, color: t.textGhost, marginBottom: 6, padding: "4px 6px", background: "rgba(255,255,255,0.02)", borderRadius: 4, lineHeight: 1.5 }}>
                CS concepts, algorithms, grammar — definitions & notes only.
              </div>
            )}
            <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
              {PALETTE.map((c) => (
                <div key={c} onClick={() => setNewColor(c)} style={{
                  width: 16, height: 16, borderRadius: 3, background: c, cursor: "pointer",
                  border: newColor === c ? "2px solid #fff" : "2px solid transparent",
                }} />
              ))}
            </div>
            <input placeholder="Category name..." value={newName} onChange={(e) => setNewName(e.target.value)}
              style={{
                width: "100%", background: t.bgLight, border: `1px solid ${t.border}`,
                color: t.text, fontSize: 11, borderRadius: 5, padding: "5px 7px",
                outline: "none", fontFamily: t.fontFamily, boxSizing: "border-box", marginBottom: 6,
              }} />
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setShowNew(false)} style={{
                flex: 1, padding: "6px 0", borderRadius: 5, fontSize: 9,
                background: "transparent", border: `1px solid ${t.border}`,
                color: t.textMuted, cursor: "pointer", fontFamily: t.fontFamily,
              }}>Cancel</button>
              <button onClick={handleCreate} style={{
                flex: 2, padding: "6px 0", borderRadius: 5, fontSize: 9,
                background: newName ? t.gradient : t.bgCard,
                border: "none", color: newName ? "#fff" : t.textDim,
                fontWeight: 700, cursor: newName ? "pointer" : "default", fontFamily: t.fontFamily,
              }}>Create</button>
            </div>
          </div>
        )}
      </div>
    </Layer>
  );
}
