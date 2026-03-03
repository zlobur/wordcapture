import { useState, useEffect } from "react";
import { theme as t } from "@/shared/theme";
import { storage } from "@/shared/storage";
import { LANGUAGES } from "@/shared/constants";
import { resetMockData } from "@/popup/stores/dataStore";
import { Toggle } from "@/popup/components/ui/Toggle";
import type { UserSettings, LangCode } from "@/shared/types";

interface Props {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

export function SettingsPanel({ settings, onUpdate }: Props) {
  const [guid, setGuid] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => { storage.getExtensionId().then(setGuid); }, []);

  const copyGuid = () => {
    navigator.clipboard.writeText(guid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleReset = () => {
    if (confirm("Reset all mock data to defaults? This will clear all your cards, decks, categories, and views.")) {
      resetMockData();
    }
  };

  const card: React.CSSProperties = {
    background: t.bgCard, borderRadius: t.radiusLg,
    padding: 14, border: `1px solid ${t.border}`, marginBottom: 12,
  };

  return (
    <div style={{ padding: 14 }}>
      <div style={{ color: t.text, fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Settings</div>
      <div style={card}>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>Default translation direction</div>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>FROM</div>
            <select value={settings.defaultFromLang}
              onChange={(e) => onUpdate({ defaultFromLang: e.target.value as LangCode })}
              style={{ width: "100%", padding: "6px 8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 12, fontFamily: t.fontFamily, cursor: "pointer", outline: "none" }}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>
          <div style={{ color: t.textDim, fontSize: 14, paddingBottom: 6 }}>→</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: t.textDim, marginBottom: 4 }}>TO</div>
            <select value={settings.defaultToLang}
              onChange={(e) => onUpdate({ defaultToLang: e.target.value as LangCode })}
              style={{ width: "100%", padding: "6px 8px", background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`, borderRadius: 6, color: t.text, fontSize: 12, fontFamily: t.fontFamily, cursor: "pointer", outline: "none" }}>
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.flag} {l.name}</option>)}
            </select>
          </div>
        </div>
      </div>
      <div style={card}>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 6 }}>Your Device GUID</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <code style={{ flex: 1, fontSize: 10, color: t.accent, background: t.accentGlow, padding: "6px 8px", borderRadius: 6, wordBreak: "break-all", fontFamily: t.fontMono }}>{guid}</code>
          <button onClick={copyGuid} style={{
            background: copied ? t.successBg : "rgba(255,255,255,0.05)",
            border: `1px solid ${t.border}`, color: copied ? t.success : t.textMuted,
            borderRadius: 6, padding: "6px 10px", fontSize: 11, cursor: "pointer",
            fontFamily: t.fontFamily,
          }}>{copied ? "✓" : "Copy"}</button>
        </div>
      </div>
      <div style={card}>
        <Toggle label="Auto-detect language on select" checked={settings.autoDetectLang} onChange={(v) => onUpdate({ autoDetectLang: v })} />
        <Toggle label="Show popup on text selection" checked={settings.showPopupOnSelect} onChange={(v) => onUpdate({ showPopupOnSelect: v })} />
        <Toggle label="Audio autoplay" checked={settings.audioAutoplay} onChange={(v) => onUpdate({ audioAutoplay: v })} />
        <Toggle label="CEFR hints in popup" checked={settings.cefrHints} onChange={(v) => onUpdate({ cefrHints: v })} last />
      </div>
      <button onClick={handleReset} style={{
        width: "100%", padding: "8px 0", borderRadius: 6, fontSize: 10,
        background: t.dangerBg, border: "none", color: t.danger,
        cursor: "pointer", fontFamily: t.fontFamily,
      }}>Reset Mock Data</button>
    </div>
  );
}
