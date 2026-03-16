import type { Category, Deck, Card, SavedView } from "@/shared/types";

export interface WcExportData {
  version: 2;
  exportedAt: string;
  categories: Category[];
  decks: Deck[];
  cards: Card[];
  views: SavedView[];
}

const KEYS = {
  categories: "wc2:categories",
  decks: "wc2:decks",
  cards: "wc2:cards",
  views: "wc2:views",
} as const;

function storageGet<T>(key: string, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (data) => {
      resolve(data[key] !== undefined ? (data[key] as T) : fallback);
    });
  });
}

function storageSet(items: Record<string, unknown>): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set(items, resolve);
  });
}

export async function exportData(): Promise<WcExportData> {
  const [categories, decks, cards, views] = await Promise.all([
    storageGet<Category[]>(KEYS.categories, []),
    storageGet<Deck[]>(KEYS.decks, []),
    storageGet<Card[]>(KEYS.cards, []),
    storageGet<SavedView[]>(KEYS.views, []),
  ]);
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories,
    decks,
    cards,
    views,
  };
}

export function downloadJson(data: WcExportData): void {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `wordcapture-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function validateImport(raw: unknown): WcExportData {
  if (!raw || typeof raw !== "object") throw new Error("Invalid JSON structure");
  const obj = raw as Record<string, unknown>;
  if (obj.version !== 2) throw new Error("Unsupported export version");
  if (!Array.isArray(obj.cards)) throw new Error("Missing cards array");
  if (!Array.isArray(obj.categories)) throw new Error("Missing categories array");
  if (!Array.isArray(obj.decks)) throw new Error("Missing decks array");
  return raw as WcExportData;
}

export async function importData(incoming: WcExportData): Promise<{ added: number; skipped: number }> {
  const [existingCategories, existingDecks, existingCards, existingViews] = await Promise.all([
    storageGet<Category[]>(KEYS.categories, []),
    storageGet<Deck[]>(KEYS.decks, []),
    storageGet<Card[]>(KEYS.cards, []),
    storageGet<SavedView[]>(KEYS.views, []),
  ]);

  const existingCardIds = new Set(existingCards.map((c) => c.id));
  const existingCatIds = new Set(existingCategories.map((c) => c.id));
  const existingDeckIds = new Set(existingDecks.map((d) => d.id));
  const existingViewIds = new Set(existingViews.map((v) => v.id));

  let added = 0;
  let skipped = 0;

  const newCards = incoming.cards.filter((c) => {
    if (existingCardIds.has(c.id)) { skipped++; return false; }
    added++;
    return true;
  });

  const newCategories = incoming.categories.filter((c) => !existingCatIds.has(c.id));
  const newDecks = incoming.decks.filter((d) => !existingDeckIds.has(d.id));
  const newViews = (incoming.views || []).filter((v) => !existingViewIds.has(v.id));

  await storageSet({
    [KEYS.categories]: [...existingCategories, ...newCategories],
    [KEYS.decks]: [...existingDecks, ...newDecks],
    [KEYS.cards]: [...existingCards, ...newCards],
    [KEYS.views]: [...existingViews, ...newViews],
  });

  return { added, skipped };
}
