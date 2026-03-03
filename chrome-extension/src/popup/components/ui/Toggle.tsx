import { theme as t } from "@/shared/theme";

interface Props {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}

export function Toggle({ label, checked, onChange, last }: Props) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingBottom: last ? 0 : 10,
        marginBottom: last ? 0 : 10,
        borderBottom: last ? "none" : `1px solid ${t.border}`,
      }}
    >
      <span style={{ fontSize: 12, color: t.textMuted }}>{label}</span>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          cursor: "pointer",
          background: checked ? t.accent : "rgba(255,255,255,0.1)",
          position: "relative",
          transition: "background 0.2s",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
            position: "absolute",
            top: 2,
            left: checked ? 18 : 2,
            transition: "left 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
          }}
        />
      </div>
    </div>
  );
}
