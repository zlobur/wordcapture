import { beforeEach } from "vitest";

const store = {} as Record<string, string>;
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = String(value); },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { for (const k of Object.keys(store)) delete store[k]; },
  get length() { return Object.keys(store).length; },
  key: (i: number) => Object.keys(store)[i] ?? null,
} as Storage;
Object.defineProperty(globalThis, "localStorage", { value: mockLocalStorage, writable: true });

const mockChromeStorage = {} as Record<string, unknown>;
const changeListeners: Array<(changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void> = [];

(globalThis as any).chrome = {
  storage: { local: {
    get: (key: string | string[], cb: (data: Record<string, unknown>) => void) => {
      if (Array.isArray(key)) {
        const result: Record<string, unknown> = {};
        for (const k of key) result[k] = mockChromeStorage[k];
        cb(result);
      } else {
        cb({ [key]: mockChromeStorage[key] });
      }
    },
    set: (data: Record<string, unknown>, cb?: () => void) => {
      const changes: Record<string, { oldValue?: unknown; newValue?: unknown }> = {};
      for (const [k, v] of Object.entries(data)) {
        changes[k] = { oldValue: mockChromeStorage[k], newValue: v };
      }
      Object.assign(mockChromeStorage, data);
      cb?.();
      changeListeners.forEach((l) => l(changes));
    },
    remove: (keys: string[], cb?: () => void) => {
      for (const k of keys) delete mockChromeStorage[k];
      cb?.();
    },
    onChanged: {
      addListener: (fn: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void) => { changeListeners.push(fn); },
      removeListener: (fn: (changes: Record<string, { oldValue?: unknown; newValue?: unknown }>) => void) => {
        const idx = changeListeners.indexOf(fn);
        if (idx >= 0) changeListeners.splice(idx, 1);
      },
    },
  }},
  runtime: {
    sendMessage: (_msg: unknown, cb?: (response: unknown) => void) => { cb?.({ success: true, cards: [] }); },
    lastError: null,
  },
};

beforeEach(() => {
  mockLocalStorage.clear();
  for (const key of Object.keys(mockChromeStorage)) delete mockChromeStorage[key];
  changeListeners.length = 0;
});
