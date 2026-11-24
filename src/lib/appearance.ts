export type AppearanceMode = 'dark' | 'light';
export type SurfaceStyle = 'neumorphic' | 'material' | 'flat';
export type BackgroundPattern = 'none' | 'dots' | 'grid' | 'diagonal' | 'mesh';
export type FontStyle =
  | 'default'
  | 'cyber'
  | 'wide'
  | 'mono'
  | 'avant-garde'
  | 'editorial'
  | 'couture'
  | 'marquee'
  | 'pillow'
  | 'bricolage'
  | 'grotesk';

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  emoji: string;
  base: AppearanceMode;
  ink0: string;
  ink1: string;
  inkEdge: string;
  textHi: string;
  textMid: string;
  textLow: string;
  textFaint: string;
  accent1: string;
  accent2: string;
  accent3: string;
  accentWarm: string;
  nmLo: string;
  nmHi: string;
  nmLo2: string;
  nmHi2: string;
  surfaceRaised?: string;
  surfaceDeep?: string;
  surfaceRaisedHover: string;
  surfaceSunkenActive: string;
  nmLineSoft: string;
  nmLineFaint: string;
  glassBorder: string;
  glassBorderHover: string;
  previewGradient: string;
}

export interface AppearancePreferences {
  version: 1;
  presetId: string;
  surfaceStyle: SurfaceStyle;
  pattern: BackgroundPattern;
  fontStyle: FontStyle;
  reducedMotion: boolean;
  lastDarkPresetId: string;
  lastLightPresetId: string;
}

export const APPEARANCE_STORAGE_KEY = 'trip_calculator_appearance_v1';

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'neon', name: 'Crystal Neon', tagline: 'Vibrant violet and teal on deep space', emoji: '💎', base: 'dark',
    ink0: '#06070D', ink1: '#0A0C16', inkEdge: '#1A1E2E', textHi: '#F4F5FA', textMid: '#B4B9CC', textLow: '#7B8197', textFaint: '#4B5066',
    accent1: '#6E56FF', accent2: '#00E0CB', accent3: '#FF4FB0', accentWarm: '#FFB454', nmLo: '#020305', nmHi: '#121626', nmLo2: '#010204', nmHi2: '#14192d',
    surfaceRaisedHover: '#0d0f1e', surfaceSunkenActive: '#05060b', nmLineSoft: 'rgba(255,255,255,.04)', nmLineFaint: 'rgba(255,255,255,.02)',
    glassBorder: 'rgba(255,255,255,.08)', glassBorderHover: 'rgba(255,255,255,.12)', previewGradient: 'linear-gradient(135deg,#6E56FF 0%,#00E0CB 60%,#FF4FB0 100%)',
  },
  {
    id: 'slate', name: 'Slate Pro', tagline: 'Calm cool slate for focused work', emoji: '🪨', base: 'dark',
    ink0: '#0E131B', ink1: '#171E2B', inkEdge: '#2A3444', textHi: '#F2F5FA', textMid: '#AEB7C7', textLow: '#7C8496', textFaint: '#565E70',
    accent1: '#7C8CFF', accent2: '#3ED0C4', accent3: '#F472B6', accentWarm: '#F5B968', nmLo: '#070A10', nmHi: '#1C2434', nmLo2: '#05070C', nmHi2: '#202940',
    surfaceRaised: '#171E2B', surfaceDeep: '#0E131B', surfaceRaisedHover: '#1C2434', surfaceSunkenActive: '#0A0E16', nmLineSoft: 'rgba(255,255,255,.06)', nmLineFaint: 'rgba(255,255,255,.03)',
    glassBorder: 'rgba(255,255,255,.09)', glassBorderHover: 'rgba(255,255,255,.12)', previewGradient: 'linear-gradient(135deg,#7C8CFF 0%,#3ED0C4 60%,#F472B6 100%)',
  },
  {
    id: 'midnight', name: 'Midnight Ink', tagline: 'Warm deep navy for long evenings', emoji: '🌙', base: 'dark',
    ink0: '#0F131E', ink1: '#171C2B', inkEdge: '#29304A', textHi: '#EDEBF5', textMid: '#B3B2CC', textLow: '#7E7D9A', textFaint: '#565675',
    accent1: '#9C8CFF', accent2: '#F0A868', accent3: '#E58FB8', accentWarm: '#F5C97A', nmLo: '#070A12', nmHi: '#1E263A', nmLo2: '#05070E', nmHi2: '#232C44',
    surfaceRaised: '#171C2B', surfaceDeep: '#0F131E', surfaceRaisedHover: '#1B2132', surfaceSunkenActive: '#0C1019', nmLineSoft: 'rgba(255,255,255,.045)', nmLineFaint: 'rgba(255,255,255,.025)',
    glassBorder: 'rgba(255,255,255,.08)', glassBorderHover: 'rgba(255,255,255,.12)', previewGradient: 'linear-gradient(135deg,#9C8CFF 0%,#E58FB8 55%,#F0A868 100%)',
  },
  {
    id: 'paper', name: 'Warm Paper', tagline: 'Editorial warmth and low-glare calm', emoji: '📜', base: 'light',
    ink0: '#EFEAE1', ink1: '#F6F1E8', inkEdge: '#DED6C8', textHi: '#2A2620', textMid: '#514B3E', textLow: '#837C6B', textFaint: '#A8A08C',
    accent1: '#C2410C', accent2: '#4338CA', accent3: '#B91C6B', accentWarm: '#B45309', nmLo: '#D8CFBF', nmHi: '#FFFDF8', nmLo2: '#CFC5B2', nmHi2: '#FFFFFF',
    surfaceRaised: '#F6F1E8', surfaceDeep: '#EFEAE1', surfaceRaisedHover: '#FBF7F0', surfaceSunkenActive: '#E7E0D4', nmLineSoft: 'rgba(120,110,90,.14)', nmLineFaint: 'rgba(120,110,90,.08)',
    glassBorder: 'rgba(60,50,30,.10)', glassBorderHover: 'rgba(60,50,30,.12)', previewGradient: 'linear-gradient(135deg,#C2410C 0%,#B91C6B 55%,#4338CA 100%)',
  },
  {
    id: 'porcelain', name: 'Porcelain', tagline: 'Crisp, clean and high contrast', emoji: '🤍', base: 'light',
    ink0: '#EEF1F5', ink1: '#FFFFFF', inkEdge: '#DCE2EA', textHi: '#10141C', textMid: '#3C4453', textLow: '#6B7280', textFaint: '#9AA2AF',
    accent1: '#2563EB', accent2: '#0D9488', accent3: '#DB2777', accentWarm: '#D97706', nmLo: '#DEE4EC', nmHi: '#FFFFFF', nmLo2: '#D3DAE4', nmHi2: '#FFFFFF',
    surfaceRaised: '#FFFFFF', surfaceDeep: '#EEF1F5', surfaceRaisedHover: '#F8FAFC', surfaceSunkenActive: '#E2E8F0', nmLineSoft: 'rgba(15,23,42,.10)', nmLineFaint: 'rgba(15,23,42,.06)',
    glassBorder: 'rgba(15,23,42,.09)', glassBorderHover: 'rgba(15,23,42,.12)', previewGradient: 'linear-gradient(135deg,#2563EB 0%,#0D9488 55%,#DB2777 100%)',
  },
  {
    id: 'mist', name: 'Mist', tagline: 'Cool airy blue-grey, fresh and calm', emoji: '🌫️', base: 'light',
    ink0: '#E6ECF3', ink1: '#F3F6FA', inkEdge: '#CFD9E5', textHi: '#16202E', textMid: '#3E4C5E', textLow: '#6A788C', textFaint: '#98A6B8',
    accent1: '#3B82F6', accent2: '#0EA5E9', accent3: '#8B5CF6', accentWarm: '#EA9A3E', nmLo: '#C7D2E0', nmHi: '#FFFFFF', nmLo2: '#BCC8D9', nmHi2: '#FFFFFF',
    surfaceRaised: '#F3F6FA', surfaceDeep: '#E6ECF3', surfaceRaisedHover: '#F8FAFD', surfaceSunkenActive: '#DBE3EE', nmLineSoft: 'rgba(22,32,46,.10)', nmLineFaint: 'rgba(22,32,46,.06)',
    glassBorder: 'rgba(22,32,46,.09)', glassBorderHover: 'rgba(22,32,46,.12)', previewGradient: 'linear-gradient(135deg,#3B82F6 0%,#0EA5E9 55%,#8B5CF6 100%)',
  },
];

export const SURFACE_OPTIONS: { id: SurfaceStyle; name: string; description: string }[] = [
  { id: 'neumorphic', name: 'Neumorphic', description: 'Soft, sculpted controls with pressed wells' },
  { id: 'material', name: 'Material', description: 'Restrained elevation and clear hierarchy' },
  { id: 'flat', name: 'Flat', description: 'Crisp borders with minimal shadow' },
];

export const PATTERN_OPTIONS: { id: BackgroundPattern; name: string }[] = [
  { id: 'none', name: 'None' }, { id: 'dots', name: 'Dots' }, { id: 'grid', name: 'Grid' },
  { id: 'diagonal', name: 'Diagonal' }, { id: 'mesh', name: 'Mesh' },
];

export const FONT_OPTIONS: { id: FontStyle; name: string; family: string; description: string }[] = [
  { id: 'default', name: 'Plus Jakarta', family: 'Plus Jakarta Sans', description: 'Crisp, practical, and beautifully balanced' },
  { id: 'grotesk', name: 'Crystal Grotesk', family: 'Space Grotesk', description: 'Retro tech display character' },
  { id: 'cyber', name: 'Aero Cyber', family: 'Orbitron', description: 'Futuristic display character' },
  { id: 'wide', name: 'Quantum Wide', family: 'Syncopate', description: 'Wide cinematic headings' },
  { id: 'mono', name: 'Neo-Chrono', family: 'JetBrains Mono', description: 'Technical and measured' },
  { id: 'avant-garde', name: 'Chroma Organic', family: 'Syne + Outfit', description: 'Expressive contemporary forms' },
  { id: 'editorial', name: 'Editorial Ink', family: 'Fraunces', description: 'Warm literary headings' },
  { id: 'couture', name: 'Maison Couture', family: 'Instrument Serif', description: 'Elegant high-contrast serif' },
  { id: 'marquee', name: 'Bold Marquee', family: 'Anton', description: 'Confident poster-style headings' },
  { id: 'pillow', name: 'Soft Pillow', family: 'Quicksand', description: 'Friendly rounded forms' },
  { id: 'bricolage', name: 'Studio Quirk', family: 'Bricolage Grotesque', description: 'Characterful modern utility' },
];

export const DEFAULT_APPEARANCE: AppearancePreferences = {
  version: 1,
  presetId: 'midnight',
  surfaceStyle: 'neumorphic',
  pattern: 'none',
  fontStyle: 'default',
  reducedMotion: false,
  lastDarkPresetId: 'midnight',
  lastLightPresetId: 'paper',
};

export function getSystemThemePreset(): string {
  if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    return 'paper';
  }
  return 'midnight';
}

const surfaceIds = new Set(SURFACE_OPTIONS.map((item) => item.id));
const patternIds = new Set(PATTERN_OPTIONS.map((item) => item.id));
const fontIds = new Set(FONT_OPTIONS.map((item) => item.id));

export function getThemePreset(id: string): ThemePreset {
  return THEME_PRESETS.find((preset) => preset.id === id) ?? THEME_PRESETS.find((preset) => preset.id === DEFAULT_APPEARANCE.presetId)!;
}

function validPresetForMode(id: unknown, mode: AppearanceMode, fallback: string): string {
  return typeof id === 'string' && THEME_PRESETS.some((preset) => preset.id === id && preset.base === mode) ? id : fallback;
}

export function normalizeAppearance(value: unknown, fallbackPreset = DEFAULT_APPEARANCE.presetId): AppearancePreferences {
  const input = value && typeof value === 'object' ? value as Partial<AppearancePreferences> : {};
  return {
    version: 1,
    presetId: typeof input.presetId === 'string' && THEME_PRESETS.some((preset) => preset.id === input.presetId) ? input.presetId : fallbackPreset,
    surfaceStyle: surfaceIds.has(input.surfaceStyle as SurfaceStyle) ? input.surfaceStyle as SurfaceStyle : DEFAULT_APPEARANCE.surfaceStyle,
    pattern: patternIds.has(input.pattern as BackgroundPattern) ? input.pattern as BackgroundPattern : DEFAULT_APPEARANCE.pattern,
    fontStyle: fontIds.has(input.fontStyle as FontStyle) ? input.fontStyle as FontStyle : DEFAULT_APPEARANCE.fontStyle,
    reducedMotion: input.reducedMotion === true,
    lastDarkPresetId: validPresetForMode(input.lastDarkPresetId, 'dark', DEFAULT_APPEARANCE.lastDarkPresetId),
    lastLightPresetId: validPresetForMode(input.lastLightPresetId, 'light', DEFAULT_APPEARANCE.lastLightPresetId),
  };
}

export function parseStoredAppearance(raw: string | null): AppearancePreferences {
  const systemPreset = getSystemThemePreset();
  const defaultWithSystem: AppearancePreferences = {
    ...DEFAULT_APPEARANCE,
    presetId: systemPreset,
  };
  if (!raw) return defaultWithSystem;
  try {
    return normalizeAppearance(JSON.parse(raw), systemPreset);
  } catch {
    return defaultWithSystem;
  }
}

export function presetCssVars(preset: ThemePreset): Record<string, string> {
  return {
    '--ink-0': preset.ink0, '--ink-1': preset.ink1, '--ink-edge': preset.inkEdge,
    '--text-hi': preset.textHi, '--text-mid': preset.textMid, '--text-low': preset.textLow, '--text-faint': preset.textFaint,
    '--accent-1': preset.accent1, '--accent-2': preset.accent2, '--accent-3': preset.accent3, '--accent-warm': preset.accentWarm,
    '--nm-lo': preset.nmLo, '--nm-hi': preset.nmHi, '--nm-lo-2': preset.nmLo2, '--nm-hi-2': preset.nmHi2,
    '--surface-raised': preset.surfaceRaised ?? preset.ink1, '--surface-deep': preset.surfaceDeep ?? preset.ink0,
    '--surface-raised-hover': preset.surfaceRaisedHover, '--surface-sunken-active': preset.surfaceSunkenActive,
    '--nm-line-soft': preset.nmLineSoft, '--nm-line-faint': preset.nmLineFaint,
    '--glass-border': preset.glassBorder, '--glass-border-hover': preset.glassBorderHover,
  };
}

export const THEME_PRESET_VARS = Object.fromEntries(THEME_PRESETS.map((preset) => [preset.id, presetCssVars(preset)]));
export const THEME_PRESET_BASE = Object.fromEntries(THEME_PRESETS.map((preset) => [preset.id, preset.base]));
