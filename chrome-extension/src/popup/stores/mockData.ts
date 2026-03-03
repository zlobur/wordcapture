import type { Category, Deck, Card, SavedView } from "@/shared/types";

function uid(): string {
  return crypto.randomUUID().slice(0, 8);
}

export const MOCK_CATEGORIES: Category[] = [
  { id: "cat-en", name: "English", color: "#38a3ed", type: "language", sourceLang: "en", targetLang: "ru" },
  { id: "cat-de", name: "Deutsch", color: "#ffcc00", type: "language", sourceLang: "de", targetLang: "ru" },
  { id: "cat-cs", name: "CS", color: "#a78bfa", type: "concept" },
  { id: "cat-grammar", name: "Grammar", color: "#fb923c", type: "concept" },
];

export const MOCK_DECKS: Deck[] = [
  { id: "d1", name: "Lesson Feb 28", categoryId: "cat-en" },
  { id: "d2", name: "Travel", categoryId: "cat-en" },
  { id: "d3", name: "Business", categoryId: "cat-en" },
  { id: "d8", name: "Grundwortschatz", categoryId: "cat-de" },
  { id: "d4", name: ".NET GC", categoryId: "cat-cs" },
  { id: "d5", name: "Async/Await", categoryId: "cat-cs" },
  { id: "d6", name: "Prepositions", categoryId: "cat-grammar" },
  { id: "d7", name: "Tenses", categoryId: "cat-grammar" },
];

const now = () => new Date().toISOString();
const defaultSrs = () => ({ interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: null, lastReviewedAt: null });

export const MOCK_CARDS: Card[] = [
  { id: "i1", original: "sustainable", translation: "устойчивый", definition: "able to be maintained at a certain rate", transcription: "/səˈsteɪnəbl/", cefr: "B2", partOfSpeech: "adj", tags: ["intermediate"], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "i2", original: "leverage", translation: "рычаг", definition: "use something to maximum advantage", transcription: "/ˈlevərɪdʒ/", cefr: "B2", partOfSpeech: "noun", tags: ["business"], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "i3", original: "ambiguous", translation: "двусмысленный", definition: "open to more than one interpretation", transcription: "/æmˈbɪɡjuəs/", cefr: "B2", partOfSpeech: "adj", tags: ["intermediate"], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "i4", original: "Zusammenarbeit", translation: "сотрудничество", definition: "Kooperation, gemeinsames Arbeiten", transcription: "/tsuˈzamənˌʔaʁbaɪt/", cefr: "B1", partOfSpeech: "noun", tags: [], deckId: null, sourceLang: "de", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "i5", original: "feasible", translation: "осуществимый", definition: "possible and practical to do easily", transcription: "/ˈfiːzəbl/", cefr: "B2", partOfSpeech: "adj", tags: ["intermediate"], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "i6", original: "Deadlock", translation: "Взаимная блокировка", definition: "Two or more threads waiting on each other indefinitely", cefr: undefined, partOfSpeech: "concept", tags: ["dotnet", "concurrency"], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "i7", original: "elaborate", translation: "подробный", definition: "involving careful and detailed work", transcription: "/ɪˈlæbərət/", cefr: "B2", partOfSpeech: "adj", tags: ["intermediate"], deckId: null, sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },

  { id: "c1", original: "despite", translation: "несмотря на", definition: "without being affected by", transcription: "/dɪˈspaɪt/", cefr: "B1", partOfSpeech: "prep", tags: ["intermediate", "preposition"], deckId: "d1", sourceLang: "en", targetLang: "ru", notes: "Despite + noun/gerund.", links: [], contexts: [{ sentence: "Despite the rain, we went hiking.", source: "bbc.com" }], srs: { interval: 3, easeFactor: 2.5, repetitions: 3, nextReviewAt: new Date(Date.now() + 86400000).toISOString(), lastReviewedAt: now() }, createdAt: now() },
  { id: "c2", original: "mortgage", translation: "ипотека", definition: "a loan secured against property", transcription: "/ˈmɔːɡɪdʒ/", cefr: "B2", partOfSpeech: "noun", tags: ["business", "finance"], deckId: "d1", sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },
  { id: "c3", original: "reluctant", translation: "неохотный", definition: "unwilling and hesitant", transcription: "/rɪˈlʌktənt/", cefr: "B2", partOfSpeech: "adj", tags: ["intermediate"], deckId: "d1", sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: { interval: 2, easeFactor: 2.5, repetitions: 1, nextReviewAt: new Date(Date.now() + 172800000).toISOString(), lastReviewedAt: now() }, createdAt: now() },
  { id: "c10", original: "itinerary", translation: "маршрут", definition: "a planned route or journey", transcription: "/aɪˈtɪnərəri/", cefr: "B2", partOfSpeech: "noun", tags: ["travel"], deckId: "d2", sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: now(), lastReviewedAt: null }, createdAt: now() },
  { id: "c11", original: "accommodation", translation: "жильё", definition: "a place to stay", transcription: "/əˌkɒməˈdeɪʃn/", cefr: "B1", partOfSpeech: "noun", tags: ["travel"], deckId: "d2", sourceLang: "en", targetLang: "ru", notes: "", links: [], contexts: [], srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: now(), lastReviewedAt: null }, createdAt: now() },

  { id: "c6", original: "Gemütlichkeit", translation: "уютность", definition: "Zustand der Behaglichkeit", transcription: "/ɡəˈmyːtlɪçkaɪt/", cefr: "B1", partOfSpeech: "noun", tags: ["culture"], deckId: "d8", sourceLang: "de", targetLang: "ru", notes: "Untranslatable concept.", links: [], contexts: [], srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: now(), lastReviewedAt: null }, createdAt: now() },
  { id: "c7", original: "Arbeitszeugnis", translation: "рабочая характеристика", definition: "Schriftliche Beurteilung eines Arbeitnehmers", transcription: "/ˈaʁbaɪtsˌtsɔʏɡnɪs/", cefr: "B2", partOfSpeech: "noun", tags: ["business"], deckId: "d8", sourceLang: "de", targetLang: "ru", notes: "", links: [], contexts: [], srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: now(), lastReviewedAt: null }, createdAt: now() },

  { id: "c4", original: "GC Collect", translation: "Сборка мусора", definition: "Forces garbage collection of all generations", cefr: undefined, partOfSpeech: "concept", tags: ["dotnet", "memory"], deckId: "d4", sourceLang: "en", targetLang: "ru", notes: "Gen0→Gen1→Gen2. Avoid GC.Collect() in production.", links: [{ url: "https://docs.microsoft.com/en-us/dotnet/standard/garbage-collection/", title: "MS Docs GC" }], contexts: [{ sentence: "Avoid GC.Collect() in prod code.", source: "docs.microsoft.com" }], srs: { interval: 5, easeFactor: 2.2, repetitions: 5, nextReviewAt: new Date(Date.now() + 86400000).toISOString(), lastReviewedAt: now() }, createdAt: now() },
  { id: "c5", original: "Thread Pool Starvation", translation: "Истощение пула потоков", definition: "All thread pool threads are blocked, preventing new work items from executing", cefr: undefined, partOfSpeech: "concept", tags: ["dotnet", "async"], deckId: "d5", sourceLang: "en", targetLang: "ru", notes: "Use async/await properly to avoid blocking.", links: [], contexts: [], srs: { interval: 3, easeFactor: 2.5, repetitions: 2, nextReviewAt: new Date(Date.now() + 259200000).toISOString(), lastReviewedAt: now() }, createdAt: now() },
  { id: "c8", original: "ConfigureAwait(false)", translation: "Не захватывать контекст", definition: "Prevents capturing synchronization context on await continuation", cefr: undefined, partOfSpeech: "concept", tags: ["dotnet", "async"], deckId: "d5", sourceLang: "en", targetLang: "ru", notes: "Use in library code, not in UI code.", links: [], contexts: [], srs: defaultSrs(), createdAt: now() },

  { id: "c20", original: "despite / in spite of", translation: "несмотря на", definition: "Prepositions followed by noun/gerund, NOT by clause", cefr: "B1", partOfSpeech: "rule", tags: ["preposition"], deckId: "d6", sourceLang: "en", targetLang: "ru", notes: "Despite + noun. Although + clause.", links: [], contexts: [{ sentence: "Despite being tired, she continued.", source: "grammar-book" }], srs: { interval: 2, easeFactor: 2.5, repetitions: 1, nextReviewAt: now(), lastReviewedAt: now() }, createdAt: now() },

  { id: "c30", original: "Present Perfect vs Past Simple", translation: "Настоящее совершённое vs простое прошедшее", definition: "Present Perfect: unfinished time / result now. Past Simple: finished time.", cefr: "B1", partOfSpeech: "rule", tags: ["tense", "grammar"], deckId: "d7", sourceLang: "en", targetLang: "ru", notes: "I have been (still there) vs I was (no longer).", links: [], contexts: [], srs: { interval: 1, easeFactor: 2.5, repetitions: 0, nextReviewAt: now(), lastReviewedAt: null }, createdAt: now() },
];

export const MOCK_VIEWS: SavedView[] = [
  { id: "v1", name: "Hard words", rules: [{ field: "reviews", op: ">", value: "5" }] },
  { id: "v2", name: "B1-B2 Verbs", rules: [{ field: "cefr", op: "in", value: "B1, B2" }, { field: "tag", op: "=", value: "verb" }] },
  { id: "v3", name: "Async all", rules: [{ field: "tag", op: "=", value: "async" }] },
];

export function generateId(): string {
  return uid();
}
