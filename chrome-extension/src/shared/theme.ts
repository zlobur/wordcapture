export const theme = {
  bg:          "#161625",
  bgLight:     "#1e1e32",
  bgPanel:     "#1a1a2e",
  bgCard:      "rgba(255,255,255,0.035)",
  bgCardHover: "rgba(255,255,255,0.07)",
  bgLayerEdge: "#252540",

  border:      "rgba(255,255,255,0.06)",
  borderHover: "rgba(56,163,237,0.4)",

  accent:      "#38a3ed",
  accentDark:  "#0078d4",
  accentGlow:  "rgba(56,163,237,0.12)",
  accentText:  "#5cb8f7",
  gradient:    "linear-gradient(135deg, #0078d4, #38a3ed)",

  text:        "#e2e8f0",
  textMuted:   "#94a3b8",
  textDim:     "#64748b",
  textGhost:   "#475569",

  warn:        "#f59e0b",
  warnBg:      "rgba(245,158,11,0.12)",
  success:     "#22c55e",
  successBg:   "rgba(34,197,94,0.15)",
  danger:      "#ef4444",
  dangerBg:    "rgba(239,68,68,0.1)",

  purple:      "#a78bfa",
  purpleBg:    "rgba(167,139,250,0.1)",
  orange:      "#fb923c",
  orangeBg:    "rgba(251,146,60,0.1)",
  teal:        "#2dd4bf",
  tealBg:      "rgba(45,212,191,0.1)",

  popupWidth:  460,
  popupHeight: 580,
  radius:      8,
  radiusLg:    10,

  fontFamily:  "'DM Sans', system-ui, -apple-system, sans-serif",
  fontMono:    "'JetBrains Mono', 'SF Mono', Consolas, monospace",
} as const;

export type Theme = typeof theme;
