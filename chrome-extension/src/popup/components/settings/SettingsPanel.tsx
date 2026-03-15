import { useState, useEffect, useRef } from "react";
import { theme as t } from "@/shared/theme";
import { storage } from "@/shared/storage";
import { LANGUAGES } from "@/shared/constants";
import { resetMockData } from "@/popup/stores/dataStore";
import { exportData, downloadJson, importData, validateImport } from "@/popup/stores/exportImport";
import { Toggle } from "@/popup/components/ui/Toggle";
import type { UserSettings, LangCode } from "@/shared/types";

interface Props {
  settings: UserSettings;
  onUpdate: (patch: Partial<UserSettings>) => void;
}

export function SettingsPanel({ settings, onUpdate }: Props) {
  const [guid, setGuid] = useState("");
  const [copied, setCopied] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { storage.getExtensionId().then(setGuid); }, []);

  const copyGuid = () => {
    navigator.clipboard.writeText(guid);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleExport = async () => {
    const data = await exportData();
    downloadJson(data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const raw = JSON.parse(text);
      const validated = validateImport(raw);
      const { added, skipped } = await importData(validated);
      setImportStatus(`+${added} cards${skipped ? `, ${skipped} skipped` : ""}`);
    } catch (err: any) {
      setImportStatus(`Error: ${err.message}`);
    }
    if (fileRef.current) fileRef.current.value = "";
    setTimeout(() => setImportStatus(null), 4000);
  };

  const handleReset = () => {
    if (!resetConfirm) {
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 3000);
      return;
    }
    resetMockData();
    setResetConfirm(false);
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
          <div style={{ color: t.textDim, fontSize: 14, paddingBottom: 6 }}>{"\u2192"}</div>
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
        <Toggle label="Show popup on text selection" checked={settings.showPopupOnSelect} onChange={(v) => onUpdate({ showPopupOnSelect: v })} last />
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
          }}>{copied ? "\u2713" : "Copy"}</button>
        </div>
      </div>
      <div style={card}>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 8 }}>Data</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleExport} style={{
            flex: 1, padding: "8px 0", borderRadius: 6,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`,
            color: t.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: t.fontFamily,
          }}>Export JSON</button>
          <button onClick={() => fileRef.current?.click()} style={{
            flex: 1, padding: "8px 0", borderRadius: 6,
            background: "rgba(255,255,255,0.05)", border: `1px solid ${t.border}`,
            color: t.textMuted, fontSize: 11, fontWeight: 600, cursor: "pointer",
            fontFamily: t.fontFamily,
          }}>Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
        </div>
        {importStatus && (
          <div style={{
            marginTop: 8, fontSize: 11, padding: "6px 8px", borderRadius: 6,
            background: importStatus.startsWith("Error") ? "rgba(239,68,68,0.15)" : t.successBg,
            color: importStatus.startsWith("Error") ? "#ef4444" : t.success,
          }}>{importStatus}</div>
        )}
      </div>
      <div style={card}>
        <button onClick={handleReset} style={{
          width: "100%", padding: "8px 0", borderRadius: 6,
          background: resetConfirm ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${resetConfirm ? "rgba(239,68,68,0.3)" : t.border}`,
          color: resetConfirm ? "#ef4444" : t.textMuted,
          fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: t.fontFamily,
        }}>{resetConfirm ? "Tap again to confirm reset" : "Reset to demo data"}</button>
      </div>
    </div>
  );
}
