import { useState, useEffect } from "react";
import { theme as t } from "@/shared/theme";
import { useSettings } from "@/hooks/useSettings";
import { useCards, initStore, loadPopupStateAsync, savePopupState } from "@/popup/stores/dataStore";
import { useLayerStack } from "@/popup/hooks/useLayerStack";
import type { SectionId } from "@/shared/constants";
import type { LangCode, Category, Deck, Card, SavedView } from "@/shared/types";

import { SideNav } from "./components/SideNav";
import { TranslatePanel } from "./components/translate/TranslatePanel";
import { InboxPanel } from "./components/inbox/InboxPanel";
import { BatchPanel } from "./components/inbox/BatchPanel";
import { CategoriesPanel } from "./components/decks/CategoriesPanel";
import { CategoryDecksLayer } from "./components/decks/CategoryDecksLayer";
import { DeckCardsLayer } from "./components/decks/DeckCardsLayer";
import { CategorySettingsLayer } from "./components/decks/CategorySettingsLayer";
import { CardDetailLayer } from "./components/cards/CardDetailLayer";
import { ViewsPanel } from "./components/views/ViewsPanel";
import { ViewDetailLayer } from "./components/views/ViewDetailLayer";
import { ReviewPanel } from "./components/review/ReviewPanel";
import { SettingsPanel } from "./components/settings/SettingsPanel";
import { Layer } from "./components/Layer";

export function App() {
  const { settings, update: updateSettings, loading: settingsLoading } = useSettings();
  const { inbox } = useCards();
  const { layers, push, pop, clear } = useLayerStack();

  const [storeReady, setStoreReady] = useState(false);
  const [section, setSection] = useState<SectionId>("translate");
  const [langFrom, setLangFrom] = useState<LangCode>("en");
  const [langTo, setLangTo] = useState<LangCode>("ru");
  const [settingsApplied, setSettingsApplied] = useState(false);

  useEffect(() => {
    initStore()
      .then(() => loadPopupStateAsync())
      .then((saved) => {
        if (saved) {
          setSection(saved.section as SectionId);
          setLangFrom(saved.langFrom);
          setLangTo(saved.langTo);
          setSettingsApplied(true);
        }
        setStoreReady(true);
      });
  }, []);

  useEffect(() => {
    if (!settingsLoading && !settingsApplied) {
      setLangFrom(settings.defaultFromLang || settings.activeLang || "en");
      setLangTo(settings.defaultToLang || settings.targetLang || "ru");
      setSettingsApplied(true);
    }
  }, [settingsLoading, settings, settingsApplied]);

  useEffect(() => {
    if (storeReady) savePopupState(section, langFrom, langTo);
  }, [section, langFrom, langTo, storeReady]);

  if (settingsLoading || !storeReady) {
    return (
      <div style={{ width: t.popupWidth, height: t.popupHeight, background: t.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: t.fontFamily, color: t.textDim }}>Loading...</div>
    );
  }

  const handleSection = (s: SectionId) => { clear(); setSection(s); };
  const handleLangFrom = (l: LangCode) => { setLangFrom(l); updateSettings({ activeLang: l, defaultFromLang: l }); };
  const handleLangTo = (l: LangCode) => { setLangTo(l); updateSettings({ targetLang: l, defaultToLang: l }); };
  const handleSettingsUpdate = (patch: Partial<typeof settings>) => {
    const fullPatch = { ...patch };
    if (patch.defaultFromLang) { fullPatch.activeLang = patch.defaultFromLang; }
    if (patch.defaultToLang) { fullPatch.targetLang = patch.defaultToLang; }
    updateSettings(fullPatch);
    if (patch.defaultFromLang) setLangFrom(patch.defaultFromLang);
    if (patch.defaultToLang) setLangTo(patch.defaultToLang);
  };

  const renderMain = () => {
    switch (section) {
      case "translate": return <TranslatePanel langFrom={langFrom} langTo={langTo} onChangeLangFrom={handleLangFrom} onChangeLangTo={handleLangTo} />;
      case "inbox": return <InboxPanel onOpenBatch={() => push("batch")} onOpenCard={(card) => push("cardDetail", card)} />;
      case "categories": return <CategoriesPanel onSelectCategory={(cat: Category) => push("categoryDecks", cat)} onEditCategories={() => push("categorySettings")} onSelectCard={(card: Card) => push("cardDetail", card)} />;
      case "views": return <ViewsPanel onSelectView={(v: SavedView) => push("viewDetail", v)} onNewView={() => push("viewDetail", null)} />;
      case "review": return <ReviewPanel />;
      case "settings": return <SettingsPanel settings={settings} onUpdate={handleSettingsUpdate} />;
      default: return null;
    }
  };

  const renderLayers = () => layers.map((layer, i) => {
    switch (layer.type) {
      case "batch": return <Layer key={i} depth={1} edgeLabel="Inbox" onBack={pop}><BatchPanel onBack={pop} langFrom={langFrom} langTo={langTo} /></Layer>;
      case "categoryDecks": return <CategoryDecksLayer key={i} category={layer.data as Category} onSelectDeck={(d: Deck) => push("deckCards", { deck: d, category: layer.data })} onBack={pop} />;
      case "categorySettings": return <CategorySettingsLayer key={i} onBack={pop} />;
      case "deckCards": return <DeckCardsLayer key={i} deck={layer.data.deck as Deck} category={layer.data.category as Category} onSelectCard={(c: Card) => push("cardDetail", c)} onBack={pop} />;
      case "cardDetail": return <CardDetailLayer key={i} card={layer.data as Card} onBack={pop} />;
      case "viewDetail": return <ViewDetailLayer key={i} view={layer.data as SavedView | null} onBack={pop} onSelectCard={(c: Card) => push("cardDetail", c)} />;
      default: return null;
    }
  });

  return (
    <div style={{ width: t.popupWidth, height: t.popupHeight, background: t.bg, fontFamily: t.fontFamily, color: t.text, display: "flex", overflow: "hidden" }}>
      <SideNav activeSection={section} onSelect={handleSection} inboxCount={inbox.length} />
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, overflow: "auto" }}>{renderMain()}</div>
        {renderLayers()}
      </div>
    </div>
  );
}
