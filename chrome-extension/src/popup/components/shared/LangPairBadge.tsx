import { LANGUAGES } from "@/shared/constants";

export function LangPairBadge({ from, to, small }: { from?: string; to?: string; small?: boolean }) {
  const fl = LANGUAGES.find((l) => l.code === from);
  const tl = LANGUAGES.find((l) => l.code === to);
  if (!fl || !tl) return null;
  return (
    <span style={{
      fontSize: small ? 8 : 9, padding: small ? "1px 4px" : "2px 6px", borderRadius: 4,
      background: "rgba(255,255,255,0.04)", color: "#64748b", fontWeight: 500,
    }}>
      {fl.flag}→{tl.flag}
    </span>
  );
}
