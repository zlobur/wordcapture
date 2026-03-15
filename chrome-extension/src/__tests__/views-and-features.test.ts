import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { LANG_FEATURES, LANGUAGES } from "@/shared/constants";
import type { LangCode } from "@/shared/types";

let useViews: any, useCards: any, initStore: any;

async function loadStore() {
  vi.resetModules();
  const mod = await import("@/popup/stores/dataStore");
  useViews = mod.useViews;
  useCards = mod.useCards;
  initStore = mod.initStore;
  await mod.initStore();
}

describe("Views — new filter fields", () => {
  beforeEach(async () => { await loadStore(); });

  it("filters by lang (sourceLang)", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([{ field: "lang", op: "=", value: "de" }]);
    expect(matched.length).toBeGreaterThan(0);
    matched.forEach((c: any) => expect(c.sourceLang).toBe("de"));
  });

  it("filters by lang — returns no cards for unused lang", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([{ field: "lang", op: "=", value: "sv" }]);
    expect(matched.length).toBe(0);
  });

  it("filters by deck ID", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([{ field: "deck", op: "=", value: "d1" }]);
    expect(matched.length).toBeGreaterThan(0);
    matched.forEach((c: any) => expect(c.deckId).toBe("d1"));
  });

  it("filters by deck — returns no cards for unknown deck", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([{ field: "deck", op: "=", value: "nonexistent" }]);
    expect(matched.length).toBe(0);
  });

  it("combined AND: lang + tag", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([
      { field: "lang", op: "=", value: "en" },
      { field: "tag", op: "=", value: "intermediate" },
    ]);
    expect(matched.length).toBeGreaterThan(0);
    matched.forEach((c: any) => {
      expect(c.sourceLang).toBe("en");
      expect(c.tags).toContain("intermediate");
    });
  });

  it("combined AND: deck + cefr", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([
      { field: "deck", op: "=", value: "d1" },
      { field: "cefr", op: "in", value: "B1, B2" },
    ]);
    matched.forEach((c: any) => {
      expect(c.deckId).toBe("d1");
      expect(["B1", "B2"]).toContain(c.cefr);
    });
  });

  it("combined AND: lang + deck + cefr — triple filter", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([
      { field: "lang", op: "=", value: "en" },
      { field: "deck", op: "=", value: "d2" },
      { field: "cefr", op: "in", value: "B1, B2" },
    ]);
    matched.forEach((c: any) => {
      expect(c.sourceLang).toBe("en");
      expect(c.deckId).toBe("d2");
      expect(["B1", "B2"]).toContain(c.cefr);
    });
  });

  it("empty value rule matches all", () => {
    const { result: vr } = renderHook(() => useViews());
    const { result: cr } = renderHook(() => useCards());
    const matched = vr.current.executeView([{ field: "lang", op: "=", value: "" }]);
    expect(matched.length).toBe(cr.current.cards.length);
  });

  it("filters by category via deck", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([{ field: "category", op: "=", value: "cat-de" }]);
    expect(matched.length).toBeGreaterThan(0);
    matched.forEach((c: any) => expect(c.sourceLang).toBe("de"));
  });

  it("filters by pos (part of speech)", () => {
    const { result } = renderHook(() => useViews());
    const matched = result.current.executeView([{ field: "pos", op: "=", value: "noun" }]);
    expect(matched.length).toBeGreaterThan(0);
    matched.forEach((c: any) => expect(c.partOfSpeech).toBe("noun"));
  });
});

describe("LANG_FEATURES matrix", () => {
  it("en has enrich=true", () => {
    expect(LANG_FEATURES.en.enrich).toBe(true);
  });

  it("en has voice=true", () => {
    expect(LANG_FEATURES.en.voice).toBe(true);
  });

  it("ja has subtitles=true", () => {
    expect(LANG_FEATURES.ja.subtitles).toBe(true);
  });

  it("all languages have translate=true", () => {
    for (const [code, feat] of Object.entries(LANG_FEATURES)) {
      expect(feat.translate).toBe(true);
    }
  });

  it("only en has enrich=true", () => {
    for (const [code, feat] of Object.entries(LANG_FEATURES)) {
      if (code === "en") {
        expect(feat.enrich).toBe(true);
      } else {
        expect(feat.enrich).toBe(false);
      }
    }
  });

  it("non-EN languages have voice=false", () => {
    for (const [code, feat] of Object.entries(LANG_FEATURES)) {
      if (code !== "en") {
        expect(feat.voice).toBe(false);
      }
    }
  });

  it("LANG_FEATURES covers all codes in LANGUAGES", () => {
    for (const lang of LANGUAGES) {
      expect(LANG_FEATURES[lang.code]).toBeDefined();
    }
  });

  it("LANGUAGES has 17 entries", () => {
    expect(LANGUAGES.length).toBe(17);
  });

  it("each LANGUAGE has code, label, flag, name", () => {
    for (const lang of LANGUAGES) {
      expect(lang.code).toBeTruthy();
      expect(lang.label).toBeTruthy();
      expect(lang.flag).toBeTruthy();
      expect(lang.name).toBeTruthy();
    }
  });
});

describe("Storage round-trip", () => {
  beforeEach(async () => { await loadStore(); });

  it("data round-trips through chrome.storage.local", () => {
    const { result } = renderHook(() => useCards());
    act(() => {
      result.current.add({
        original: "round-trip", translation: "x",
        sourceLang: "en", targetLang: "ru", deckId: null,
      });
    });
    return new Promise<void>((resolve) => {
      chrome.storage.local.get("wc2:cards", (data: any) => {
        const cards = data["wc2:cards"];
        expect(cards).toBeTruthy();
        expect(cards.some((c: any) => c.original === "round-trip")).toBe(true);
        const card = cards.find((c: any) => c.original === "round-trip");
        expect(card.translation).toBe("x");
        expect(card.sourceLang).toBe("en");
        expect(card.srs).toBeTruthy();
        expect(card.tags).toEqual([]);
        resolve();
      });
    });
  });

  it("categories persist to chrome.storage.local", () => {
    return new Promise<void>((resolve) => {
      chrome.storage.local.get("wc2:categories", (data: any) => {
        const cats = data["wc2:categories"];
        expect(cats).toBeTruthy();
        expect(cats.length).toBeGreaterThan(0);
        expect(cats[0].id).toBeTruthy();
        expect(cats[0].name).toBeTruthy();
        resolve();
      });
    });
  });

  it("decks persist to chrome.storage.local", () => {
    return new Promise<void>((resolve) => {
      chrome.storage.local.get("wc2:decks", (data: any) => {
        const decks = data["wc2:decks"];
        expect(decks).toBeTruthy();
        expect(decks.length).toBeGreaterThan(0);
        resolve();
      });
    });
  });

  it("onChanged triggers re-read of data", async () => {
    const { result } = renderHook(() => useCards());
    const countBefore = result.current.cards.length;

    const newCard = {
      id: "ext-1", original: "external", translation: "внешний",
      tags: [], deckId: null, sourceLang: "en" as const, targetLang: "ru" as const,
      notes: "", links: [], contexts: [],
      srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null },
      createdAt: new Date().toISOString(),
    };

    await new Promise<void>((resolve) => {
      chrome.storage.local.get("wc2:cards", (data: any) => {
        const cards = data["wc2:cards"] || [];
        chrome.storage.local.set({ "wc2:cards": [...cards, newCard] }, () => {
          resolve();
        });
      });
    });

    await vi.waitFor(() => {
      expect(result.current.cards.length).toBe(countBefore + 1);
      expect(result.current.cards.some((c: any) => c.id === "ext-1")).toBe(true);
    });
  });
});
