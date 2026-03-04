import { describe, it, expect } from "vitest";
import { computeNextReview, previewIntervals, formatInterval } from "@/shared/srs";
import type { SrsData } from "@/shared/types";

const freshSrs: SrsData = {
  interval: 1,
  easeFactor: 2.5,
  repetitions: 0,
  nextReviewAt: null,
  lastReviewedAt: null,
};

describe("SRS algorithm", () => {
  describe("computeNextReview", () => {
    it("Again (0) resets repetitions and sets 1-day interval", () => {
      const result = computeNextReview(freshSrs, 0);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
      expect(result.lastReviewedAt).toBeTruthy();
      expect(result.nextReviewAt).toBeTruthy();
    });

    it("Hard (1) also resets (quality=2 < 3)", () => {
      const result = computeNextReview(freshSrs, 1);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(0);
    });

    it("Good (2) on first review sets interval=1, repetitions=1", () => {
      const result = computeNextReview(freshSrs, 2);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it("Easy (3) on first review sets interval=1, repetitions=1", () => {
      const result = computeNextReview(freshSrs, 3);
      expect(result.interval).toBe(1);
      expect(result.repetitions).toBe(1);
    });

    it("Good on second review sets interval=6", () => {
      const afterFirst = computeNextReview(freshSrs, 2);
      const afterSecond = computeNextReview(afterFirst, 2);
      expect(afterSecond.interval).toBe(6);
      expect(afterSecond.repetitions).toBe(2);
    });

    it("Good on third review multiplies by easeFactor", () => {
      const r1 = computeNextReview(freshSrs, 2);
      const r2 = computeNextReview(r1, 2);
      const r3 = computeNextReview(r2, 2);
      expect(r3.interval).toBeGreaterThan(6);
      expect(r3.repetitions).toBe(3);
    });

    it("Again after multiple goods resets to 1", () => {
      const r1 = computeNextReview(freshSrs, 2);
      const r2 = computeNextReview(r1, 2);
      const r3 = computeNextReview(r2, 2);
      const reset = computeNextReview(r3, 0);
      expect(reset.interval).toBe(1);
      expect(reset.repetitions).toBe(0);
    });

    it("easeFactor decreases on Again, never below 1.3", () => {
      let srs = { ...freshSrs };
      for (let i = 0; i < 20; i++) {
        srs = computeNextReview(srs, 0);
      }
      expect(srs.easeFactor).toBe(1.3);
    });

    it("interval never exceeds 365", () => {
      let srs: SrsData = { ...freshSrs, interval: 300, easeFactor: 2.5, repetitions: 10 };
      const result = computeNextReview(srs, 3);
      expect(result.interval).toBeLessThanOrEqual(365);
    });

    it("nextReviewAt is in the future", () => {
      const result = computeNextReview(freshSrs, 2);
      const next = new Date(result.nextReviewAt!);
      expect(next.getTime()).toBeGreaterThan(Date.now());
    });

    it("Easy increases easeFactor", () => {
      const result = computeNextReview(freshSrs, 3);
      expect(result.easeFactor).toBeGreaterThan(freshSrs.easeFactor);
    });
  });

  describe("previewIntervals", () => {
    it("returns 4 previews for each rating", () => {
      const previews = previewIntervals(freshSrs);
      expect(previews.length).toBe(4);
      expect(previews[0].rating).toBe(0);
      expect(previews[3].rating).toBe(3);
    });

    it("each preview has label string", () => {
      const previews = previewIntervals(freshSrs);
      previews.forEach((p: any) => expect(typeof p.label).toBe("string"));
    });

    it("Again always shows 1d", () => {
      const previews = previewIntervals(freshSrs);
      expect(previews[0].interval).toBe(1);
      expect(previews[0].label).toBe("1d");
    });
  });

  describe("formatInterval", () => {
    it("formats days", () => {
      expect(formatInterval(0)).toBe("now");
      expect(formatInterval(1)).toBe("1d");
      expect(formatInterval(5)).toBe("5d");
    });

    it("formats weeks", () => {
      expect(formatInterval(7)).toBe("1w");
      expect(formatInterval(14)).toBe("2w");
    });

    it("formats months", () => {
      expect(formatInterval(30)).toBe("1mo");
      expect(formatInterval(90)).toBe("3mo");
    });

    it("formats years", () => {
      expect(formatInterval(365)).toBe("1y");
    });
  });
});
