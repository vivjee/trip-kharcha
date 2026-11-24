'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Grid3X3,
  Layers3,
  MoonStar,
  Palette,
  RotateCcw,
  Sun,
  Type,
  WandSparkles,
} from 'lucide-react';
import AppButton from '@/components/AppButton';
import { useAppearance } from '@/components/AppearanceProvider';
import type { BackgroundPattern, FontStyle, SurfaceStyle } from '@/lib/appearance';

type Section = 'theme' | 'surface' | 'background' | 'typeface' | 'motion';

interface SectionMeta {
  id: Section;
  label: string;
  mobileLabel: string;
  hint: string;
  icon: typeof Palette;
}

const sections: SectionMeta[] = [
  { id: 'theme', label: 'Theme', mobileLabel: 'Theme', hint: 'Light or dark, color and contrast across the app.', icon: Palette },
  { id: 'surface', label: 'Surface', mobileLabel: 'Surface', hint: 'How cards and controls create depth.', icon: Layers3 },
  { id: 'background', label: 'Background', mobileLabel: 'Pattern', hint: 'The atmosphere behind working surfaces.', icon: Grid3X3 },
  { id: 'typeface', label: 'Typeface', mobileLabel: 'Type', hint: 'Your display personality. Amounts stay easy to read.', icon: Type },
  { id: 'motion', label: 'Motion', mobileLabel: 'Motion', hint: 'Movement comfort for the whole app.', icon: WandSparkles },
];

const fontVars: Record<FontStyle, string> = {
  default: 'var(--font-plus-jakarta)',
  grotesk: 'var(--font-space-grotesk)',
  cyber: 'var(--font-orbitron)',
  wide: 'var(--font-syncopate)',
  mono: 'var(--font-jetbrains-mono)',
  'avant-garde': 'var(--font-syne)',
  editorial: 'var(--font-fraunces)',
  couture: 'var(--font-instrument-serif)',
  marquee: 'var(--font-anton)',
  pillow: 'var(--font-quicksand)',
  bricolage: 'var(--font-bricolage)',
};

function patternStyle(id: BackgroundPattern): React.CSSProperties {
  const color = 'color-mix(in srgb, var(--text-hi) 18%, transparent)';
  if (id === 'dots') return { backgroundImage: `radial-gradient(${color} 1.3px,transparent 1.4px)`, backgroundSize: '15px 15px' };
  if (id === 'grid') return { backgroundImage: `linear-gradient(${color} 1px,transparent 1px),linear-gradient(90deg,${color} 1px,transparent 1px)`, backgroundSize: '18px 18px' };
  if (id === 'diagonal') return { backgroundImage: `repeating-linear-gradient(45deg,${color} 0 1px,transparent 1px 10px)` };
  if (id === 'mesh') return { backgroundImage: 'radial-gradient(circle at 20% 20%,var(--accent-1),transparent 42%),radial-gradient(circle at 80% 70%,var(--accent-2),transparent 45%)' };
  return {};
}

function surfacePreviewStyle(id: SurfaceStyle): React.CSSProperties {
  if (id === 'neumorphic') return { border: '1px solid var(--surface-border)', boxShadow: '5px 5px 11px var(--nm-lo),-5px -5px 11px var(--nm-hi)' };
  if (id === 'material') return { border: '1px solid color-mix(in srgb,var(--text-hi) 9%,transparent)', boxShadow: '0 2px 5px color-mix(in srgb,var(--nm-lo) 45%,transparent),0 10px 20px color-mix(in srgb,var(--nm-lo) 30%,transparent)' };
  return { border: '1px solid color-mix(in srgb,var(--text-hi) 17%,transparent)', boxShadow: '0 1px 2px color-mix(in srgb,var(--nm-lo) 12%,transparent)' };
}

function SelectionMark({ active, color = 'text-text-hi' }: { active: boolean; color?: string }) {
  return (
    <span aria-hidden className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${active ? `border-current bg-surface-deep ${color}` : 'border-line text-transparent'}`}>
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

export default function AppearanceSettings({ onClose }: { onClose: () => void }) {
  const appearance = useAppearance();
  const [advanced, setAdvanced] = useState(false);
  const [section, setSection] = useState<Section>('theme');
  const [message, setMessage] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeMeta = sections.find((item) => item.id === section)!;
  const ActiveIcon = activeMeta.icon;

  useEffect(() => () => {
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
  }, []);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'auto' });
  }, [section]);

  const notify = useCallback((text: string, action: () => void) => {
    action();
    setMessage(text);
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => setMessage(''), 1800);
  }, []);

  const resetAppearance = () => notify('Appearance restored to defaults', appearance.resetAppearance);
  const selectedSurface = appearance.surfaces.find((item) => item.id === appearance.preferences.surfaceStyle)!;
  const selectedFont = appearance.fonts.find((item) => item.id === appearance.preferences.fontStyle)!;
  const darkMode = appearance.preset.base === 'dark';

  let sectionContent: React.ReactNode;

  if (section === 'theme') {
    sectionContent = (
      <SettingCard title="Choose a palette" hint={appearance.preset.tagline} icon={Palette}>
        <ColorModeControl
          darkMode={darkMode}
          onSelectDark={() => { if (!darkMode) notify('Dark mode restored', appearance.toggleColorMode); }}
          onSelectLight={() => { if (darkMode) notify('Light mode restored', appearance.toggleColorMode); }}
        />
        {(['dark', 'light'] as const).map((mode) => (
          <div key={mode} className="mt-4 first:mt-0">
            <div className="mb-2 flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-text-mid">{mode}</p>
              <span className="h-px flex-1 bg-line" />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {appearance.presets.filter((preset) => preset.base === mode).map((preset) => {
                const active = preset.id === appearance.preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    aria-label={`${preset.name}. ${preset.tagline}`}
                    aria-pressed={active}
                    onClick={() => notify(`${preset.name} applied`, () => appearance.setPresetId(preset.id))}
                    className={`surface-interactive min-w-0 rounded-2xl p-2 text-left cursor-pointer ${active ? 'surface-inset ring-2 ring-accent-1/70' : 'surface-card'}`}
                  >
                    <span className="block h-16 rounded-xl border border-white/10 p-2.5" style={{ background: preset.ink0, color: preset.textHi }}>
                      <span className="flex h-full items-center gap-2">
                        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-sm" style={{ background: preset.ink1 }}>Aa</span>
                        <span className="min-w-0 flex-1">
                          <span className="block h-1.5 w-full rounded-full" style={{ background: preset.textMid }} />
                          <span className="mt-2 flex gap-1">
                            {[preset.accent1, preset.accent2, preset.accent3].map((color) => <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />)}
                          </span>
                        </span>
                      </span>
                    </span>
                    <span className="mt-2 flex min-w-0 items-center gap-1.5 px-0.5">
                      <span className="min-w-0 flex-1 truncate text-[11px] font-black text-text-hi sm:text-xs">{preset.name} {preset.emoji}</span>
                      <SelectionMark active={active} />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </SettingCard>
    );
  } else if (section === 'surface') {
    sectionContent = (
      <SettingCard title="Choose depth" hint="Compare the same control in three surface systems" icon={Layers3}>
        <div className="grid grid-cols-3 gap-2">
          {appearance.surfaces.map((surface) => {
            const active = appearance.preferences.surfaceStyle === surface.id;
            return (
              <button
                key={surface.id}
                type="button"
                aria-label={`${surface.name}. ${surface.description}`}
                aria-pressed={active}
                onClick={() => notify(`${surface.name} surfaces applied`, () => appearance.setSurfaceStyle(surface.id))}
                className={`surface-interactive min-w-0 rounded-2xl p-2 text-center cursor-pointer ${active ? 'surface-inset ring-2 ring-accent-2/70' : 'surface-card'}`}
              >
                <span className="surface-inset grid h-16 place-items-center rounded-xl">
                  <span className="grid h-8 w-14 place-items-center rounded-lg bg-surface text-[9px] font-black text-text-hi sm:h-9 sm:w-20 sm:text-[10px]" style={surfacePreviewStyle(surface.id)}>Button</span>
                </span>
                <span className="mt-2 flex min-w-0 items-center justify-center gap-1.5 px-0.5">
                  <span className="truncate text-[10px] font-black text-text-hi sm:text-xs">{surface.name}</span>
                  <SelectionMark active={active} color="text-text-hi" />
                </span>
              </button>
            );
          })}
        </div>
        <SelectedSummary label={selectedSurface.name} text={selectedSurface.description} accent="text-text-hi" />
      </SettingCard>
    );
  } else if (section === 'background') {
    sectionContent = (
      <SettingCard title="Choose a pattern" hint="Quiet enough to keep financial information dominant" icon={Grid3X3}>
        <div className="grid grid-cols-3 gap-2">
          {appearance.patterns.map((pattern) => {
            const active = appearance.preferences.pattern === pattern.id;
            return (
              <button
                key={pattern.id}
                type="button"
                aria-pressed={active}
                onClick={() => notify(`${pattern.name} background applied`, () => appearance.setPattern(pattern.id))}
                className={`surface-interactive min-w-0 rounded-2xl p-2 cursor-pointer ${active ? 'surface-inset ring-2 ring-accent-3/70' : 'surface-card'}`}
              >
                <span className="block aspect-[4/3] rounded-xl bg-surface-deep" style={patternStyle(pattern.id)} />
                <span className="mt-2 flex min-w-0 items-center justify-center gap-1.5 px-0.5">
                  <span className="truncate text-[10px] font-black text-text-hi sm:text-xs">{pattern.name}</span>
                  <SelectionMark active={active} color="text-text-hi" />
                </span>
              </button>
            );
          })}
        </div>
      </SettingCard>
    );
  } else if (section === 'typeface') {
    sectionContent = (
      <SettingCard title="Choose a typeface" hint="Every tile is a live specimen" icon={Type}>
        <div className="grid grid-cols-2 gap-2">
          {appearance.fonts.map((font) => {
            const active = appearance.preferences.fontStyle === font.id;
            return (
              <button
                key={font.id}
                type="button"
                aria-label={`${font.name}. ${font.description}`}
                aria-pressed={active}
                onClick={() => notify(`${font.name} applied`, () => appearance.setFontStyle(font.id))}
                className={`surface-interactive min-h-[76px] min-w-0 rounded-2xl p-3 text-left cursor-pointer ${active ? 'surface-inset ring-2 ring-accent-2/70' : 'surface-card'}`}
              >
                <span className="flex min-w-0 items-start gap-2">
                  <span className="min-w-0 flex-1 truncate text-[14px] leading-tight text-text-hi sm:text-base" style={{ fontFamily: fontVars[font.id] }}>{font.name}</span>
                  <SelectionMark active={active} color="text-text-hi" />
                </span>
                <span className="mt-2 block truncate text-[9px] font-bold uppercase tracking-wider text-text-mid">{font.family}</span>
              </button>
            );
          })}
        </div>
        <SelectedSummary label={selectedFont.name} text={selectedFont.description} accent="text-text-hi" />
      </SettingCard>
    );
  } else {
    sectionContent = (
      <SettingCard title="Motion comfort" hint="Movement preferences apply everywhere" icon={WandSparkles}>
        <button
          type="button"
          role="switch"
          aria-checked={appearance.preferences.reducedMotion}
          onClick={() => notify(appearance.preferences.reducedMotion ? 'Full motion restored' : 'Motion reduced', () => appearance.setReducedMotion(!appearance.preferences.reducedMotion))}
          className="surface-card surface-interactive flex min-h-[72px] w-full items-center gap-3 rounded-2xl px-4 text-left cursor-pointer"
        >
          <span className={`grid h-7 w-12 shrink-0 rounded-full p-1 transition-colors ${appearance.preferences.reducedMotion ? 'bg-accent-1' : 'bg-surface-deep'}`}>
            <span className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${appearance.preferences.reducedMotion ? 'translate-x-5' : ''}`} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-black text-text-hi">Reduce motion</span>
            <span className="mt-0.5 block text-xs leading-relaxed text-text-mid">Minimizes interface movement. Your device preference is always honored.</span>
          </span>
        </button>
      </SettingCard>
    );
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="appearance-title" className="fixed inset-0 z-[100] overflow-hidden bg-canvas text-text-hi">
      <div aria-hidden className="absolute inset-0 bg-[image:var(--theme-pattern-image)] bg-[size:var(--theme-pattern-size)] pointer-events-none" />
      <div className="relative flex h-full flex-col">
        <header className="surface-card app-header z-20 flex min-h-[calc(4rem+env(safe-area-inset-top))] shrink-0 items-end justify-between gap-2 rounded-none border-x-0 border-t-0 px-3 pb-2.5 pt-[env(safe-area-inset-top)] md:px-6 md:pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <AppButton size="icon" variant="secondary" onClick={onClose} aria-label="Close appearance settings"><ArrowLeft className="h-5 w-5" /></AppButton>
            <div className="min-w-0">
              <h1 id="appearance-title" className="truncate text-base font-black text-text-hi md:text-lg">Appearance</h1>
              <p className="truncate text-[11px] font-semibold text-text-mid">{appearance.preset.name} · {selectedSurface.name}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span aria-live="polite" className={`hidden rounded-full px-3 py-1 text-xs font-bold text-text-hi surface-inset md:block ${message ? 'opacity-100' : 'opacity-0'}`}>{message}</span>
            <AppButton variant="secondary" size="standard" className="px-3 md:hidden" onClick={resetAppearance} aria-label="Reset appearance to defaults">
              <RotateCcw className="h-4 w-4" />
              <span className="hidden min-[360px]:inline">Reset</span>
            </AppButton>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:grid md:grid-cols-[220px_1fr]">
          <aside className="surface-card z-10 hidden rounded-none border-y-0 border-l-0 p-4 md:flex md:flex-col">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[.2em] text-text-mid">Settings</p>
            <button className="tc-button mb-3 w-full" aria-expanded={advanced} onClick={() => { setAdvanced(!advanced); setSection("theme"); }}>Advanced options</button><nav aria-label="Appearance sections" className="space-y-1">
              {sections.filter(item => advanced || item.id === 'theme').map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button key={item.id} type="button" aria-current={active ? 'page' : undefined} onClick={() => setSection(item.id)} className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-xs font-black cursor-pointer ${active ? 'surface-inset text-text-hi' : 'text-text-mid hover:text-text-hi'}`}>
                    <Icon className="h-4 w-4" />{item.label}
                  </button>
                );
              })}
            </nav>
            <AppButton variant="secondary" className="mt-auto" onClick={resetAppearance}><RotateCcw className="h-4 w-4" /> Reset appearance</AppButton>
          </aside>

          <main className="flex min-h-0 flex-1 flex-col overflow-hidden"><button className="tc-button m-3 md:hidden" aria-expanded={advanced} onClick={() => { setAdvanced(!advanced); setSection("theme"); }}>Advanced options</button>
            <nav aria-label="Appearance sections" className="surface-card z-10 grid shrink-0 grid-cols-5 gap-1 rounded-none border-x-0 px-1.5 py-1.5 md:hidden">
              {sections.filter(item => advanced || item.id === 'theme').map((item) => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-current={active ? 'page' : undefined}
                    onClick={() => setSection(item.id)}
                    className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 [font-family:var(--font-inter)] text-[9px] font-bold leading-none cursor-pointer min-[360px]:text-[10px] ${active ? 'surface-inset text-text-hi' : 'text-text-mid'}`}
                  >
                    <Icon className="h-4 w-4 shrink-0" strokeWidth={active ? 2.5 : 2} />
                    <span className="block max-w-full truncate">{item.mobileLabel}</span>
                  </button>
                );
              })}
            </nav>

            <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto px-3 pb-[calc(3rem+env(safe-area-inset-bottom))] pt-4 md:p-8 touch-pan-y" style={{ WebkitOverflowScrolling: 'touch' }}>
              <div className="mx-auto max-w-4xl">
                <div className="mb-3 flex items-center gap-3 md:mb-5">
                  <span className="surface-inset grid h-10 w-10 shrink-0 place-items-center rounded-xl text-text-hi"><ActiveIcon className="h-5 w-5" /></span>
                  <div className="min-w-0">
                    <h2 className="text-xl font-black leading-tight text-text-hi md:text-2xl">{activeMeta.label}</h2>
                    <p className="mt-0.5 text-xs text-text-mid md:text-sm">{activeMeta.hint}</p>
                  </div>
                </div>
                {sectionContent}
              </div>
            </div>
          </main>
        </div>

        <div aria-live="polite" role="status" className={`pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 transition-all duration-200 md:hidden ${message ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}>
          {message ? (
            <span className="surface-card-strong flex min-h-10 max-w-full items-center gap-2 rounded-full px-4 text-xs font-bold text-text-hi shadow-lg">
              <Check className="h-4 w-4 shrink-0 text-text-hi" strokeWidth={3} />
              <span className="truncate">{message}</span>
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function SettingCard({ title, hint, icon: Icon, children }: { title: string; hint: string; icon: typeof Palette; children: React.ReactNode }) {
  return (
    <section className="surface-card-strong rounded-2xl p-3.5 sm:rounded-3xl sm:p-5">
      <div className="mb-3 flex items-start gap-2.5 sm:mb-4 sm:gap-3">
        <span className="surface-inset grid h-9 w-9 shrink-0 place-items-center rounded-xl text-text-hi sm:h-10 sm:w-10"><Icon className="h-4 w-4 sm:h-5 sm:w-5" /></span>
        <div className="min-w-0">
          <h3 className="text-sm font-black text-text-hi">{title}</h3>
          <p className="mt-0.5 text-xs leading-relaxed text-text-mid">{hint}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function SelectedSummary({ label, text, accent }: { label: string; text: string; accent: string }) {
  return (
    <div className="surface-inset mt-3 flex items-start gap-2.5 rounded-xl px-3 py-2.5">
      <Check className={`mt-0.5 h-4 w-4 shrink-0 ${accent}`} strokeWidth={3} />
      <div className="min-w-0">
        <p className="text-xs font-black text-text-hi">{label} selected</p>
        <p className="mt-0.5 text-[11px] leading-relaxed text-text-mid">{text}</p>
      </div>
    </div>
  );
}

function ColorModeControl({ darkMode, onSelectDark, onSelectLight }: { darkMode: boolean; onSelectDark: () => void; onSelectLight: () => void }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-[10px] font-black uppercase tracking-[.16em] text-text-mid">Color mode</p>
      <div className="surface-inset grid grid-cols-2 gap-1 rounded-2xl p-1">
        <button
          type="button"
          aria-pressed={darkMode}
          onClick={onSelectDark}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-xs font-black cursor-pointer ${darkMode ? 'surface-card text-text-hi ring-1 ring-accent-1/50' : 'text-text-mid'}`}
        >
          <MoonStar className="h-4 w-4" /> Dark
        </button>
        <button
          type="button"
          aria-pressed={!darkMode}
          onClick={onSelectLight}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-xl text-xs font-black cursor-pointer ${!darkMode ? 'surface-card text-text-hi ring-1 ring-accent-warm/50' : 'text-text-mid'}`}
        >
          <Sun className="h-4 w-4" /> Light
        </button>
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-text-mid">Switches to your last selected {darkMode ? 'light' : 'dark'} palette.</p>
    </div>
  );
}
