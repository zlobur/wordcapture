import { useState, useEffect, useCallback } from "react";
import type { Category, Deck, Card, SavedView, LangCode } from "@/shared/types";
import { MOCK_CATEGORIES, MOCK_DECKS, MOCK_CARDS, MOCK_VIEWS, generateId } from "./mockData";

// ─── Storage keys ────────────────────────────────────
const KEYS = {
  categories: "wc2:categories",
  decks: "wc2:decks",
  cards: "wc2:cards",
  views: "wc2:views",
  inited: "wc2:inited",
};

// ─── localStorage helpers ────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// ─── Init with defaults if first run ─────────────────
function initIfEmpty(): void {
  if (!localStorage.getItem(KEYS.inited)) {
    save(KEYS.categories, MOCK_CATEGORIES);
    save(KEYS.decks, MOCK_DECKS);
    save(KEYS.cards, MOCK_CARDS);
    save(KEYS.views, MOCK_VIEWS);
    save(KEYS.inited, true);
  }
}
initIfEmpty();

// ─── Reactivity via custom event ─────────────────────
let _rev = 0;
function bump(): void {
  _rev++;
  window.dispatchEvent(new CustomEvent("wc2:store-change"));
}

function useStoreRev(): number {
  const [rev, setRev] = useState(_rev);
  useEffect(() => {
    const handler = () => setRev(++_rev);
    window.addEventListener("wc2:store-change", handler);
    return () => window.removeEventListener("wc2:store-change", handler);
  }, []);
  return rev;
}

// ─── Bridge: import cards from content script ────────
// Background pushes saved words to chrome.storage.local["wc2:pendingInbox"]
// On popup open we pull them in, merge into our store, then clear.
export async function importPendingInbox(): Promise<number> {
  if (typeof chrome === "undefined" || !chrome?.runtime?.sendMessage) return 0;
  try {
    const resp: any = await new Promise((resolve) => {
      chrome.runtime.sendMessage({ type: "getPendingInbox" }, resolve);
    });
    const pending: any[] = resp?.cards || [];
    if (pending.length === 0) return 0;

    const cards = load<Card[]>(KEYS.cards, []);
    const existingIds = new Set(cards.map((c) => c.id));
    let imported = 0;

    for (const p of pending) {
      if (existingIds.has(p.id)) continue;
      const newCard: Card = {
        id: p.id || generateId(),
        original: p.original || "",
        translation: p.translation || "",
        definition: undefined,
        transcription: undefined,
        cefr: undefined,
        partOfSpeech: undefined,
        tags: [],
        deckId: null, // → inbox
        sourceLang: (p.sourceLang || "en") as LangCode,
        targetLang: (p.targetLang || "ru") as LangCode,
        notes: "",
        links: [],
        contexts: p.sourceUrl
          ? [{ sentence: `Saved from ${p.sourceDomain || p.sourceUrl}`, source: p.sourceDomain || "" }]
          : [],
        srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null },
        createdAt: p.createdAt || new Date().toISOString(),
        sourceUrl: p.sourceUrl,
        sourceDomain: p.sourceDomain,
      };
      cards.unshift(newCard);
      imported++;
    }

    if (imported > 0) {
      save(KEYS.cards, cards);
      bump();
    }

    // Clear pending
    chrome.runtime.sendMessage({ type: "clearPendingInbox" });
    return imported;
  } catch {
    return 0;
  }
}

// ─── Auto-translate: enrich cards with "translating..." or empty translation ──
export async function autoTranslatePending(): Promise<void> {
  const cards = load<Card[]>(KEYS.cards, []);
  const pending = cards.filter(
    (c) => !c.translation || c.translation === "translating..." || c.translation === ""
  );
  if (pending.length === 0) return;

  for (const card of pending) {
    try {
      // Call background for translate
      const trResp: any = await new Promise((resolve) => {
        if (typeof chrome !== "undefined" && chrome?.runtime?.sendMessage) {
          chrome.runtime.sendMessage(
            { type: "translate", text: card.original, sourceLang: card.sourceLang, targetLang: card.targetLang },
            resolve
          );
        } else {
          resolve({ success: false });
        }
      });

      if (trResp?.success && trResp.result) {
        const translation = typeof trResp.result === "string"
          ? trResp.result
          : trResp.result.translation || trResp.result.text || "";

        // Update card in store
        const allCards = load<Card[]>(KEYS.cards, []);
        const idx = allCards.findIndex((c) => c.id === card.id);
        if (idx >= 0) {
          allCards[idx].translation = translation || allCards[idx].translation;
        }
        save(KEYS.cards, allCards);
        bump();
      }

      // Try enrich too (fire-and-forget, update if succeeds)
      try {
        const enResp: any = await new Promise((resolve) => {
          if (typeof chrome !== "undefined" && chrome?.runtime?.sendMessage) {
            chrome.runtime.sendMessage({ type: "enrich", word: card.original }, resolve);
          } else {
            resolve({ success: false });
          }
        });
        if (enResp?.success && enResp.result) {
          const r = enResp.result;
          const allCards = load<Card[]>(KEYS.cards, []);
          const idx = allCards.findIndex((c) => c.id === card.id);
          if (idx >= 0) {
            if (r.transcription) allCards[idx].transcription = r.transcription;
            if (r.cefr) allCards[idx].cefr = r.cefr;
            if (r.partOfSpeech || r.tag) allCards[idx].partOfSpeech = r.partOfSpeech || r.tag;
            if (r.context) allCards[idx].definition = r.context;
          }
          save(KEYS.cards, allCards);
          bump();
        }
      } catch {}
    } catch {}
  }
}

// ─── Hooks ───────────────────────────────────────────

export function useCategories() {
  useStoreRev();
  const categories = load<Category[]>(KEYS.categories, []);

  const add = useCallback((cat: Omit<Category, "id">) => {
    const list = load<Category[]>(KEYS.categories, []);
    list.push({ ...cat, id: generateId() });
    save(KEYS.categories, list);
    bump();
  }, []);

  const update = useCallback((id: string, patch: Partial<Category>) => {
    const list = load<Category[]>(KEYS.categories, []);
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...patch };
    save(KEYS.categories, list);
    bump();
  }, []);

  const remove = useCallback((id: string) => {
    let cats = load<Category[]>(KEYS.categories, []);
    cats = cats.filter((c) => c.id !== id);
    save(KEYS.categories, cats);
    const decks = load<Deck[]>(KEYS.decks, []);
    const deckIdsToRemove = decks.filter((d) => d.categoryId === id).map((d) => d.id);
    save(KEYS.decks, decks.filter((d) => d.categoryId !== id));
    const cards = load<Card[]>(KEYS.cards, []);
    save(KEYS.cards, cards.map((c) => deckIdsToRemove.includes(c.deckId || "") ? { ...c, deckId: null } : c));
    bump();
  }, []);

  return { categories, add, update, remove };
}

export function useDecks() {
  useStoreRev();
  const decks = load<Deck[]>(KEYS.decks, []);

  const add = useCallback((deck: Omit<Deck, "id">) => {
    const list = load<Deck[]>(KEYS.decks, []);
    const newDeck = { ...deck, id: generateId() };
    list.push(newDeck);
    save(KEYS.decks, list);
    bump();
    return newDeck;
  }, []);

  const update = useCallback((id: string, patch: Partial<Deck>) => {
    const list = load<Deck[]>(KEYS.decks, []);
    const idx = list.findIndex((d) => d.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...patch };
    save(KEYS.decks, list);
    bump();
  }, []);

  const remove = useCallback((id: string) => {
    let list = load<Deck[]>(KEYS.decks, []);
    list = list.filter((d) => d.id !== id);
    save(KEYS.decks, list);
    const cards = load<Card[]>(KEYS.cards, []);
    save(KEYS.cards, cards.map((c) => c.deckId === id ? { ...c, deckId: null } : c));
    bump();
  }, []);

  const getByCategory = useCallback((categoryId: string) => {
    return load<Deck[]>(KEYS.decks, []).filter((d) => d.categoryId === categoryId);
  }, []);

  return { decks, add, update, remove, getByCategory };
}

export function useCards() {
  useStoreRev();
  const cards = load<Card[]>(KEYS.cards, []);
  const inbox = cards.filter((c) => c.deckId === null);

  const add = useCallback(
    (
      card: Omit<Card, "id" | "createdAt" | "srs" | "links" | "contexts" | "notes" | "tags"> &
        Partial<Pick<Card, "tags" | "notes" | "contexts" | "links">>
    ) => {
      const list = load<Card[]>(KEYS.cards, []);
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
      list.unshift(newCard);
      save(KEYS.cards, list);
      bump();
      return newCard;
    },
    []
  );

  const update = useCallback((id: string, patch: Partial<Card>) => {
    const list = load<Card[]>(KEYS.cards, []);
    const idx = list.findIndex((c) => c.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...patch };
    save(KEYS.cards, list);
    bump();
  }, []);

  const remove = useCallback((id: string) => {
    let list = load<Card[]>(KEYS.cards, []);
    list = list.filter((c) => c.id !== id);
    save(KEYS.cards, list);
    bump();
  }, []);

  const moveToDecks = useCallback((cardIds: string[], targetDeckId: string) => {
    const list = load<Card[]>(KEYS.cards, []);
    for (const c of list) {
      if (cardIds.includes(c.id)) c.deckId = targetDeckId;
    }
    save(KEYS.cards, list);
    bump();
  }, []);

  const getByDeck = useCallback((deckId: string) => {
    return load<Card[]>(KEYS.cards, []).filter((c) => c.deckId === deckId);
  }, []);

  const getDueCount = useCallback((deckId: string) => {
    const now = new Date().toISOString();
    return load<Card[]>(KEYS.cards, []).filter(
      (c) => c.deckId === deckId && c.srs.nextReviewAt && c.srs.nextReviewAt <= now
    ).length;
  }, []);

  const getDueCountTotal = useCallback(() => {
    const now = new Date().toISOString();
    return load<Card[]>(KEYS.cards, []).filter(
      (c) => c.deckId !== null && c.srs.nextReviewAt && c.srs.nextReviewAt <= now
    ).length;
  }, []);

  return { cards, inbox, add, update, remove, moveToDecks, getByDeck, getDueCount, getDueCountTotal };
}

export function useViews() {
  useStoreRev();
  const views = load<SavedView[]>(KEYS.views, []);

  const add = useCallback((view: Omit<SavedView, "id">) => {
    const list = load<SavedView[]>(KEYS.views, []);
    list.push({ ...view, id: generateId() });
    save(KEYS.views, list);
    bump();
  }, []);

  const update = useCallback((id: string, patch: Partial<SavedView>) => {
    const list = load<SavedView[]>(KEYS.views, []);
    const idx = list.findIndex((v) => v.id === id);
    if (idx >= 0) list[idx] = { ...list[idx], ...patch };
    save(KEYS.views, list);
    bump();
  }, []);

  const remove = useCallback((id: string) => {
    let list = load<SavedView[]>(KEYS.views, []);
    list = list.filter((v) => v.id !== id);
    save(KEYS.views, list);
    bump();
  }, []);

  const executeView = useCallback((rules: { field: string; op: string; value: string }[]): Card[] => {
    const allCards = load<Card[]>(KEYS.cards, []);
    return allCards.filter((card) => {
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
            const decks = load<Deck[]>(KEYS.decks, []);
            const deck = decks.find((d) => d.id === card.deckId);
            return deck?.categoryId === rule.value;
          }
          case "reviews":
            if (rule.op === ">") return card.srs.repetitions > parseInt(rule.value);
            if (rule.op === "<") return card.srs.repetitions < parseInt(rule.value);
            return card.srs.repetitions === parseInt(rule.value);
          case "pos":
            return card.partOfSpeech === rule.value;
          default:
            return true;
        }
      });
    });
  }, []);

  return { views, add, update, remove, executeView };
}

// ─── Reset (Settings) ────────────────────────────────
export function resetMockData(): void {
  localStorage.removeItem(KEYS.inited);
  localStorage.removeItem(KEYS.categories);
  localStorage.removeItem(KEYS.decks);
  localStorage.removeItem(KEYS.cards);
  localStorage.removeItem(KEYS.views);
  initIfEmpty();
  bump();
}
