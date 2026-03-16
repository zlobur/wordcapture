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
  { code: "ar", label: "AR", flag: "\u{1F1F8}\u{1F1E6}", name: "العربية" },
  { code: "pl", label: "PL", flag: "\u{1F1F5}\u{1F1F1}", name: "Polski" },
  { code: "nl", label: "NL", flag: "\u{1F1F3}\u{1F1F1}", name: "Nederlands" },
  { code: "uk", label: "UK", flag: "\u{1F1FA}\u{1F1E6}", name: "Українська" },
  { code: "sv", label: "SV", flag: "\u{1F1F8}\u{1F1EA}", name: "Svenska" },
];

export const LANG_FEATURES: Record<LangCode, {
  translate: boolean;
  enrich: boolean;
  voice: boolean;
  subtitles: boolean;
}> = {
  en: { translate: true,  enrich: true,  voice: true,  subtitles: false },
  ru: { translate: true,  enrich: false, voice: false, subtitles: false },
  de: { translate: true,  enrich: false, voice: false, subtitles: false },
  fr: { translate: true,  enrich: false, voice: false, subtitles: false },
  es: { translate: true,  enrich: false, voice: false, subtitles: false },
  it: { translate: true,  enrich: false, voice: false, subtitles: false },
  pt: { translate: true,  enrich: false, voice: false, subtitles: false },
  ja: { translate: true,  enrich: false, voice: false, subtitles: true  },
  zh: { translate: true,  enrich: false, voice: false, subtitles: false },
  ko: { translate: true,  enrich: false, voice: false, subtitles: false },
  tr: { translate: true,  enrich: false, voice: false, subtitles: false },
  el: { translate: true,  enrich: false, voice: false, subtitles: false },
  ar: { translate: true,  enrich: false, voice: false, subtitles: false },
  pl: { translate: true,  enrich: false, voice: false, subtitles: false },
  nl: { translate: true,  enrich: false, voice: false, subtitles: false },
  uk: { translate: true,  enrich: false, voice: false, subtitles: false },
  sv: { translate: true,  enrich: false, voice: false, subtitles: false },
};

export const DEFAULT_SETTINGS: UserSettings = {
  activeLang: "en",
  targetLang: "ru",
  defaultFromLang: "en",
  defaultToLang: "ru",
  showPopupOnSelect: true,
};

export type SectionId = "translate" | "inbox" | "categories" | "views" | "review" | "settings";

export function getLang(code: LangCode): Language {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}
