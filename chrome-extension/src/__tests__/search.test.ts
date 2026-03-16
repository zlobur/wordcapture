import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import type { Card } from "@/shared/types";

const defaultSrs = () => ({ interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null });

function makeCard(overrides: Partial<Card> = {}): Card {
  return {
    id: Math.random().toString(36).slice(2, 10),
    original: "test",
    translation: "тест",
    tags: [],
    deckId: null,
    sourceLang: "en",
    targetLang: "ru",
    notes: "",
    links: [],
    contexts: [],
    srs: defaultSrs(),
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("Search (useCardSearch)", () => {
  it("matches by original field", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [
      makeCard({ original: "sustainable", translation: "устойчивый" }),
      makeCard({ original: "leverage", translation: "рычаг" }),
    ];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("sust"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].original).toBe("sustainable");
    });
  });

  it("matches by translation field", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [
      makeCard({ original: "sustainable", translation: "устойчивый" }),
      makeCard({ original: "leverage", translation: "рычаг" }),
    ];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("рычаг"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].original).toBe("leverage");
    });
  });

  it("matches by tags", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [
      makeCard({ original: "a", tags: ["business", "finance"] }),
      makeCard({ original: "b", tags: ["travel"] }),
    ];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("finance"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].original).toBe("a");
    });
  });

  it("matches by definition", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [
      makeCard({ original: "feasible", definition: "possible and practical to do" }),
      makeCard({ original: "leverage", definition: "use to maximum advantage" }),
    ];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("practical"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(1);
      expect(result.current.filtered[0].original).toBe("feasible");
    });
  });

  it("matches by notes", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [
      makeCard({ original: "a", notes: "important concept" }),
      makeCard({ original: "b", notes: "" }),
    ];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("important"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(1);
    });
  });

  it("is case-insensitive", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [makeCard({ original: "Sustainable" })];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("SUSTAINABLE"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(1);
    });
  });

  it("empty search returns all cards", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [makeCard(), makeCard(), makeCard()];

    const { result } = renderHook(() => useCardSearch(cards));
    expect(result.current.filtered.length).toBe(3);
    expect(result.current.matchCount).toBeNull();
  });

  it("no results returns empty array with matchCount=0", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [makeCard({ original: "hello" })];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("zzzznonexistent"); });

    await vi.waitFor(() => {
      expect(result.current.filtered.length).toBe(0);
      expect(result.current.matchCount).toBe(0);
    });
  });

  it("reports matchCount when query is active", async () => {
    const { useCardSearch } = await import("@/popup/components/shared/SearchInput");
    const cards = [
      makeCard({ original: "cat" }),
      makeCard({ original: "category" }),
      makeCard({ original: "dog" }),
    ];

    const { result } = renderHook(() => useCardSearch(cards));
    act(() => { result.current.setQuery("cat"); });

    await vi.waitFor(() => {
      expect(result.current.matchCount).toBe(2);
    });
  });
});
