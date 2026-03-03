import type { ReactNode } from "react";
import { theme as t } from "@/shared/theme";

interface Props {
  children: ReactNode;
  depth?: number;
  edgeLabel?: string;
  edgeColor?: string;
  onBack?: () => void;
}

export function Layer({ children, depth = 0, edgeLabel, edgeColor, onBack }: Props) {
  const offset = depth * 8;
  return (
    <div style={{
      position: "absolute", inset: 0, left: offset,
      background: t.bgPanel,
      borderLeft: depth > 0 ? `1px solid ${t.border}` : "none",
      borderTopLeftRadius: depth > 0 ? 10 : 0,
      borderBottomLeftRadius: depth > 0 ? 10 : 0,
      boxShadow: depth > 0 ? "-4px 0 20px rgba(0,0,0,0.3)" : "none",
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "left 0.2s ease", zIndex: 10 + depth,
    }}>
      {depth > 0 && onBack && (
        <div onClick={onBack} style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 24,
          background: `linear-gradient(90deg, ${edgeColor || "rgba(37,37,64,0.95)"}, transparent)`,
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          writingMode: "vertical-rl", textOrientation: "mixed",
          fontSize: 9, color: "rgba(200,210,225,0.55)", fontWeight: 600, letterSpacing: 0.5,
          zIndex: 2, borderRight: `1px solid ${t.border}`, transition: "color 0.2s",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.color = "rgba(230,240,255,0.85)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.color = "rgba(200,210,225,0.55)"; }}
        >
          <span style={{ transform: "rotate(180deg)" }}>‹ {edgeLabel || "back"}</span>
        </div>
      )}
      <div style={{ flex: 1, overflow: "auto", marginLeft: depth > 0 ? 24 : 0 }}>
        {children}
      </div>
    </div>
  );
}
