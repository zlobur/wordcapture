import { describe, it, expect } from "vitest";
import { resolvePopupDirection } from "@/shared/langResolve";

describe("Translation auto-detect logic", () => {
  it("types Russian text with EN→RU direction → swaps to RU→EN", () => {
    const result = resolvePopupDirection("хлеб", "en", "ru");
    expect(result).toEqual({ from: "ru", to: "en", changed: true });
  });

  it("types English text with EN→RU direction → no swap", () => {
    const result = resolvePopupDirection("the international", "en", "ru");
    expect(result).toEqual({ from: "en", to: "ru", changed: false });
  });

  it("types German text with EN→RU direction → changes to DE→RU", () => {
    const result = resolvePopupDirection("Straße", "en", "ru");
    expect(result).toEqual({ from: "de", to: "ru", changed: true });
  });

  it("types Arabic text with EN→RU direction → changes to AR→RU", () => {
    const result = resolvePopupDirection("كتاب", "en", "ru");
    expect(result).toEqual({ from: "ar", to: "ru", changed: true });
  });

  it("types English text with RU→EN direction → swaps to EN→RU", () => {
    const result = resolvePopupDirection("the international", "ru", "en");
    expect(result).toEqual({ from: "en", to: "ru", changed: true });
  });

  it("types text matching langFrom → no change", () => {
    const result = resolvePopupDirection("привет", "ru", "en");
    expect(result).toEqual({ from: "ru", to: "en", changed: false });
  });

  it("empty text → no detection, keeps current direction", () => {
    const result = resolvePopupDirection("", "en", "ru");
    expect(result).toEqual({ from: "en", to: "ru", changed: false });
  });

  it("whitespace only → no detection, keeps current direction", () => {
    const result = resolvePopupDirection("   ", "en", "ru");
    expect(result).toEqual({ from: "en", to: "ru", changed: false });
  });

  it("auto as langFrom → skips detection, keeps direction", () => {
    const result = resolvePopupDirection("привет", "auto", "ru");
    expect(result).toEqual({ from: "auto", to: "ru", changed: false });
  });
});
