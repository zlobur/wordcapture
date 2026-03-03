import type { UserSettings } from "./types";
import { DEFAULT_SETTINGS } from "./constants";

/**
 * Typed wrapper around chrome.storage.local.
 * Falls back to localStorage for development outside extension context.
 */
const isExtension = typeof chrome !== "undefined" && !!chrome?.storage?.local;

function get<T>(key: string, fallback: T): Promise<T> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (data) => {
        resolve(data[key] ?? fallback);
      });
    });
  }
  // Dev fallback
  const val = localStorage.getItem(`wc:${key}`);
  return Promise.resolve(val ? JSON.parse(val) : fallback);
}

function set(key: string, value: unknown): Promise<void> {
  if (isExtension) {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, resolve);
    });
  }
  localStorage.setItem(`wc:${key}`, JSON.stringify(value));
  return Promise.resolve();
}

export const storage = {
  /** Get or generate persistent extension GUID */
  async getExtensionId(): Promise<string> {
    let id = await get<string | null>("extensionId", null);
    if (!id) {
      id = crypto.randomUUID();
      await set("extensionId", id);
    }
    return id;
  },

  /** Reset extension ID (unlink Telegram) */
  async resetExtensionId(): Promise<string> {
    const id = crypto.randomUUID();
    await set("extensionId", id);
    return id;
  },

  /** Get user settings (merged with defaults) */
  async getSettings(): Promise<UserSettings> {
    const saved = await get<Partial<UserSettings>>("settings", {});
    return { ...DEFAULT_SETTINGS, ...saved };
  },

  /** Patch user settings (partial update) */
  async updateSettings(patch: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...patch };
    await set("settings", updated);
    return updated;
  },

  /** Listen for storage changes */
  onChanged(callback: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void) {
    if (isExtension) {
      chrome.storage.local.onChanged.addListener(callback);
      return () => chrome.storage.local.onChanged.removeListener(callback);
    }
    return () => {};
  },
};
