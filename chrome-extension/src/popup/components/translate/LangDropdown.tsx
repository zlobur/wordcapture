import { useState, useRef, useEffect } from "react";
import { theme as t } from "@/shared/theme";
import { LANGUAGES } from "@/shared/constants";
import type { LangCode } from "@/shared/types";

const AUTO_ENTRY = { code: "auto" as LangCode, flag: "🔍", name: "Auto-detect", label: "Auto" };

interface Props {
  value: LangCode;
  onChange: (code: LangCode) => void;
  showAuto?: boolean;
}

export function LangDropdown({ value, onChange, showAuto }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lang = value === ("auto" as string) ? AUTO_ENTRY : LANGUAGES.find((l) => l.code === value);
  const items = showAuto ? [AUTO_ENTRY, ...LANGUAGES] : LANGUAGES;

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div style={{ position: "relative", flex: 1 }} ref={ref}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", display: "flex", alignItems: "center", gap: 5,
        padding: "6px 8px", borderRadius: 8,
        background: t.bgCard, border: `1px solid ${open ? t.borderHover : t.border}`,
        color: t.text, cursor: "pointer", fontSize: 12, fontWeight: 600,
        transition: "all 0.15s", fontFamily: t.fontFamily,
      }}>
        <span style={{ fontSize: 15 }}>{lang?.flag}</span>
        <span>{lang?.label}</span>
        <span style={{ marginLeft: "auto", fontSize: 8, color: t.textGhost }}>▾</span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 99,
          background: "#252545", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 10, padding: 3, boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          maxHeight: 200, overflow: "auto",
        }}>
          {items.map((l) => (
            <div key={l.code}
              onClick={() => { onChange(l.code); setOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "6px 8px", borderRadius: 7, cursor: "pointer",
                background: l.code === value ? t.accentGlow : "transparent",
                color: l.code === value ? t.accent : t.text,
                fontSize: 12, fontWeight: l.code === value ? 600 : 400,
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => { if (l.code !== value) (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={(e) => { if (l.code !== value) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 15 }}>{l.flag}</span>
              <span style={{ flex: 1 }}>{l.name}</span>
              <span style={{ fontSize: 10, color: t.textGhost }}>{l.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
