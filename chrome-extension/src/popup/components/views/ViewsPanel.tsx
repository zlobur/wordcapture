import { theme as t } from "@/shared/theme";
import { useViews } from "@/popup/stores/dataStore";
import type { SavedView } from "@/shared/types";

interface Props {
  onSelectView: (view: SavedView) => void;
  onNewView: () => void;
}

export function ViewsPanel({ onSelectView, onNewView }: Props) {
  const { views, executeView } = useViews();

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ color: t.text, fontWeight: 700, fontSize: 14 }}>Views</span>
        <span style={{ fontSize: 10, color: t.textDim }}>{views.length}</span>
        <button onClick={onNewView} style={{
          marginLeft: "auto", fontSize: 10, color: t.teal,
          background: "none", border: "none", cursor: "pointer",
          fontWeight: 600, fontFamily: t.fontFamily,
        }}>+ New</button>
      </div>
      <div style={{ fontSize: 9, color: t.textGhost, marginBottom: 8, lineHeight: 1.5 }}>Smart filters across all cards.</div>
      {views.map((view) => {
        const matchCount = executeView(view.rules).length;
        return (
          <div key={view.id} onClick={() => onSelectView(view)}
            style={{
              padding: "9px 10px", marginBottom: 3, borderRadius: 8, cursor: "pointer",
              background: t.bgCard, border: `1px solid ${t.border}`,
              borderLeft: `3px solid ${t.teal}`, transition: "all 0.12s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCardHover; (e.currentTarget as HTMLDivElement).style.borderColor = t.borderHover; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = t.bgCard; (e.currentTarget as HTMLDivElement).style.borderColor = t.border; }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: t.teal, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ color: t.teal, fontWeight: 600, fontSize: 12 }}>{view.name}</div>
                <div style={{ fontSize: 8, color: t.textDim, marginTop: 1 }}>
                  {view.rules.map((r) => `${r.field} ${r.op} ${r.value}`).join(" · ")}
                </div>
              </div>
              <span style={{ fontSize: 9, color: t.textGhost }}>{matchCount}</span>
              <span style={{ color: t.textGhost, fontSize: 12 }}>›</span>
            </div>
          </div>
        );
      })}
      <button onClick={onNewView} style={{
        width: "100%", marginTop: 6, padding: "8px 0", fontSize: 10, color: t.teal,
        background: "transparent", border: `1px dashed ${t.teal}35`,
        borderRadius: 8, cursor: "pointer", fontWeight: 600, fontFamily: t.fontFamily,
      }}>+ Create View</button>
    </div>
  );
}
