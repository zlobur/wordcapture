import { useSyncExternalStore, useCallback } from "react";
import type { Category, Deck, Card, SavedView, LangCode } from "@/shared/types";
import { MOCK_CATEGORIES, MOCK_DECKS, MOCK_CARDS, MOCK_VIEWS, generateId } from "./mockData";

const KEYS = {
  categories: "wc2:categories",
  decks: "wc2:decks",
  cards: "wc2:cards",
  views: "wc2:views",
  inited: "wc2:inited",
  popupState: "wc2:popupState",
} as const;

const isExtension = typeof chrome !== "undefined" && !!chrome?.storage?.local;

function storageGet<T>(key: string, fallback: T): Promise<T> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (data) => {
        resolve(data[key] !== undefined ? (data[key] as T) : fallback);
      });
    });
  }
  try {
    const raw = localStorage.getItem(key);
    return Promise.resolve(raw ? JSON.parse(raw) : fallback);
  } catch {
    return Promise.resolve(fallback);
  }
}

function storageSet(items: Record<string, unknown>): Promise<void> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set(items, resolve);
    });
  }
  for (const [key, value] of Object.entries(items)) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  window.dispatchEvent(new CustomEvent("wc2:storage-change", { detail: Object.keys(items) }));
  return Promise.resolve();
}

interface StoreSnapshot {
  categories: Category[];
  decks: Deck[];
  cards: Card[];
  views: SavedView[];
}

let snapshot: StoreSnapshot = { categories: [], decks: [], cards: [], views: [] };
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): StoreSnapshot {
  return snapshot;
}

function emit(): void {
  snapshot = { ...snapshot };
  listeners.forEach((l) => l());
}

async function loadFromStorage(): Promise<void> {
  const [categories, decks, cards, views] = await Promise.all([
    storageGet<Category[]>(KEYS.categories, []),
    storageGet<Deck[]>(KEYS.decks, []),
    storageGet<Card[]>(KEYS.cards, []),
    storageGet<SavedView[]>(KEYS.views, []),
  ]);
  snapshot = { categories, decks, cards, views };
  emit();
}

if (isExtension) {
  const relevantKeys = new Set<string>([KEYS.categories, KEYS.decks, KEYS.cards, KEYS.views]);
  chrome.storage.local.onChanged.addListener((changes) => {
    if (Object.keys(changes).some((k) => relevantKeys.has(k))) {
      loadFromStorage();
    }
  });
} else {
  window.addEventListener("wc2:storage-change", () => loadFromStorage());
}

export async function initStore(): Promise<void> {
  const inited = await storageGet<boolean>(KEYS.inited, false);
  if (!inited) {
    await storageSet({
      [KEYS.categories]: MOCK_CATEGORIES,
      [KEYS.decks]: MOCK_DECKS,
      [KEYS.cards]: MOCK_CARDS,
      [KEYS.views]: MOCK_VIEWS,
      [KEYS.inited]: true,
    });
  }
  await loadFromStorage();
}

function mutate<K extends keyof StoreSnapshot>(key: K, updater: (prev: StoreSnapshot[K]) => StoreSnapshot[K]): void {
  snapshot = { ...snapshot, [key]: updater(snapshot[key]) };
  emit();
  storageSet({ [KEYS[key]]: snapshot[key] });
}

export function useCategories() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);

  const add = useCallback((cat: Omit<Category, "id">) => {
    mutate("categories", (list) => [...list, { ...cat, id: generateId() }]);
  }, []);

  const update = useCallback((id: string, patch: Partial<Category>) => {
    mutate("categories", (list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const remove = useCallback((id: string) => {
    const deckIdsToRemove = snapshot.decks.filter((d) => d.categoryId === id).map((d) => d.id);
    mutate("categories", (list) => list.filter((c) => c.id !== id));
    mutate("decks", (list) => list.filter((d) => d.categoryId !== id));
    mutate("cards", (list) =>
      list.map((c) => (deckIdsToRemove.includes(c.deckId || "") ? { ...c, deckId: null } : c))
    );
  }, []);

  return { categories: snap.categories, add, update, remove };
}

export function useDecks() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);

  const add = useCallback((deck: Omit<Deck, "id">) => {
    const newDeck = { ...deck, id: generateId() };
    mutate("decks", (list) => [...list, newDeck]);
    return newDeck;
  }, []);

  const update = useCallback((id: string, patch: Partial<Deck>) => {
    mutate("decks", (list) => list.map((d) => (d.id === id ? { ...d, ...patch } : d)));
  }, []);

  const remove = useCallback((id: string) => {
    mutate("decks", (list) => list.filter((d) => d.id !== id));
    mutate("cards", (list) => list.map((c) => (c.deckId === id ? { ...c, deckId: null } : c)));
  }, []);

  const getByCategory = useCallback((categoryId: string) => {
    return snapshot.decks.filter((d) => d.categoryId === categoryId);
  }, []);

  return { decks: snap.decks, add, update, remove, getByCategory };
}

export function useCards() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  const cards = snap.cards;
  const inbox = cards.filter((c) => c.deckId === null);

  const add = useCallback(
    (
      card: Omit<Card, "id" | "createdAt" | "srs" | "links" | "contexts" | "notes" | "tags"> &
        Partial<Pick<Card, "tags" | "notes" | "contexts" | "links">>
    ) => {
      const newCard: Card = {
        ...card,
        id: generateId(),
        tags: card.tags || [],
        notes: card.notes || "",
        links: card.links || [],
        contexts: card.contexts || [],
        srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null },
        createdAt: new Date().toISOString(),
      };
      mutate("cards", (list) => [newCard, ...list]);
      return newCard;
    },
    []
  );

  const update = useCallback((id: string, patch: Partial<Card>) => {
    mutate("cards", (list) => list.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const remove = useCallback((id: string) => {
    mutate("cards", (list) => list.filter((c) => c.id !== id));
  }, []);

  const moveToDecks = useCallback((cardIds: string[], targetDeckId: string) => {
    mutate("cards", (list) => list.map((c) => (cardIds.includes(c.id) ? { ...c, deckId: targetDeckId } : c)));
  }, []);

  const getByDeck = useCallback((deckId: string) => {
    return snapshot.cards.filter((c) => c.deckId === deckId);
  }, []);

  const getDueCount = useCallback((deckId: string) => {
    const now = new Date().toISOString();
    return snapshot.cards.filter(
      (c) => c.deckId === deckId && (c.srs.nextReviewAt === null || c.srs.nextReviewAt <= now)
    ).length;
  }, []);

  const getDueCountTotal = useCallback(() => {
    const now = new Date().toISOString();
    return snapshot.cards.filter(
      (c) => c.deckId !== null && (c.srs.nextReviewAt === null || c.srs.nextReviewAt <= now)
    ).length;
  }, []);

  return { cards, inbox, add, update, remove, moveToDecks, getByDeck, getDueCount, getDueCountTotal };
}

export function useViews() {
  const snap = useSyncExternalStore(subscribe, getSnapshot);

  const add = useCallback((view: Omit<SavedView, "id">) => {
    mutate("views", (list) => [...list, { ...view, id: generateId() }]);
  }, []);

  const update = useCallback((id: string, patch: Partial<SavedView>) => {
    mutate("views", (list) => list.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  }, []);

  const remove = useCallback((id: string) => {
    mutate("views", (list) => list.filter((v) => v.id !== id));
  }, []);

  const executeView = useCallback((rules: { field: string; op: string; value: string }[]): Card[] => {
    return snapshot.cards.filter((card) => {
      return rules.every((rule) => {
        if (!rule.value) return true;
        switch (rule.field) {
          case "tag":
            return rule.op === "=" ? card.tags.includes(rule.value) : card.tags.some((tg) => tg.includes(rule.value));
          case "cefr":
            if (rule.op === "in") {
              const vals = rule.value.split(",").map((v) => v.trim());
              return card.cefr ? vals.includes(card.cefr) : false;
            }
            return card.cefr === rule.value;
          case "category": {
            const deck = snapshot.decks.find((d) => d.id === card.deckId);
            return deck?.categoryId === rule.value;
          }
          case "reviews":
            if (rule.op === ">") return card.srs.repetitions > parseInt(rule.value);
            if (rule.op === "<") return card.srs.repetitions < parseInt(rule.value);
            return card.srs.repetitions === parseInt(rule.value);
          case "pos":
            return card.partOfSpeech === rule.value;
          case "lang":
            return card.sourceLang === rule.value;
          case "deck":
            return card.deckId === rule.value;
          default:
            return true;
        }
      });
    });
  }, []);

  return { views: snap.views, add, update, remove, executeView };
}

export function resetMockData(): void {
  snapshot = {
    categories: [...MOCK_CATEGORIES],
    decks: [...MOCK_DECKS],
    cards: [...MOCK_CARDS],
    views: [...MOCK_VIEWS],
  };
  emit();
  storageSet({
    [KEYS.categories]: MOCK_CATEGORIES,
    [KEYS.decks]: MOCK_DECKS,
    [KEYS.cards]: MOCK_CARDS,
    [KEYS.views]: MOCK_VIEWS,
  });
}

export function loadPopupState(): { section: string; langFrom: LangCode; langTo: LangCode } | null {
  if (isExtension) return null;
  try {
    const s = localStorage.getItem(KEYS.popupState);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

export async function loadPopupStateAsync(): Promise<{ section: string; langFrom: LangCode; langTo: LangCode } | null> {
  return storageGet(KEYS.popupState, null);
}

export function savePopupState(section: string, langFrom: LangCode, langTo: LangCode): void {
  storageSet({ [KEYS.popupState]: { section, langFrom, langTo } });
}

export { generateId } from "./mockData";
