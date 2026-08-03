'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  APPEARANCE_STORAGE_KEY,
  DEFAULT_APPEARANCE,
  FONT_OPTIONS,
  PATTERN_OPTIONS,
  SURFACE_OPTIONS,
  THEME_PRESETS,
  getThemePreset,
  parseStoredAppearance,
  presetCssVars,
  type AppearancePreferences,
  type BackgroundPattern,
  type FontStyle,
  type SurfaceStyle,
} from '@/lib/appearance';
import DialogAccessibility from '@/components/DialogAccessibility';

interface AppearanceContextValue {
  preferences: AppearancePreferences;
  preset: ReturnType<typeof getThemePreset>;
  presets: typeof THEME_PRESETS;
  surfaces: typeof SURFACE_OPTIONS;
  patterns: typeof PATTERN_OPTIONS;
  fonts: typeof FONT_OPTIONS;
  setPresetId: (id: string) => void;
  setSurfaceStyle: (style: SurfaceStyle) => void;
  setPattern: (pattern: BackgroundPattern) => void;
  setFontStyle: (style: FontStyle) => void;
  setReducedMotion: (enabled: boolean) => void;
  toggleColorMode: () => void;
  resetAppearance: () => void;
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

function applyAppearance(preferences: AppearancePreferences) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const preset = getThemePreset(preferences.presetId);
  Object.entries(presetCssVars(preset)).forEach(([name, value]) => root.style.setProperty(name, value));
  root.dataset.theme = preset.base;
  root.dataset.themePreset = preset.id;
  root.dataset.surface = preferences.surfaceStyle;
  root.dataset.pattern = preferences.pattern;
  root.dataset.fontStyle = preferences.fontStyle;
  root.classList.toggle('reduce-motion', preferences.reducedMotion);
}

export default function AppearanceProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<AppearancePreferences>(DEFAULT_APPEARANCE);

  useEffect(() => {
    const stored = parseStoredAppearance(localStorage.getItem(APPEARANCE_STORAGE_KEY));
    // The pre-paint bootstrap already applied this appearance to the document.
    // Syncing state after mount keeps React hydration aligned with the SSR default.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreferences(stored);
    applyAppearance(stored);
  }, []);

  const update = useCallback((recipe: (current: AppearancePreferences) => AppearancePreferences) => {
    setPreferences((current) => {
      const next = recipe(current);
      applyAppearance(next);
      try { localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(next)); } catch { /* private storage */ }
      return next;
    });
  }, []);

  const setPresetId = useCallback((id: string) => {
    const preset = THEME_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    update((current) => ({
      ...current,
      presetId: preset.id,
      ...(preset.base === 'dark' ? { lastDarkPresetId: preset.id } : { lastLightPresetId: preset.id }),
    }));
  }, [update]);

  const value = useMemo<AppearanceContextValue>(() => ({
    preferences,
    preset: getThemePreset(preferences.presetId),
    presets: THEME_PRESETS,
    surfaces: SURFACE_OPTIONS,
    patterns: PATTERN_OPTIONS,
    fonts: FONT_OPTIONS,
    setPresetId,
    setSurfaceStyle: (surfaceStyle) => update((current) => ({ ...current, surfaceStyle })),
    setPattern: (pattern) => update((current) => ({ ...current, pattern })),
    setFontStyle: (fontStyle) => update((current) => ({ ...current, fontStyle })),
    setReducedMotion: (reducedMotion) => update((current) => ({ ...current, reducedMotion })),
    toggleColorMode: () => update((current) => {
      const active = getThemePreset(current.presetId);
      return { ...current, presetId: active.base === 'dark' ? current.lastLightPresetId : current.lastDarkPresetId };
    }),
    resetAppearance: () => {
      applyAppearance(DEFAULT_APPEARANCE);
      try { localStorage.removeItem(APPEARANCE_STORAGE_KEY); } catch { /* private storage */ }
      setPreferences(DEFAULT_APPEARANCE);
    },
  }), [preferences, setPresetId, update]);

  return <AppearanceContext.Provider value={value}><DialogAccessibility />{children}</AppearanceContext.Provider>;
}

export function useAppearance() {
  const value = useContext(AppearanceContext);
  if (!value) throw new Error('useAppearance must be used within AppearanceProvider');
  return value;
}
