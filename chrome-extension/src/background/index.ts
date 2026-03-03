const API_BASE = "https://wordcapture.app.zlobur.com";
const CARD_STORAGE_KEY = "wc:cardStore";
const PENDING_INBOX_KEY = "wc2:pendingInbox";

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("extensionId", (data) => {
    if (!data.extensionId) {
      chrome.storage.local.set({ extensionId: crypto.randomUUID() });
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

interface CardStoreData {
  boxes: Array<{ id: string; name: string; createdAt: string }>;
  folders: Array<{ id: string; name: string; boxId: string; createdAt: string }>;
  decks: Array<{ id: string; name: string; folderId: string; cards: Array<Record<string, unknown>>; createdAt: string }>;
}

async function saveCardLocally(original: string, translation: string, sourceLang: string, targetLang: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(CARD_STORAGE_KEY, (data) => {
      const store: CardStoreData = data[CARD_STORAGE_KEY] || {
        boxes: [{ id: "unsorted-box", name: "My Words", createdAt: new Date().toISOString() }],
        folders: [{ id: "unsorted-folder", name: "General", boxId: "unsorted-box", createdAt: new Date().toISOString() }],
        decks: [{ id: "unsorted", name: "Unsorted", folderId: "unsorted-folder", cards: [], createdAt: new Date().toISOString() }],
      };

      let unsortedDeck = store.decks.find((d) => d.id === "unsorted");
      if (!unsortedDeck) {
        unsortedDeck = { id: "unsorted", name: "Unsorted", folderId: "unsorted-folder", cards: [], createdAt: new Date().toISOString() };
        store.decks.push(unsortedDeck);
      }

      unsortedDeck.cards.unshift({
        id: uid(),
        word: original,
        translation: translation,
        transcription: "",
        fromLang: sourceLang || "en",
        toLang: targetLang || "ru",
        createdAt: new Date().toISOString(),
      });

      chrome.storage.local.set({ [CARD_STORAGE_KEY]: store }, resolve);
    });
  });
}

/** Bridge: also push to wc2 pending inbox for the new popup to pick up */
async function pushToPendingInbox(
  original: string,
  translation: string,
  sourceLang: string,
  targetLang: string,
  sourceUrl?: string
): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(PENDING_INBOX_KEY, (data) => {
      const pending: Array<Record<string, unknown>> = data[PENDING_INBOX_KEY] || [];
      pending.push({
        id: uid(),
        original,
        translation,
        sourceLang: sourceLang || "en",
        targetLang: targetLang || "ru",
        sourceUrl: sourceUrl || "",
        sourceDomain: sourceUrl ? new URL(sourceUrl).hostname : "",
        createdAt: new Date().toISOString(),
      });
      chrome.storage.local.set({ [PENDING_INBOX_KEY]: pending }, resolve);
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

    Promise.all([
      saveCardLocally(request.original, request.translation, sourceLang, targetLang),
      pushToPendingInbox(request.original, request.translation, sourceLang, targetLang, request.sourceUrl),
    ])
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

  // Bridge: popup requests to clear pending inbox after import
  if (request.type === "clearPendingInbox") {
    chrome.storage.local.set({ [PENDING_INBOX_KEY]: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // Bridge: popup requests pending inbox cards
  if (request.type === "getPendingInbox") {
    chrome.storage.local.get(PENDING_INBOX_KEY, (data) => {
      sendResponse({ success: true, cards: data[PENDING_INBOX_KEY] || [] });
    });
    return true;
  }
});
