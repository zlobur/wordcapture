import { theme as t } from "@/shared/theme";
import type { SectionId } from "@/shared/constants";

interface Props {
  activeSection: SectionId;
  onSelect: (section: SectionId) => void;
  inboxCount: number;
}

const ITEMS: { id: SectionId; icon: string; label: string; accent?: boolean; enabled?: boolean }[] = [
  { id: "translate", icon: "⇄", label: "Trans", enabled: true },
  { id: "inbox", icon: "📥", label: "Inbox", enabled: true },
  { id: "categories", icon: "📂", label: "Cards", enabled: true },
  { id: "views", icon: "◈", label: "Views", enabled: true },
  { id: "review", icon: "▶", label: "Learn", accent: true, enabled: true },
  { id: "settings", icon: "⚙", label: "", enabled: true },
];

export function SideNav({ activeSection, onSelect, inboxCount }: Props) {
  return (
    <div style={{
      width: 50, background: t.bg, borderRight: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      paddingTop: 6, gap: 1, flexShrink: 0,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 7, background: t.gradient,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontWeight: 800, color: "#fff", marginBottom: 8,
      }}>Wc</div>
      {ITEMS.filter(item => item.enabled).map((item) => (
        <button key={item.id} onClick={() => onSelect(item.id)} title={item.label || item.id}
          style={{
            width: 38, height: 34, borderRadius: 7, border: "none",
            background: activeSection === item.id
              ? (item.accent ? t.gradient : t.accentGlow)
              : "transparent",
            color: activeSection === item.id
              ? (item.accent ? "#fff" : t.accent)
              : t.textGhost,
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 0,
            position: "relative", fontSize: 14, transition: "all 0.15s",
            fontFamily: t.fontFamily,
          }}
          onMouseEnter={(e) => {
            if (activeSection !== item.id) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={(e) => {
            if (activeSection !== item.id) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
          }}
        >
          <span>{item.icon}</span>
          {item.label && <span style={{ fontSize: 7, fontWeight: 500 }}>{item.label}</span>}
          {item.id === "inbox" && inboxCount > 0 && (
            <span style={{
              position: "absolute", top: 1, right: 1, fontSize: 7, fontWeight: 700,
              background: t.warn, color: "#000", borderRadius: 6,
              padding: "0 3px", lineHeight: "11px",
            }}>{inboxCount}</span>
          )}
        </button>
      ))}
    </div>
  );
}
