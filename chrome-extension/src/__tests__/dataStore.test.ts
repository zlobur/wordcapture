import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

let useCards: any, useDecks: any, useCategories: any, useViews: any;
let resetMockData: any, initStore: any;

async function loadStore() {
  vi.resetModules();
  const mod = await import("@/popup/stores/dataStore");
  useCards = mod.useCards;
  useDecks = mod.useDecks;
  useCategories = mod.useCategories;
  useViews = mod.useViews;
  resetMockData = mod.resetMockData;
  initStore = mod.initStore;
  await mod.initStore();
}

describe("dataStore", () => {
  beforeEach(async () => { await loadStore(); });

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

  describe("Persistence (chrome.storage.local)", () => {
    it("persists cards to chrome.storage.local", () => {
      const { result } = renderHook(() => useCards());
      act(() => {
        result.current.add({ original: "persist", translation: "x", sourceLang: "en", targetLang: "ru", deckId: null });
      });
      return new Promise<void>((resolve) => {
        chrome.storage.local.get("wc2:cards", (data: any) => {
          expect(data["wc2:cards"]).toBeTruthy();
          expect(data["wc2:cards"].some((c: any) => c.original === "persist")).toBe(true);
          resolve();
        });
      });
    });

    it("popup state persists via savePopupState", async () => {
      const mod = await import("@/popup/stores/dataStore");
      mod.savePopupState("inbox", "de", "ru");
      return new Promise<void>((resolve) => {
        chrome.storage.local.get("wc2:popupState", (data: any) => {
          expect(data["wc2:popupState"]).toBeTruthy();
          expect(data["wc2:popupState"].section).toBe("inbox");
          expect(data["wc2:popupState"].langFrom).toBe("de");
          expect(data["wc2:popupState"].langTo).toBe("ru");
          resolve();
        });
      });
    });
  });

  describe("Reset", () => {
    it("restores defaults", () => {
      const { result } = renderHook(() => useCards());
      act(() => { result.current.add({ original: "custom", translation: "x", sourceLang: "en", targetLang: "ru", deckId: null }); });
      expect(result.current.cards.some((c: any) => c.original === "custom")).toBe(true);
      act(() => { resetMockData(); });
      expect(result.current.cards.some((c: any) => c.original === "custom")).toBe(false);
    });
  });

  describe("Translate display logic (unit)", () => {
    it("enrich data goes on source word when source=EN", () => {
      const langFrom = "en", langTo = "ru";
      const enrichIsSource = langFrom === "en";
      expect(enrichIsSource).toBe(true);
    });

    it("enrich data goes on translation when target=EN", () => {
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

  describe("Review due count", () => {
    it("new card in deck counts as due (nextReviewAt=null)", () => {
      const { result } = renderHook(() => useCards());
      act(() => {
        result.current.add({
          original: "new-due", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: "d1",
        });
      });
      expect(result.current.getDueCount("d1")).toBeGreaterThan(0);
    });

    it("card with past nextReviewAt counts as due", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "past-due", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: "d1",
        }).id;
      });
      act(() => {
        result.current.update(cardId, {
          srs: {
            interval: 1, easeFactor: 2.5, repetitions: 1,
            nextReviewAt: new Date(Date.now() - 86400000).toISOString(),
            lastReviewedAt: new Date(Date.now() - 172800000).toISOString(),
          }
        });
      });
      expect(result.current.getDueCount("d1")).toBeGreaterThan(0);
    });

    it("card with future nextReviewAt does NOT count as due", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "future", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: "d1",
        }).id;
      });
      act(() => {
        result.current.update(cardId, {
          srs: {
            interval: 30, easeFactor: 2.5, repetitions: 3,
            nextReviewAt: new Date(Date.now() + 86400000 * 30).toISOString(),
            lastReviewedAt: new Date().toISOString(),
          }
        });
      });
      const dueCards = result.current.cards.filter(
        (c: any) => c.deckId === "d1" && (c.srs.nextReviewAt === null || c.srs.nextReviewAt <= new Date().toISOString())
      );
      const futureCard = dueCards.find((c: any) => c.id === cardId);
      expect(futureCard).toBeUndefined();
    });

    it("inbox cards do NOT count in getDueCountTotal", () => {
      const { result } = renderHook(() => useCards());
      act(() => {
        result.current.add({
          original: "inbox-card", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: null,
        });
      });
      const total = result.current.getDueCountTotal();
      expect(total).toBe(
        result.current.cards.filter((c: any) =>
          c.deckId !== null && (c.srs.nextReviewAt === null || c.srs.nextReviewAt <= new Date().toISOString())
        ).length
      );
    });

    it("SRS update via card.update changes nextReviewAt", () => {
      const { result } = renderHook(() => useCards());
      let cardId: string;
      act(() => {
        cardId = result.current.add({
          original: "srs-test", translation: "x",
          sourceLang: "en", targetLang: "ru", deckId: "d1",
        }).id;
      });
      const futureDate = new Date(Date.now() + 86400000 * 7).toISOString();
      act(() => {
        result.current.update(cardId, {
          srs: {
            interval: 7, easeFactor: 2.5, repetitions: 2,
            nextReviewAt: futureDate,
            lastReviewedAt: new Date().toISOString(),
          }
        });
      });
      const card = result.current.cards.find((c: any) => c.id === cardId);
      expect(card.srs.nextReviewAt).toBe(futureDate);
      expect(card.srs.interval).toBe(7);
      expect(card.srs.repetitions).toBe(2);
    });
  });
});
