import type { SrsData } from "./types";

export type SrsRating = 0 | 1 | 2 | 3;

export function computeNextReview(srs: SrsData, rating: SrsRating): SrsData {
  const now = new Date();
  let { interval, easeFactor, repetitions } = srs;
  const quality = [0, 2, 4, 5][rating];

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  }

  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;
  if (interval > 365) interval = 365;

  const nextDate = new Date(now);
  nextDate.setDate(nextDate.getDate() + interval);

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
    repetitions,
    nextReviewAt: nextDate.toISOString(),
    lastReviewedAt: now.toISOString(),
  };
}

export function formatInterval(days: number): string {
  if (days === 0) return "now";
  if (days === 1) return "1d";
  if (days < 7) return days + "d";
  if (days < 30) return Math.round(days / 7) + "w";
  if (days < 365) return Math.round(days / 30) + "mo";
  return Math.round(days / 365) + "y";
}

export function previewIntervals(srs: SrsData): { rating: SrsRating; interval: number; label: string }[] {
  return ([0, 1, 2, 3] as SrsRating[]).map((rating) => {
    const next = computeNextReview(srs, rating);
    return { rating, interval: next.interval, label: formatInterval(next.interval) };
  });
}
