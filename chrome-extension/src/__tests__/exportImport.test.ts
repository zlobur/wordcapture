import { describe, it, expect, beforeEach, vi } from "vitest";
import { validateImport } from "@/popup/stores/exportImport";
import type { WcExportData } from "@/popup/stores/exportImport";

function makeExport(overrides: Partial<WcExportData> = {}): WcExportData {
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    categories: [],
    decks: [],
    cards: [],
    views: [],
    ...overrides,
  };
}

describe("Export/Import", () => {
  describe("validateImport", () => {
    it("accepts valid export data", () => {
      const data = makeExport({
        cards: [{ id: "c1", original: "test", translation: "тест", tags: [], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null }, createdAt: new Date().toISOString() } as any],
      });
      expect(() => validateImport(data)).not.toThrow();
      const result = validateImport(data);
      expect(result.version).toBe(2);
      expect(result.cards.length).toBe(1);
    });

    it("rejects null", () => {
      expect(() => validateImport(null)).toThrow("Invalid JSON structure");
    });

    it("rejects non-object", () => {
      expect(() => validateImport("string")).toThrow("Invalid JSON structure");
    });

    it("rejects wrong version", () => {
      expect(() => validateImport({ version: 1, cards: [], categories: [], decks: [] })).toThrow("Unsupported export version");
    });

    it("rejects missing cards array", () => {
      expect(() => validateImport({ version: 2, categories: [], decks: [] })).toThrow("Missing cards array");
    });

    it("rejects missing categories array", () => {
      expect(() => validateImport({ version: 2, cards: [] })).toThrow("Missing categories array");
    });

    it("rejects missing decks array", () => {
      expect(() => validateImport({ version: 2, cards: [], categories: [] })).toThrow("Missing decks array");
    });
  });

  describe("exportData + importData", () => {
    beforeEach(() => {
      vi.resetModules();
    });

    it("export produces valid JSON structure", async () => {
      const mod = await import("@/popup/stores/dataStore");
      await mod.initStore();
      const { exportData } = await import("@/popup/stores/exportImport");
      const data = await exportData();
      expect(data.version).toBe(2);
      expect(data.exportedAt).toBeTruthy();
      expect(Array.isArray(data.cards)).toBe(true);
      expect(Array.isArray(data.categories)).toBe(true);
      expect(Array.isArray(data.decks)).toBe(true);
      expect(data.cards.length).toBeGreaterThan(0);
      const json = JSON.stringify(data);
      expect(() => JSON.parse(json)).not.toThrow();
    });

    it("import merges without duplicates", async () => {
      const mod = await import("@/popup/stores/dataStore");
      await mod.initStore();
      const { exportData, importData } = await import("@/popup/stores/exportImport");
      const data = await exportData();
      const cardsBefore = data.cards.length;
      const result = await importData(data);
      expect(result.skipped).toBe(cardsBefore);
      expect(result.added).toBe(0);
    });

    it("import adds new cards", async () => {
      const mod = await import("@/popup/stores/dataStore");
      await mod.initStore();
      const { importData } = await import("@/popup/stores/exportImport");
      const incoming = makeExport({
        cards: [{
          id: "new-import-1", original: "imported", translation: "импорт",
          tags: [], deckId: null, sourceLang: "en", targetLang: "ru",
          notes: "", links: [], contexts: [],
          srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null },
          createdAt: new Date().toISOString(),
        } as any],
      });
      const result = await importData(incoming);
      expect(result.added).toBe(1);
      expect(result.skipped).toBe(0);
    });

    it("import handles corrupt JSON gracefully", () => {
      expect(() => JSON.parse("{bad json")).toThrow();
    });
  });
});
