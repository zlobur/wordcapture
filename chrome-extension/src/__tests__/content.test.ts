import { describe, it, expect } from "vitest";
import { detectScript, detectLangSimple, resolveDirection, escapeHtml } from "@/content/utils";
import type { LangSettings } from "@/content/utils";

describe("detectScript", () => {
  it("detects Latin script", () => {
    expect(detectScript("hello world")).toBe("latin");
    expect(detectScript("sustainable")).toBe("latin");
  });

  it("detects Cyrillic script", () => {
    expect(detectScript("привет мир")).toBe("cyrillic");
    expect(detectScript("устойчивый")).toBe("cyrillic");
  });

  it("detects CJK script (Japanese)", () => {
    expect(detectScript("東京タワー")).toBe("cjk");
    expect(detectScript("おはよう")).toBe("cjk");
  });

  it("detects CJK script (Chinese)", () => {
    expect(detectScript("你好世界")).toBe("cjk");
  });

  it("detects Arabic script", () => {
    expect(detectScript("مرحبا بالعالم")).toBe("arabic");
    expect(detectScript("كتاب")).toBe("arabic");
  });

  it("returns latin for empty string", () => {
    expect(detectScript("")).toBe("latin");
  });

  it("returns latin for numbers/punctuation only", () => {
    expect(detectScript("123!@#")).toBe("latin");
  });

  it("handles mixed scripts — majority wins", () => {
    expect(detectScript("hello привет мир тест")).toBe("cyrillic");
    expect(detectScript("hello world test привет")).toBe("latin");
  });
});

describe("detectLangSimple", () => {
  it("maps Cyrillic to ru", () => {
    expect(detectLangSimple("привет")).toBe("ru");
  });

  it("maps CJK to ja", () => {
    expect(detectLangSimple("東京")).toBe("ja");
  });

  it("maps Arabic to ar", () => {
    expect(detectLangSimple("كتاب")).toBe("ar");
  });

  it("maps Latin to en", () => {
    expect(detectLangSimple("hello")).toBe("en");
  });

  it("returns en for empty string", () => {
    expect(detectLangSimple("")).toBe("en");
  });
});

describe("resolveDirection", () => {
  const defaults: LangSettings = {
    activeLang: "en",
    targetLang: "ru",
    defaultFromLang: "en",
    defaultToLang: "ru",
  };

  it("English text with en→ru settings: from=en, to=ru", () => {
    expect(resolveDirection("hello", defaults)).toEqual({ from: "en", to: "ru" });
  });

  it("Cyrillic text with en→ru settings: swaps to from=ru, to=en", () => {
    expect(resolveDirection("привет", defaults)).toEqual({ from: "ru", to: "en" });
  });

  it("Japanese text with en→ru settings: from=ja, to=ru", () => {
    expect(resolveDirection("東京", defaults)).toEqual({ from: "ja", to: "ru" });
  });

  it("Arabic text with en→ru settings: from=ar, to=ru", () => {
    expect(resolveDirection("كتاب", defaults)).toEqual({ from: "ar", to: "ru" });
  });

  it("detected lang matches target, swaps direction", () => {
    const settings: LangSettings = { activeLang: "de", targetLang: "en", defaultFromLang: "de", defaultToLang: "en" };
    expect(resolveDirection("hello", settings)).toEqual({ from: "en", to: "de" });
  });

  it("detected lang equals to — falls back to defaultToLang", () => {
    const settings: LangSettings = { activeLang: "en", targetLang: "en", defaultFromLang: "en", defaultToLang: "ru" };
    expect(resolveDirection("привет", settings)).toEqual({ from: "ru", to: "en" });
  });

  it("from === to after detection — uses defaultToLang", () => {
    const settings: LangSettings = { activeLang: "en", targetLang: "ja", defaultFromLang: "en", defaultToLang: "ru" };
    const result = resolveDirection("كتاب", settings);
    expect(result.from).toBe("ar");
    expect(result.from).not.toBe(result.to);
  });
});

describe("escapeHtml", () => {
  it("escapes angle brackets", () => {
    expect(escapeHtml("<script>alert(1)</script>")).not.toContain("<script>");
    expect(escapeHtml("<b>bold</b>")).toContain("&lt;b&gt;");
  });

  it("escapes ampersand", () => {
    expect(escapeHtml("a & b")).toContain("&amp;");
  });

  it("preserves quotes (innerHTML does not escape quotes in text nodes)", () => {
    const result = escapeHtml('say "hello"');
    expect(result).toBe('say "hello"');
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("hello world")).toBe("hello world");
  });

  it("handles empty string", () => {
    expect(escapeHtml("")).toBe("");
  });
});
