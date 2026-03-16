import { describe, it, expect } from "vitest";
import { detectLanguage } from "@/shared/langDetect";

describe("detectLanguage", () => {
  it("detects Russian from cyrillic text", () => {
    expect(detectLanguage("привет мир")).toBe("ru");
    expect(detectLanguage("хлеб")).toBe("ru");
  });

  it("detects Arabic from Arabic script", () => {
    expect(detectLanguage("مرحبا")).toBe("ar");
    expect(detectLanguage("كتاب")).toBe("ar");
  });

  it("detects English from latin text", () => {
    expect(detectLanguage("the international connection")).toBe("en");
    expect(detectLanguage("sustainable development")).toBe("en");
  });

  it("detects German from text with ä/ö/ü", () => {
    expect(detectLanguage("Straße")).toBe("de");
    expect(detectLanguage("über")).toBe("de");
  });

  it("detects French from text with accented chars", () => {
    expect(detectLanguage("être château")).toBe("fr");
  });

  it("detects Japanese from CJK", () => {
    expect(detectLanguage("東京タワー")).toBe("ja");
    expect(detectLanguage("おはよう")).toBe("ja");
  });

  it("detects Korean from hangul", () => {
    expect(detectLanguage("안녕하세요")).toBe("ko");
  });

  it("detects Greek from greek chars", () => {
    expect(detectLanguage("γεια σου κόσμε")).toBe("el");
  });

  it('returns "en" for empty text', () => {
    expect(detectLanguage("")).toBe("en");
    expect(detectLanguage("   ")).toBe("en");
  });

  it("handles mixed scripts by majority", () => {
    expect(detectLanguage("hello привет мир тест")).toBe("ru");
  });
});
