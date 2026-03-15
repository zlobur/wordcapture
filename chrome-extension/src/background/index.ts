import { initSentry } from "@/shared/sentry";
initSentry("background");

const API_BASE = "https://wordcapture.app.zlobur.com";
const CARDS_KEY = "wc2:cards";

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.local.get("extensionId", (data) => {
    const extensionId = data.extensionId || crypto.randomUUID();
    if (!data.extensionId) {
      chrome.storage.local.set({ extensionId });
    }
    const version = chrome.runtime.getManifest().version;
    const event = details.reason === "install" ? "install" : details.reason === "update" ? "update" : null;
    if (event) {
      fetch(`${API_BASE}/analytics/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Extension-Id": extensionId },
        body: JSON.stringify({ event, version, previousVersion: details.previousVersion || null }),
      }).catch(() => {});
    }
  });
});

async function getExtensionId(): Promise<string> {
  return new Promise((resolve) => {
    chrome.storage.local.get("extensionId", (data) => {
      resolve(data.extensionId || "unknown");
    });
  });
}

async function apiRequest(
  path: string,
  method: string = "POST"
): Promise<unknown> {
  const id = await getExtensionId();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "X-Extension-Id": id },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function uid(): string {
  return crypto.randomUUID().slice(0, 8);
}

interface CardData {
  id: string;
  original: string;
  translation: string;
  definition?: string;
  transcription?: string;
  cefr?: string;
  partOfSpeech?: string;
  tags: string[];
  deckId: string | null;
  sourceLang: string;
  targetLang: string;
  notes: string;
  links: Array<{ url: string; title: string }>;
  contexts: Array<{ sentence: string; source?: string }>;
  srs: { interval: number; easeFactor: number; repetitions: number; nextReviewAt: null; lastReviewedAt: null };
  createdAt: string;
  sourceUrl?: string;
  sourceDomain?: string;
}

async function saveCardToStore(
  original: string,
  translation: string,
  sourceLang: string,
  targetLang: string,
  sourceUrl?: string
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(CARDS_KEY, (data) => {
      const cards: CardData[] = data[CARDS_KEY] || [];
      const card: CardData = {
        id: uid(),
        original,
        translation,
        tags: [],
        deckId: null,
        sourceLang: sourceLang || "en",
        targetLang: targetLang || "ru",
        notes: "",
        links: [],
        contexts: sourceUrl
          ? [{ sentence: `Saved from ${sourceUrl ? new URL(sourceUrl).hostname : ""}`, source: sourceUrl ? new URL(sourceUrl).hostname : "" }]
          : [],
        srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null },
        createdAt: new Date().toISOString(),
        sourceUrl: sourceUrl || undefined,
        sourceDomain: sourceUrl ? new URL(sourceUrl).hostname : undefined,
      };
      cards.unshift(card);
      chrome.storage.local.set({ [CARDS_KEY]: cards }, resolve);
    });
  });
}

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "translate") {
    const params = new URLSearchParams({ text: request.word || request.text });
    if (request.sourceLang) params.set("sourceLang", request.sourceLang);
    if (request.targetLang) params.set("targetLang", request.targetLang);
    apiRequest(`/translate?${params}`)
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === "enrich") {
    const params = new URLSearchParams({ word: request.word });
    apiRequest(`/enrich?${params}`)
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === "save") {
    const sourceLang = request.sourceLang || "en";
    const targetLang = request.targetLang || "ru";

    saveCardToStore(request.original, request.translation, sourceLang, targetLang, request.sourceUrl)
      .then(() => {
        const params = new URLSearchParams({
          original: request.original,
          translation: request.translation,
        });
        if (request.context) params.set("context", request.context);
        if (request.sourceUrl) params.set("sourceUrl", request.sourceUrl);

        return apiRequest(`/save?${params}`).catch(() => {});
      })
      .then(() => sendResponse({ success: true }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }

  if (request.type === "getCards") {
    apiRequest("/cards", "GET")
      .then((result) => sendResponse({ success: true, result }))
      .catch((err) => sendResponse({ success: false, error: err.message }));
    return true;
  }
});
