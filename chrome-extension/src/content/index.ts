const C = {
  bg:          "#1e1e2e",
  border:      "rgba(56,163,237,0.3)",
  accent:      "#38a3ed",
  accentDark:  "#0078d4",
  accentGlow:  "rgba(56,163,237,0.15)",
  accentText:  "#5cb8f7",
  text:        "#e2e8f0",
  textMuted:   "#94a3b8",
  textDim:     "#64748b",
  success:     "#22c55e",
  successBg:   "rgba(34,197,94,0.15)",
  gradient:    "linear-gradient(135deg, #0078d4, #38a3ed)",
};

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap";

const fontLink = document.createElement("link");
fontLink.href = FONT_URL;
fontLink.rel = "stylesheet";
document.head.appendChild(fontLink);

let currentBadge: HTMLElement | null = null;
let currentPopup: HTMLElement | null = null;
let selectedWord: string = "";
let selectedRange: Range | null = null;

interface LangSettings {
  activeLang: string;
  targetLang: string;
  defaultFromLang: string;
  defaultToLang: string;
}

function getSettings(): Promise<LangSettings> {
  return new Promise((resolve) => {
    chrome.storage.local.get("settings", (data) => {
      const s = data.settings || {};
      resolve({
        activeLang: s.activeLang || "en",
        targetLang: s.targetLang || "ru",
        defaultFromLang: s.defaultFromLang || "en",
        defaultToLang: s.defaultToLang || "ru",
      });
    });
  });
}

function detectScript(text: string): "cyrillic" | "cjk" | "latin" {
  let cyrillic = 0;
  let cjk = 0;
  let total = 0;
  for (const char of text) {
    const code = char.codePointAt(0)!;
    if (code < 0x40) continue;
    total++;
    if (code >= 0x0400 && code <= 0x04FF) cyrillic++;
    else if (
      (code >= 0x3040 && code <= 0x30FF) ||
      (code >= 0x4E00 && code <= 0x9FFF) ||
      (code >= 0xFF00 && code <= 0xFFEF)
    ) cjk++;
  }
  if (total === 0) return "latin";
  if (cyrillic / total > 0.3) return "cyrillic";
  if (cjk / total > 0.2) return "cjk";
  return "latin";
}

function detectLangSimple(text: string): string {
  const script = detectScript(text);
  if (script === "cyrillic") return "ru";
  if (script === "cjk") return "ja";
  return "en";
}

function resolveDirection(text: string, settings: LangSettings): { from: string; to: string } {
  const detected = detectLangSimple(text);
  let from = settings.activeLang;
  let to = settings.targetLang;

  if (detected === from) {
    return { from, to };
  }

  if (detected === to) {
    return { from: to, to: from };
  }

  from = detected;
  if (from === to) {
    to = settings.defaultToLang;
    if (from === to) to = "ru";
  }
  return { from, to };
}

document.addEventListener("mouseup", (e) => {
  const target = e.target as Node;
  if (currentBadge?.contains(target) || currentPopup?.contains(target)) return;
  removeBadge();

  const selection = window.getSelection();
  const word = selection?.toString().trim();
  if (!word || word.length > 200 || !word.match(/\S/)) return;

  const range = selection!.getRangeAt(0);
  selectedWord = word;
  selectedRange = range.cloneRange();
  showBadge(range);
});

function showBadge(range: Range) {
  removeBadge();
  const rect = range.getBoundingClientRect();
  const badge = document.createElement("div");
  badge.id = "wc-badge";

  const top = Math.max(4, rect.top - 12 + window.scrollY);
  const left = Math.min(rect.right + 4, window.innerWidth - 32);

  badge.style.cssText = `
    position: absolute;
    top: ${top}px;
    left: ${left}px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${C.gradient};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 2147483647;
    box-shadow: 0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(56,163,237,0.15);
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 9px;
    font-weight: 800;
    color: #fff;
    letter-spacing: -0.5px;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    user-select: none;
  `;
  badge.textContent = "Wc";

  badge.addEventListener("mouseenter", () => {
    badge.style.transform = "scale(1.15)";
    badge.style.boxShadow = "0 4px 12px rgba(0,0,0,0.5), 0 0 16px rgba(56,163,237,0.25)";
  });
  badge.addEventListener("mouseleave", () => {
    badge.style.transform = "scale(1)";
    badge.style.boxShadow = "0 2px 8px rgba(0,0,0,0.4), 0 0 12px rgba(56,163,237,0.15)";
  });

  badge.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!selectedWord || !selectedRange) return;

    const word = selectedWord;
    const range = selectedRange;
    removeBadge();
    showBubbleLoading(range);

    const settings = await getSettings();
    const dir = resolveDirection(word, settings);

    const translateTimeout = setTimeout(() => { removePopup(); }, 10000);
    chrome.runtime.sendMessage(
      { type: "translate", word, sourceLang: dir.from, targetLang: dir.to },
      (response) => {
        clearTimeout(translateTimeout);
        removePopup();
        if (chrome.runtime.lastError) {
          console.warn("WordCapture:", chrome.runtime.lastError.message);
          return;
        }
        if (response?.success) {
          const raw = response.result;
          const translation = typeof raw === "string" ? raw : (raw?.translation || raw?.text || raw?.translatedText || String(raw));
          showBubble(word, { original: word, translation }, range, dir.from, dir.to);
        }
      }
    );
  });

  document.body.appendChild(badge);
  currentBadge = badge;

  setTimeout(() => {
    const dismissHandler = (e: MouseEvent) => {
      if (currentBadge && !currentBadge.contains(e.target as Node)) {
        removeBadge();
        document.removeEventListener("mousedown", dismissHandler);
      }
    };
    document.addEventListener("mousedown", dismissHandler);
  }, 100);
}

function showBubbleLoading(range: Range) {
  removePopup();
  const rect = range.getBoundingClientRect();
  const popup = document.createElement("div");
  popup.id = "wc-popup";

  const top = Math.min(rect.bottom + 8, window.innerHeight - 80);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 320));

  popup.style.cssText = `
    position: fixed;
    top: ${top}px;
    left: ${left}px;
    width: 200px;
    background: ${C.bg};
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 14px 16px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 13px;
    color: ${C.textDim};
    box-shadow: 0 12px 40px rgba(0,0,0,0.5);
    z-index: 2147483647;
    text-align: center;
  `;
  popup.textContent = "Translating...";

  document.body.appendChild(popup);
  currentPopup = popup;
}

function showBubble(
  word: string,
  result: { original: string; translation: string },
  range: Range,
  sourceLang: string,
  targetLang: string
) {
  removePopup();
  const rect = range.getBoundingClientRect();
  const popup = document.createElement("div");
  popup.id = "wc-popup";

  const top = Math.min(rect.bottom + 8, window.innerHeight - 200);
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - 320));

  popup.style.cssText = `
    position: fixed;
    top: ${top}px;
    left: ${left}px;
    width: 300px;
    background: ${C.bg};
    border: 1px solid ${C.border};
    border-radius: 14px;
    padding: 14px 16px;
    font-family: 'DM Sans', system-ui, sans-serif;
    font-size: 14px;
    color: ${C.text};
    box-shadow: 0 12px 40px rgba(0,0,0,0.5), 0 0 20px rgba(56,163,237,0.06);
    z-index: 2147483647;
    line-height: 1.4;
  `;

  const wordRow = document.createElement("div");
  wordRow.style.cssText = "display:flex;align-items:baseline;gap:10px;margin-bottom:6px;";
  wordRow.innerHTML = `<span style="font-size:18px;font-weight:700;color:${C.text}">${escapeHtml(word)}</span>`;
  popup.appendChild(wordRow);

  const transDiv = document.createElement("div");
  transDiv.style.cssText = `font-size:14px;color:${C.accentText};margin-bottom:10px;`;
  transDiv.textContent = result.translation;
  popup.appendChild(transDiv);

  const actions = document.createElement("div");
  actions.style.cssText = "display:flex;gap:8px;";

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "+ Add to Cards";
  saveBtn.style.cssText = `
    flex:1;
    background: ${C.gradient};
    border:none; color:#fff; border-radius:8px; padding:8px 0;
    font-size:12px; font-weight:600; cursor:pointer;
    font-family: 'DM Sans', system-ui, sans-serif;
  `;
  saveBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    chrome.runtime.sendMessage(
      {
        type: "save",
        original: result.original,
        translation: result.translation,
        sourceLang,
        targetLang,
        sourceUrl: window.location.href,
      },
      () => {
        saveBtn.textContent = "✓ Saved";
        saveBtn.style.background = C.successBg;
        saveBtn.style.color = C.success;
      }
    );
  });
  actions.appendChild(saveBtn);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "✕";
  closeBtn.style.cssText = `
    background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.08);
    color:${C.textMuted}; border-radius:8px; padding:8px 12px;
    font-size:12px; cursor:pointer; font-family:'DM Sans',system-ui,sans-serif;
  `;
  closeBtn.addEventListener("click", (ev) => {
    ev.stopPropagation();
    removePopup();
  });
  actions.appendChild(closeBtn);

  popup.appendChild(actions);
  document.body.appendChild(popup);
  currentPopup = popup;

  setTimeout(() => {
    const handler = (e: MouseEvent) => {
      if (currentPopup && !currentPopup.contains(e.target as Node)) {
        removePopup();
        document.removeEventListener("mousedown", handler);
      }
    };
    document.addEventListener("mousedown", handler);
  }, 200);
}

function removeBadge() {
  currentBadge?.remove();
  currentBadge = null;
}

function removePopup() {
  currentPopup?.remove();
  currentPopup = null;
}

function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

console.log("WordCapture content script loaded");
