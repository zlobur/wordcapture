import { API_BASE } from "./constants";
import { storage } from "./storage";
import type { TranslateResult, EnrichResult, Card, LangCode } from "./types";

// Use chrome.runtime.sendMessage in extension context (same path as content script)
const isExtension = typeof chrome !== "undefined" && !!chrome?.runtime?.sendMessage;

function sendMsg<T>(msg: Record<string, unknown>): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(msg, (resp: any) => {
      if (resp?.success) resolve(resp.result ?? resp);
      else reject(new Error(resp?.error || "Message failed"));
    });
  });
}

// Direct fetch fallback for dev outside extension
async function getHeaders(): Promise<Record<string, string>> {
  const id = await storage.getExtensionId();
  return { "X-Extension-Id": id, "Content-Type": "application/json" };
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const headers = await getHeaders();
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...opts.headers } });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json();
}

export const api = {
  async translate(text: string, sourceLang: LangCode = "en", targetLang: LangCode = "ru"): Promise<TranslateResult> {
    if (isExtension) {
      const result = await sendMsg<any>({ type: "translate", text, sourceLang, targetLang });
      // Background returns raw API response - normalize to { original, translation }
      const translation = typeof result === "string"
        ? result
        : (result?.translation || result?.text || result?.translatedText || String(result));
      return { original: text, translation };
    }
    return request<TranslateResult>(
      `/translate?text=${encodeURIComponent(text)}&sourceLang=${sourceLang}&targetLang=${targetLang}`,
      { method: "POST" }
    );
  },

  async enrich(word: string): Promise<EnrichResult> {
    if (isExtension) {
      return sendMsg<EnrichResult>({ type: "enrich", word });
    }
    return request<EnrichResult>(`/enrich?word=${encodeURIComponent(word)}`, { method: "POST" });
  },

  async save(original: string, translation: string, context?: string, sourceUrl?: string): Promise<void> {
    if (isExtension) {
      await sendMsg<any>({ type: "save", original, translation, context, sourceUrl });
      return;
    }
    const params = new URLSearchParams({ original, translation });
    if (context) params.set("context", context);
    if (sourceUrl) params.set("sourceUrl", sourceUrl);
    await request(`/save?${params}`, { method: "POST" });
  },

  async getCards(): Promise<Card[]> {
    if (isExtension) return sendMsg<Card[]>({ type: "getCards" });
    return request<Card[]>("/cards");
  },
};
