import { useState } from "react";
import { theme as t } from "@/shared/theme";
import { LANGUAGES } from "@/shared/constants";
import { useViews, useCategories, useDecks } from "@/popup/stores/dataStore";
import { Layer } from "@/popup/components/Layer";
import { CefrBadge } from "@/popup/components/shared/CefrBadge";
import type { SavedView, ViewRule, Card } from "@/shared/types";

const POS_VALUES = ["noun", "verb", "adj", "adv", "prep", "concept", "rule"];

const FIELDS = [
  { value: "tag", label: "tag" },
  { value: "cefr", label: "CEFR" },
  { value: "category", label: "category" },
  { value: "reviews", label: "reviews" },
  { value: "pos", label: "pos" },
  { value: "lang", label: "lang" },
  { value: "deck", label: "deck" },
];

interface Props {
  view: SavedView | null;
  onBack: () => void;
  onSelectCard?: (card: Card) => void;
}

export function ViewDetailLayer({ view, onBack, onSelectCard }: Props) {
  const { add, update, remove, executeView } = useViews();
  const { categories } = useCategories();
  const { decks } = useDecks();
  const [rules, setRules] = useState<ViewRule[]>(view?.rules || [{ field: "tag", op: "=", value: "" }]);
  const [name, setName] = useState(view?.name || "");

  const matchedCards = executeView(rules.filter((r) => r.value));
  const matchCount = matchedCards.length;

  const handleSave = () => {
    if (!name.trim()) return;
    if (view) {
      update(view.id, { name: name.trim(), rules });
    } else {
      add({ name: name.trim(), rules });
    }
    onBack();
  };

  const handleDelete = () => {
    if (view && confirm(`Delete view "${view.name}"?`)) {
      remove(view.id);
      onBack();
    }
  };

  const renderValueInput = (r: ViewRule, i: number) => {
    const onChange = (val: string) => { const n = [...rules]; n[i] = { ...n[i], value: val }; setRules(n); };
    const style = { flex: 1.5, background: t.bgCard, border: `1px solid ${t.borderHover}`, color: t.text, fontSize: 8, borderRadius: 3, padding: "3px 4px", outline: "none", fontFamily: t.fontFamily } as const;

    if (r.field === "category") {
      return (
        <select value={r.value} onChange={(e) => onChange(e.target.value)} style={style}>
          <option value="">...</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      );
    }
    if (r.field === "pos") {
      return (
        <select value={r.value} onChange={(e) => onChange(e.target.value)} style={style}>
          <option value="">...</option>
          {POS_VALUES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      );
    }
    if (r.field === "lang") {
      return (
        <select value={r.value} onChange={(e) => onChange(e.target.value)} style={style}>
          <option value="">...</option>
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
        </select>
      );
    }
    if (r.field === "deck") {
      return (
        <select value={r.value} onChange={(e) => onChange(e.target.value)} style={style}>
          <option value="">...</option>
          {decks.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
      );
    }
    return (
      <input value={r.value} onChange={(e) => onChange(e.target.value)} placeholder="value" style={style} />
    );
  };

  return (
    <Layer depth={1} edgeLabel="Views" edgeColor={`${t.teal}20`} onBack={onBack}>
      <div style={{ padding: 10, display: "flex", flexDirection: "column", height: "100%", overflow: "auto" }}>
        <div style={{ color: t.text, fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
          {view ? "Edit View" : "New View"}
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: t.textDim, marginBottom: 2 }}>Name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="View name..."
            style={{
              width: "100%", background: t.bgCard, border: `1px solid ${t.border}`,
              color: t.text, fontSize: 11, borderRadius: 5, padding: "5px 7px",
              outline: "none", fontFamily: t.fontFamily, boxSizing: "border-box",
            }} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <div style={{ fontSize: 8, color: t.textDim, marginBottom: 4 }}>Rules (ALL must match)</div>
          {rules.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 2, marginBottom: 2 }}>
              <select value={r.field}
                onChange={(e) => { const n = [...rules]; n[i] = { ...n[i], field: e.target.value, value: "" }; setRules(n); }}
                style={{ background: t.bgCard, color: t.text, border: `1px solid ${t.border}`, borderRadius: 3, padding: "3px", fontSize: 8, outline: "none", flex: 1, fontFamily: t.fontFamily }}>
                {FIELDS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
              <select value={r.op}
                onChange={(e) => { const n = [...rules]; n[i] = { ...n[i], op: e.target.value }; setRules(n); }}
                style={{ background: t.bgCard, color: t.text, border: `1px solid ${t.border}`, borderRadius: 3, padding: "3px", fontSize: 8, outline: "none", width: 40, fontFamily: t.fontFamily }}>
                <option value="=">=</option>
                <option value="in">in</option>
                <option value=">">{">"}</option>
                <option value="<">{"<"}</option>
              </select>
              {renderValueInput(r, i)}
              {rules.length > 1 && (
                <button onClick={() => setRules(rules.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 9, fontFamily: t.fontFamily }}>{"\u2715"}</button>
              )}
            </div>
          ))}
          <button onClick={() => setRules([...rules, { field: "tag", op: "=", value: "" }])}
            style={{ fontSize: 8, color: t.teal, background: "none", border: `1px dashed ${t.teal}35`, borderRadius: 3, padding: "2px 6px", cursor: "pointer", marginTop: 2, fontFamily: t.fontFamily }}>+ Rule</button>
        </div>
        <div style={{ background: t.tealBg, borderRadius: 6, padding: 7, marginBottom: 8, border: `1px solid ${t.teal}20` }}>
          <div style={{ fontSize: 8, color: t.teal, fontWeight: 600, marginBottom: 2 }}>Preview</div>
          <div style={{ fontSize: 9, color: t.textMuted }}>
            {rules.filter((r) => r.value).map((r) => `${r.field} ${r.op} "${r.value}"`).join(" AND ") || "..."}
          </div>
          <div style={{ fontSize: 8, color: t.textGhost, marginTop: 2 }}>~{matchCount} match</div>
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
          <button onClick={onBack} style={{
            flex: 1, padding: "7px", borderRadius: 6, fontSize: 10,
            background: "rgba(255,255,255,0.04)", border: `1px solid ${t.border}`,
            color: t.textMuted, cursor: "pointer", fontFamily: t.fontFamily,
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "7px", borderRadius: 6, fontSize: 10,
            background: name ? t.gradient : t.bgCard,
            border: "none", color: name ? "#fff" : t.textDim,
            fontWeight: 700, cursor: name ? "pointer" : "default", fontFamily: t.fontFamily,
          }}>{view ? "Save" : "Create"}</button>
          {view && (
            <button onClick={handleDelete} style={{
              padding: "7px 8px", borderRadius: 6, fontSize: 10,
              background: t.dangerBg, border: "none", color: t.danger,
              cursor: "pointer", fontFamily: t.fontFamily,
            }}>{"\u2715"}</button>
          )}
        </div>
        {matchCount > 0 && (
          <div>
            <div style={{ fontSize: 9, color: t.textDim, marginBottom: 4 }}>Matching cards ({matchCount})</div>
            {matchedCards.slice(0, 50).map((card) => (
              <div key={card.id} onClick={() => onSelectCard?.(card)}
                style={{
                  padding: "5px 7px", marginBottom: 2, background: t.bgCard,
                  borderRadius: 5, cursor: onSelectCard ? "pointer" : "default",
                  border: `1px solid ${t.border}`, transition: "all 0.12s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCardHover; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCard; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
                  <span style={{ color: t.text, fontWeight: 600, fontSize: 10 }}>{card.original}</span>
                  <CefrBadge level={card.cefr} />
                </div>
                <div style={{ fontSize: 8, color: t.accentText }}>{card.translation}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layer>
  );
}
