import type { Language, UserSettings, LangCode } from "./types";

export const API_BASE = "https://wordcapture.app.zlobur.com";

export const LANGUAGES: Language[] = [
  { code: "en", label: "EN", flag: "\u{1F1EC}\u{1F1E7}", name: "English" },
  { code: "ru", label: "RU", flag: "\u{1F1F7}\u{1F1FA}", name: "Русский" },
  { code: "de", label: "DE", flag: "\u{1F1E9}\u{1F1EA}", name: "Deutsch" },
  { code: "el", label: "EL", flag: "\u{1F1EC}\u{1F1F7}", name: "Ελληνικά" },
  { code: "fr", label: "FR", flag: "\u{1F1EB}\u{1F1F7}", name: "Français" },
  { code: "es", label: "ES", flag: "\u{1F1EA}\u{1F1F8}", name: "Español" },
  { code: "it", label: "IT", flag: "\u{1F1EE}\u{1F1F9}", name: "Italiano" },
  { code: "tr", label: "TR", flag: "\u{1F1F9}\u{1F1F7}", name: "Türkçe" },
  { code: "pt", label: "PT", flag: "\u{1F1F5}\u{1F1F9}", name: "Português" },
  { code: "zh", label: "ZH", flag: "\u{1F1E8}\u{1F1F3}", name: "中文" },
  { code: "ja", label: "JA", flag: "\u{1F1EF}\u{1F1F5}", name: "日本語" },
  { code: "ko", label: "KO", flag: "\u{1F1F0}\u{1F1F7}", name: "한국어" },
];

export const V1_LANGUAGES: Language[] = LANGUAGES.filter(l => l.code === "en" || l.code === "ru");

export const DEFAULT_SETTINGS: UserSettings = {
  activeLang: "en",
  targetLang: "ru",
  defaultFromLang: "en",
  defaultToLang: "ru",
  autoDetectLang: true,
  showPopupOnSelect: true,
  audioAutoplay: false,
  cefrHints: true,
};

export type SectionId = "translate" | "inbox" | "categories" | "views" | "review" | "settings";

export function getLang(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
