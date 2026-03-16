export type LangCode = "en" | "ru" | "de" | "el" | "fr" | "es" | "it" | "tr" | "pt" | "zh" | "ja" | "ko" | "ar" | "pl" | "nl" | "uk" | "sv";

export interface Language {
  code: LangCode;
  label: string;
  flag: string;
  name: string;
}

export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export interface Category {
  id: string;
  name: string;
  color: string;
  type: "language" | "concept";
  sourceLang?: LangCode;
  targetLang?: LangCode;
}

export interface Deck {
  id: string;
  name: string;
  categoryId: string;
}

export interface Card {
  id: string;
  original: string;
  translation: string;
  definition?: string;
  transcription?: string;
  cefr?: CefrLevel;
  partOfSpeech?: string;
  tags: string[];
  deckId: string | null;
  sourceLang: LangCode;
  targetLang: LangCode;
  notes: string;
  links: CardLink[];
  contexts: CardContext[];
  srs: SrsData;
  createdAt: string;
  sourceUrl?: string;
  sourceDomain?: string;
}

export interface CardLink {
  url: string;
  title: string;
}

export interface CardContext {
  sentence: string;
  source?: string;
}

export interface SrsData {
  interval: number;
  easeFactor: number;
  repetitions: number;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
}

export interface ViewRule {
  field: string;
  op: string;
  value: string;
}

export interface SavedView {
  id: string;
  name: string;
  rules: ViewRule[];
}

export interface TranslateRequest {
  text: string;
  sourceLang: LangCode;
  targetLang: LangCode;
}

export interface TranslateResult {
  original: string;
  translation: string;
}

export interface EnrichResult {
  word: string;
  translation: string;
  transcription: string;
  tag: string;
  context: string;
  cefr?: CefrLevel;
  partOfSpeech?: string;
  grammarNote?: string;
}

export interface UserSettings {
  activeLang: LangCode;
  targetLang: LangCode;
  defaultFromLang: LangCode;
  defaultToLang: LangCode;
  showPopupOnSelect: boolean;
}

export type MessageType =
  | { type: "translate"; text: string; sourceLang: LangCode; targetLang: LangCode }
  | { type: "enrich"; word: string }
  | { type: "save"; original: string; translation: string; context?: string; sourceUrl?: string }
  | { type: "getSettings" }
  | { type: "updateSettings"; settings: Partial<UserSettings> };

export interface MessageResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
