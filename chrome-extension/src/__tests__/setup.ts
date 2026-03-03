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
(globalThis as any).chrome = {
  storage: { local: {
    get: (key: string, cb: (data: Record<string, unknown>) => void) => { cb({ [key]: mockChromeStorage[key] }); },
    set: (data: Record<string, unknown>, cb?: () => void) => { Object.assign(mockChromeStorage, data); cb?.(); },
    onChanged: { addListener: () => {}, removeListener: () => {} },
  }},
  runtime: {
    sendMessage: (_msg: unknown, cb?: (response: unknown) => void) => { cb?.({ success: true, cards: [] }); },
    lastError: null,
  },
};

beforeEach(() => {
  mockLocalStorage.clear();
  for (const key of Object.keys(mockChromeStorage)) delete mockChromeStorage[key];
});
