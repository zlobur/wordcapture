import { useState, useEffect, useCallback } from "react";
import { storage } from "@/shared/storage";
import type { UserSettings } from "@/shared/types";
import { DEFAULT_SETTINGS } from "@/shared/constants";

export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storage.getSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });

    const unsub = storage.onChanged((changes) => {
      if (changes.settings?.newValue) {
        setSettings({ ...DEFAULT_SETTINGS, ...(changes.settings.newValue as Partial<UserSettings>) });
      }
    });
    return unsub;
  }, []);

  const update = useCallback(async (patch: Partial<UserSettings>) => {
    const updated = await storage.updateSettings(patch);
    setSettings(updated);
  }, []);

  return { settings, update, loading };
}
