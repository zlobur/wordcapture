import { detectLanguage } from "./langDetect";

export function resolvePopupDirection(
  text: string,
  currentFrom: string,
  currentTo: string
): { from: string; to: string; changed: boolean } {
  const trimmed = text.trim();
  if (!trimmed) return { from: currentFrom, to: currentTo, changed: false };

  if (currentFrom === "auto") {
    return { from: currentFrom, to: currentTo, changed: false };
  }

  const detected = detectLanguage(trimmed);

  if (detected === currentFrom) {
    return { from: currentFrom, to: currentTo, changed: false };
  }

  if (detected === currentTo) {
    return { from: currentTo, to: currentFrom, changed: true };
  }

  return { from: detected, to: currentTo, changed: true };
}
