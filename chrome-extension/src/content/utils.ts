export interface LangSettings {
  activeLang: string;
  targetLang: string;
  defaultFromLang: string;
  defaultToLang: string;
}

export function detectScript(text: string): "cyrillic" | "cjk" | "arabic" | "latin" {
  let cyrillic = 0;
  let cjk = 0;
  let arabic = 0;
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
    else if (code >= 0x0600 && code <= 0x06FF) arabic++;
  }
  if (total === 0) return "latin";
  if (cyrillic / total > 0.3) return "cyrillic";
  if (cjk / total > 0.2) return "cjk";
  if (arabic / total > 0.3) return "arabic";
  return "latin";
}

export function detectLangSimple(text: string): string {
  const script = detectScript(text);
  if (script === "cyrillic") return "ru";
  if (script === "cjk") return "ja";
  if (script === "arabic") return "ar";
  return "en";
}

export function resolveDirection(text: string, settings: LangSettings): { from: string; to: string } {
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

export function escapeHtml(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
