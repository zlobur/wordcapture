import { useState, useCallback } from "react";

export type LayerType = "batch" | "categoryDecks" | "categorySettings" | "deckCards" | "cardDetail" | "viewDetail";

export interface LayerEntry {
  type: LayerType;
  data: any;
}

export function useLayerStack() {
  const [layers, setLayers] = useState<LayerEntry[]>([]);

  const push = useCallback((type: LayerType, data?: any) => {
    setLayers((prev) => [...prev, { type, data }]);
  }, []);

  const pop = useCallback(() => {
    setLayers((prev) => prev.slice(0, -1));
  }, []);

  const clear = useCallback(() => {
    setLayers([]);
  }, []);

  return { layers, push, pop, clear };
}
