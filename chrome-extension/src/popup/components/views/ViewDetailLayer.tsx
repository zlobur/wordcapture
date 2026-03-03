import { useState } from "react";
import { theme as t } from "@/shared/theme";
import { useViews } from "@/popup/stores/dataStore";
import { Layer } from "@/popup/components/Layer";
import type { SavedView, ViewRule } from "@/shared/types";

interface Props {
  view: SavedView | null;
  onBack: () => void;
}

export function ViewDetailLayer({ view, onBack }: Props) {
  const { add, update, remove, executeView } = useViews();
  const [rules, setRules] = useState<ViewRule[]>(view?.rules || [{ field: "tag", op: "=", value: "" }]);
  const [name, setName] = useState(view?.name || "");

  const matchCount = executeView(rules.filter((r) => r.value)).length;

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

  return (
    <Layer depth={1} edgeLabel="Views" edgeColor={`${t.teal}20`} onBack={onBack}>
      <div style={{ padding: 10 }}>
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
                onChange={(e) => { const n = [...rules]; n[i] = { ...n[i], field: e.target.value }; setRules(n); }}
                style={{ background: t.bgCard, color: t.text, border: `1px solid ${t.border}`, borderRadius: 3, padding: "3px", fontSize: 8, outline: "none", flex: 1, fontFamily: t.fontFamily }}>
                <option value="tag">tag</option>
                <option value="cefr">CEFR</option>
                <option value="category">category</option>
                <option value="reviews">reviews</option>
                <option value="pos">pos</option>
              </select>
              <select value={r.op}
                onChange={(e) => { const n = [...rules]; n[i] = { ...n[i], op: e.target.value }; setRules(n); }}
                style={{ background: t.bgCard, color: t.text, border: `1px solid ${t.border}`, borderRadius: 3, padding: "3px", fontSize: 8, outline: "none", width: 40, fontFamily: t.fontFamily }}>
                <option value="=">=</option>
                <option value="in">in</option>
                <option value=">">{">"}</option>
                <option value="<">{"<"}</option>
              </select>
              <input value={r.value}
                onChange={(e) => { const n = [...rules]; n[i] = { ...n[i], value: e.target.value }; setRules(n); }}
                placeholder="value"
                style={{ flex: 1.5, background: t.bgCard, border: `1px solid ${t.borderHover}`, color: t.text, fontSize: 8, borderRadius: 3, padding: "3px 4px", outline: "none", fontFamily: t.fontFamily }} />
              {rules.length > 1 && (
                <button onClick={() => setRules(rules.filter((_, idx) => idx !== i))}
                  style={{ background: "none", border: "none", color: t.danger, cursor: "pointer", fontSize: 9, fontFamily: t.fontFamily }}>✕</button>
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
        <div style={{ display: "flex", gap: 4 }}>
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
            }}>✕</button>
          )}
        </div>
      </div>
    </Layer>
  );
}
