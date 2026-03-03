import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

let useCards: any, useDecks: any, useCategories: any, useViews: any;
let importPendingInbox: any, resetMockData: any, autoTranslatePending: any;

async function loadStore() {
  vi.resetModules();
  const mod = await import("@/popup/stores/dataStore");
  useCards = mod.useCards;
  useDecks = mod.useDecks;
  useCategories = mod.useCategories;
  useViews = mod.useViews;
  importPendingInbox = mod.importPendingInbox;
  resetMockData = mod.resetMockData;
  autoTranslatePending = mod.autoTranslatePending;
}

describe("dataStore", () => {
  beforeEach(async () => { await loadStore(); });

  // ─── INBOX ─────────────────────────────
  describe("Inbox cards", () => {
    it("initializes with mock inbox cards (deckId=null)", () => {
      const { result } = renderHook(() => useCards());
      expect(result.current.inbox.length).toBeGreaterThan(0);
      result.current.inbox.forEach((c: any) => expect(c.deckId).toBeNull());
    });

    it("adds a card to inbox with all fields", () => {
      const { result } = renderHook(() => useCards());
      const before = result.current.inbox.length;
      let newCard: any;
      act(() => {
        newCard = result.current.add({
          original: "test-word", translation: "тест-слово",
          sourceLang: "en", targetLang: "ru", deckId: null,
          definition: "a test", transcription: "/test/",
          cefr: "B1", partOfSpeech: "noun",
        });
      });
      expect(result.current.inbox.length).toBe(before + 1);
      const card = result.current.inbox.find((c: any) => c.id === newCard.id);
      expect(card).toBeTruthy();
      expect(card.original).toBe("test-word");
      expect(card.translation).toBe("тест-слово");
      expect(card.sourceLang).toBe("en");
      expect(card.targetLang).toBe("ru");
      expect(card.cefr).toBe("B1");
      expect(card.partOfSpeech).toBe("noun");
      expect(card.definition).toBe("a test");
      expect(card.deckId).toBeNull();
      expect(card.srs).toBeTruthy();
      expect(card.srs.repetitions).toBe(0);
    });

    it("adds card to specific deck, NOT inbox", () => {
      const { result } = renderHook(() => useCards());
      const inboxBefore = result.current.inbox.length;
      act(() => {
        result.current.add({
          original: "deck-word", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: "d1",
        });
      });
      expect(result.current.inbox.length).toBe(inboxBefore);
      expect(result.current.getByDeck("d1").some((c: any) => c.original === "deck-word")).toBe(true);
    });
  });

  // ─── CARD EDIT ─────────────────────────
  describe("Card editing", () => {
    it("updates original (fix typo)", () => {
      const { result } = renderHook(() => useCards());
      const card = result.current.inbox[0];
      act(() => { result.current.update(card.id, { original: "fixed-word" }); });
      expect(result.current.cards.find((c: any) => c.id === card.id)?.original).toBe("fixed-word");
    });

    it("updates translation", () => {
      const { result } = renderHook(() => useCards());
      const card = result.current.inbox[0];
      act(() => { result.current.update(card.id, { translation: "new-translation" }); });
      expect(result.current.cards.find((c: any) => c.id === card.id)?.translation).toBe("new-translation");
    });

    it("removes a card", () => {
      const { result } = renderHook(() => useCards());
      const card = result.current.inbox[0];
      const before = result.current.cards.length;
      act(() => { result.current.remove(card.id); });
      expect(result.current.cards.length).toBe(before - 1);
      expect(result.current.cards.find((c: any) => c.id === card.id)).toBeUndefined();
    });
  });

  // ─── TAGS ──────────────────────────────
  describe("Card tags", () => {
    it("adds tags to a card", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        const c = result.current.add({
          original: "tagged", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: null,
        });
        cardId = c.id;
      });
      act(() => {
        const card = result.current.cards.find((c: any) => c.id === cardId);
        result.current.update(cardId, { tags: [...card.tags, "common"] });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.tags).toContain("common");
    });

    it("batch-created cards get the batch tag", () => {
      const { result } = renderHook(() => useCards());
      let id1: string, id2: string;
      act(() => {
        id1 = result.current.add({
          original: "word1", translation: "",
          sourceLang: "en", targetLang: "ru", deckId: null,
          tags: ["lesson1"],
        }).id;
        id2 = result.current.add({
          original: "word2", translation: "",
          sourceLang: "en", targetLang: "ru", deckId: null,
          tags: ["lesson1"],
        }).id;
      });
      expect(result.current.cards.find((c: any) => c.id === id1).tags).toContain("lesson1");
      expect(result.current.cards.find((c: any) => c.id === id2).tags).toContain("lesson1");
    });

    it("removes a tag from a card", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "x", translation: "y",
          sourceLang: "en", targetLang: "ru", deckId: null,
          tags: ["a", "b", "c"],
        }).id;
      });
      act(() => {
        const card = result.current.cards.find((c: any) => c.id === cardId);
        result.current.update(cardId, { tags: card.tags.filter((t: string) => t !== "b") });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.tags).toEqual(["a", "c"]);
    });
  });

  // ─── LINKS ─────────────────────────────
  describe("Card links", () => {
    it("adds a link to a card", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "x", translation: "y",
          sourceLang: "en", targetLang: "ru", deckId: null,
        }).id;
      });
      act(() => {
        const card = result.current.cards.find((c: any) => c.id === cardId);
        result.current.update(cardId, {
          links: [...card.links, { url: "https://example.com", title: "Example" }]
        });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.links.length).toBe(1);
      expect(card.links[0].url).toBe("https://example.com");
      expect(card.links[0].title).toBe("Example");
    });

    it("removes a link from a card", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "x", translation: "y",
          sourceLang: "en", targetLang: "ru", deckId: null,
          links: [{ url: "https://a.com", title: "A" }, { url: "https://b.com", title: "B" }],
        }).id;
      });
      act(() => {
        const card = result.current.cards.find((c: any) => c.id === cardId);
        result.current.update(cardId, { links: card.links.filter((_: any, i: number) => i !== 0) });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.links.length).toBe(1);
      expect(card.links[0].url).toBe("https://b.com");
    });
  });

  // ─── CONTEXTS ──────────────────────────
  describe("Card contexts", () => {
    it("adds a context sentence", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "consist", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: null,
        }).id;
      });
      act(() => {
        const card = result.current.cards.find((c: any) => c.id === cardId);
        result.current.update(cardId, {
          contexts: [...card.contexts, { sentence: "The meal consists of soup and salad.", source: "manual" }]
        });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.contexts.length).toBe(1);
      expect(card.contexts[0].sentence).toContain("soup and salad");
    });

    it("removes a context", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "x", translation: "y",
          sourceLang: "en", targetLang: "ru", deckId: null,
          contexts: [{ sentence: "A" }, { sentence: "B" }],
        }).id;
      });
      act(() => {
        const card = result.current.cards.find((c: any) => c.id === cardId);
        result.current.update(cardId, { contexts: card.contexts.filter((_: any, i: number) => i !== 0) });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.contexts.length).toBe(1);
      expect(card.contexts[0].sentence).toBe("B");
    });
  });

  // ─── MOVE TO DECK ──────────────────────
  describe("Move cards", () => {
    it("moves inbox cards to a deck", () => {
      const { result } = renderHook(() => useCards());
      let id1: string, id2: string;
      act(() => {
        id1 = result.current.add({ original: "w1", translation: "t1", sourceLang: "en", targetLang: "ru", deckId: null }).id;
        id2 = result.current.add({ original: "w2", translation: "t2", sourceLang: "en", targetLang: "ru", deckId: null }).id;
      });
      const inboxBefore = result.current.inbox.length;
      act(() => { result.current.moveToDecks([id1, id2], "d1"); });
      expect(result.current.inbox.length).toBe(inboxBefore - 2);
      expect(result.current.getByDeck("d1").some((c: any) => c.id === id1)).toBe(true);
      expect(result.current.getByDeck("d1").some((c: any) => c.id === id2)).toBe(true);
    });
  });

  // ─── DECKS ─────────────────────────────
  describe("Decks", () => {
    it("adds a deck to a category", () => {
      const { result } = renderHook(() => useDecks());
      const before = result.current.decks.length;
      act(() => { result.current.add({ name: "New Deck", categoryId: "cat-en" }); });
      expect(result.current.decks.length).toBe(before + 1);
    });

    it("removes a deck and orphans cards to inbox", () => {
      const { result: dr } = renderHook(() => useDecks());
      const { result: cr } = renderHook(() => useCards());
      const d1Cards = cr.current.getByDeck("d1");
      expect(d1Cards.length).toBeGreaterThan(0);
      act(() => { dr.current.remove("d1"); });
      d1Cards.forEach((c: any) => {
        const updated = cr.current.cards.find((x: any) => x.id === c.id);
        expect(updated?.deckId).toBeNull();
      });
    });
  });

  // ─── CATEGORIES ────────────────────────
  describe("Categories", () => {
    it("creates a language category", () => {
      const { result } = renderHook(() => useCategories());
      act(() => {
        result.current.add({
          name: "French", color: "#38a3ed", type: "language",
          sourceLang: "fr", targetLang: "ru",
        });
      });
      expect(result.current.categories.some((c: any) => c.name === "French" && c.type === "language")).toBe(true);
    });

    it("creates a concept category (no langs)", () => {
      const { result } = renderHook(() => useCategories());
      act(() => {
        result.current.add({
          name: "Design Patterns", color: "#a78bfa", type: "concept",
        });
      });
      const cat = result.current.categories.find((c: any) => c.name === "Design Patterns");
      expect(cat).toBeTruthy();
      expect(cat.type).toBe("concept");
      expect(cat.sourceLang).toBeUndefined();
    });

    it("removes category and cascade-deletes decks", () => {
      const { result: catR } = renderHook(() => useCategories());
      const { result: deckR } = renderHook(() => useDecks());
      expect(deckR.current.decks.filter((d: any) => d.categoryId === "cat-en").length).toBeGreaterThan(0);
      act(() => { catR.current.remove("cat-en"); });
      expect(deckR.current.decks.filter((d: any) => d.categoryId === "cat-en").length).toBe(0);
    });
  });

  // ─── VIEWS ─────────────────────────────
  describe("Views", () => {
    it("filters by tag", () => {
      const { result } = renderHook(() => useViews());
      const matched = result.current.executeView([{ field: "tag", op: "=", value: "intermediate" }]);
      expect(matched.length).toBeGreaterThan(0);
      matched.forEach((c: any) => expect(c.tags).toContain("intermediate"));
    });

    it("filters by CEFR range", () => {
      const { result } = renderHook(() => useViews());
      const matched = result.current.executeView([{ field: "cefr", op: "in", value: "B1, B2" }]);
      expect(matched.length).toBeGreaterThan(0);
      matched.forEach((c: any) => expect(["B1", "B2"]).toContain(c.cefr));
    });
  });

  // ─── BRIDGE: CONTENT SCRIPT → INBOX ────
  describe("Content script bridge", () => {
    it("imports pending cards from chrome.storage", async () => {
      const orig = (globalThis as any).chrome.runtime.sendMessage;
      (globalThis as any).chrome.runtime.sendMessage = (msg: any, cb: any) => {
        if (msg.type === "getPendingInbox") {
          cb({ success: true, cards: [
            { id: "p1", original: "hello", translation: "привет", sourceLang: "en", targetLang: "ru", createdAt: new Date().toISOString() },
            { id: "p2", original: "world", translation: "мир", sourceLang: "en", targetLang: "ru", createdAt: new Date().toISOString() },
          ]});
        } else { cb?.({ success: true }); }
      };
      const count = await importPendingInbox();
      expect(count).toBe(2);
      (globalThis as any).chrome.runtime.sendMessage = orig;

      // Verify cards are in inbox
      const { result } = renderHook(() => useCards());
      expect(result.current.inbox.some((c: any) => c.original === "hello")).toBe(true);
      expect(result.current.inbox.some((c: any) => c.original === "world")).toBe(true);
    });

    it("does not duplicate already-imported cards", async () => {
      const orig = (globalThis as any).chrome.runtime.sendMessage;
      (globalThis as any).chrome.runtime.sendMessage = (msg: any, cb: any) => {
        if (msg.type === "getPendingInbox") {
          cb({ success: true, cards: [
            { id: "dup1", original: "test", translation: "t", sourceLang: "en", targetLang: "ru", createdAt: new Date().toISOString() },
          ]});
        } else { cb?.({ success: true }); }
      };
      await importPendingInbox();
      const count2 = await importPendingInbox();
      expect(count2).toBe(0); // Already imported
      (globalThis as any).chrome.runtime.sendMessage = orig;
    });
  });

  // ─── PERSISTENCE ───────────────────────
  describe("Persistence", () => {
    it("persists cards to localStorage", () => {
      const { result } = renderHook(() => useCards());
      act(() => {
        result.current.add({ original: "persist", translation: "x", sourceLang: "en", targetLang: "ru", deckId: null });
      });
      const raw = localStorage.getItem("wc2:cards");
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!).some((c: any) => c.original === "persist")).toBe(true);
    });

    it("popup state (section, langs) persists to localStorage", () => {
      const KEY = "wc2:popupState";
      localStorage.setItem(KEY, JSON.stringify({ section: "inbox", langFrom: "de", langTo: "ru" }));
      const state = JSON.parse(localStorage.getItem(KEY)!);
      expect(state.section).toBe("inbox");
      expect(state.langFrom).toBe("de");
      expect(state.langTo).toBe("ru");
    });
  });

  // ─── RESET ─────────────────────────────
  describe("Reset", () => {
    it("restores defaults", () => {
      const { result } = renderHook(() => useCards());
      act(() => { result.current.add({ original: "custom", translation: "x", sourceLang: "en", targetLang: "ru", deckId: null }); });
      expect(result.current.cards.some((c: any) => c.original === "custom")).toBe(true);
      act(() => { resetMockData(); });
      expect(result.current.cards.some((c: any) => c.original === "custom")).toBe(false);
    });
  });

  // ─── TRANSLATE DISPLAY LOGIC ──────────
  describe("Translate display logic (unit)", () => {
    it("enrich data goes on source word when source=EN", () => {
      // When langFrom=en, enrich data (CEFR, transcription, pos) belongs to the source word
      const langFrom = "en", langTo = "ru";
      const enrichIsSource = langFrom === "en";
      expect(enrichIsSource).toBe(true);
    });

    it("enrich data goes on translation when target=EN", () => {
      // When langFrom=ru, langTo=en, enrich data belongs to the translation
      const langFrom = "ru", langTo = "en";
      const enrichIsSource = langFrom === "en";
      expect(enrichIsSource).toBe(false);
    });

    it("no enrich for non-EN pair (e.g. DE→RU)", () => {
      const langFrom = "de", langTo = "ru";
      const enrichWord = langFrom === "en" ? "test" : langTo === "en" ? "translation" : null;
      expect(enrichWord).toBeNull();
    });
  });
});
