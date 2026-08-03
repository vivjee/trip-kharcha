'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Grid3X3, Layers3, MoonStar, Palette, RotateCcw, Sparkles, Sun, Type, WandSparkles } from 'lucide-react';
import AppButton from '@/components/AppButton';
import { useAppearance } from '@/components/AppearanceProvider';
import type { BackgroundPattern, FontStyle } from '@/lib/appearance';

type Section = 'theme' | 'surface' | 'background' | 'typeface' | 'motion';

const sections: { id: Section; label: string; icon: typeof Palette }[] = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'surface', label: 'Surface', icon: Layers3 },
  { id: 'background', label: 'Background', icon: Grid3X3 },
  { id: 'typeface', label: 'Typeface', icon: Type },
  { id: 'motion', label: 'Motion', icon: WandSparkles },
];

const fontVars: Record<FontStyle, string> = {
  default: 'var(--font-space-grotesk)', cyber: 'var(--font-orbitron)', wide: 'var(--font-syncopate)', mono: 'var(--font-jetbrains-mono)',
  'avant-garde': 'var(--font-syne)', editorial: 'var(--font-fraunces)', couture: 'var(--font-instrument-serif)', marquee: 'var(--font-anton)',
  pillow: 'var(--font-quicksand)', bricolage: 'var(--font-bricolage)',
};

function patternStyle(id: BackgroundPattern): React.CSSProperties {
  const color = 'color-mix(in srgb, var(--text-hi) 18%, transparent)';
  if (id === 'dots') return { backgroundImage: `radial-gradient(${color} 1.3px,transparent 1.4px)`, backgroundSize: '15px 15px' };
  if (id === 'grid') return { backgroundImage: `linear-gradient(${color} 1px,transparent 1px),linear-gradient(90deg,${color} 1px,transparent 1px)`, backgroundSize: '18px 18px' };
  if (id === 'diagonal') return { backgroundImage: `repeating-linear-gradient(45deg,${color} 0 1px,transparent 1px 10px)` };
  if (id === 'mesh') return { backgroundImage: 'radial-gradient(circle at 20% 20%,var(--accent-1),transparent 42%),radial-gradient(circle at 80% 70%,var(--accent-2),transparent 45%)' };
  return {};
}

export default function AppearanceSettings({ onClose }: { onClose: () => void }) {
  const appearance = useAppearance();
  const [section, setSection] = useState<Section>('theme');
  const [message, setMessage] = useState('');
  const activeMeta = sections.find((item) => item.id === section)!;
  const ActiveIcon = activeMeta.icon;

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [onClose]);

  const notify = (text: string, action: () => void) => {
    action(); setMessage(text); window.setTimeout(() => setMessage(''), 1600);
  };

  const currentSection = useMemo(() => {
    if (section === 'theme') return (
      <SettingCard title="Color theme" hint="A complete canvas, text and accent system" icon={Palette}>
        {(['dark', 'light'] as const).map((mode) => (
          <div key={mode} className="mt-4 first:mt-0">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[.18em] text-text-faint">{mode}</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {appearance.presets.filter((preset) => preset.base === mode).map((preset) => {
                const active = preset.id === appearance.preset.id;
                return (
                  <button key={preset.id} aria-pressed={active} onClick={() => notify(`${preset.name} applied`, () => appearance.setPresetId(preset.id))} className={`surface-interactive rounded-2xl p-2.5 text-left cursor-pointer ${active ? 'surface-inset ring-1 ring-accent-1/60' : 'surface-card'}`}>
                    <span className="block rounded-xl border border-white/10 p-3" style={{ background: preset.ink0, color: preset.textHi }}>
                      <span className="flex items-center gap-2"><span className="grid h-9 w-9 place-items-center rounded-lg" style={{ background: preset.ink1 }}>Aa</span><span className="min-w-0 flex-1"><span className="block h-1.5 w-full rounded-full" style={{ background: preset.textMid }} /><span className="mt-2 flex gap-1">{[preset.accent1,preset.accent2,preset.accent3].map((color) => <span key={color} className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />)}</span></span></span>
                    </span>
                    <span className="mt-2 flex items-center justify-between gap-2 px-1"><span className="truncate text-xs font-black text-text-hi">{preset.name} {preset.emoji}</span>{active && <Check className="h-4 w-4 text-accent-1" />}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </SettingCard>
    );
    if (section === 'surface') return (
      <SettingCard title="Surface depth" hint="Changes every card, control, drawer and input" icon={Layers3}>
        <div className="grid gap-3 sm:grid-cols-3">
          {appearance.surfaces.map((surface) => {
            const active = appearance.preferences.surfaceStyle === surface.id;
            return <button key={surface.id} aria-pressed={active} onClick={() => notify(`${surface.name} surfaces applied`, () => appearance.setSurfaceStyle(surface.id))} className={`rounded-2xl p-3 text-left cursor-pointer ${active ? 'surface-inset ring-1 ring-accent-2/60' : 'surface-card surface-interactive'}`}>
              <span className="surface-inset grid h-20 place-items-center rounded-xl"><span className="surface-card grid h-10 w-24 place-items-center rounded-xl text-xs font-black text-text-hi">Button</span></span>
              <span className="mt-3 block text-sm font-black text-text-hi">{surface.name}</span><span className="mt-1 block text-xs leading-relaxed text-text-low">{surface.description}</span>
            </button>;
          })}
        </div>
      </SettingCard>
    );
    if (section === 'background') return (
      <SettingCard title="Background atmosphere" hint="A quiet pattern beneath the working surfaces" icon={Grid3X3}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {appearance.patterns.map((pattern) => {
            const active = appearance.preferences.pattern === pattern.id;
            return <button key={pattern.id} aria-pressed={active} onClick={() => notify(`${pattern.name} background applied`, () => appearance.setPattern(pattern.id))} className={`rounded-2xl p-2.5 cursor-pointer ${active ? 'surface-inset ring-1 ring-accent-3/60' : 'surface-card surface-interactive'}`}><span className="block h-20 rounded-xl bg-surface-deep" style={patternStyle(pattern.id)} /><span className="mt-2 block truncate text-xs font-black text-text-hi">{pattern.name}</span></button>;
          })}
        </div>
      </SettingCard>
    );
    if (section === 'typeface') return (
      <SettingCard title="Typeface" hint="Amounts remain tabular and readable in every style" icon={Type}>
        <div className="grid gap-2 sm:grid-cols-2">
          {appearance.fonts.map((font) => {
            const active = appearance.preferences.fontStyle === font.id;
            return <button key={font.id} aria-pressed={active} onClick={() => notify(`${font.name} applied`, () => appearance.setFontStyle(font.id))} className={`rounded-2xl px-4 py-3 text-left cursor-pointer ${active ? 'surface-inset ring-1 ring-accent-2/60' : 'surface-card surface-interactive'}`}><span className="flex items-center justify-between gap-2"><span className="truncate text-lg text-text-hi" style={{ fontFamily: fontVars[font.id] }}>{font.name}</span>{active && <Check className="h-4 w-4 text-accent-2" />}</span><span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-text-faint">{font.family}</span><span className="mt-1 block text-xs text-text-low">{font.description}</span></button>;
          })}
        </div>
      </SettingCard>
    );
    return (
      <SettingCard title="Motion and mode" hint="Comfort controls for the whole interface" icon={WandSparkles}>
        <button onClick={() => notify('Color mode switched', appearance.toggleColorMode)} className="surface-card surface-interactive flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 text-left cursor-pointer"><span className="surface-inset grid h-10 w-10 place-items-center rounded-xl">{appearance.preset.base === 'dark' ? <Sun className="h-5 w-5 text-accent-warm" /> : <MoonStar className="h-5 w-5 text-accent-1" />}</span><span className="min-w-0 flex-1"><span className="block text-sm font-black text-text-hi">Switch to {appearance.preset.base === 'dark' ? 'light' : 'dark'}</span><span className="block text-xs text-text-low">Returns to your last-used preset in that mode</span></span></button>
        <button aria-pressed={appearance.preferences.reducedMotion} onClick={() => notify(appearance.preferences.reducedMotion ? 'Full motion restored' : 'Motion reduced', () => appearance.setReducedMotion(!appearance.preferences.reducedMotion))} className="surface-card surface-interactive mt-3 flex min-h-16 w-full items-center gap-3 rounded-2xl px-4 text-left cursor-pointer"><span className={`grid h-6 w-11 shrink-0 rounded-full p-1 transition-colors ${appearance.preferences.reducedMotion ? 'bg-accent-1' : 'bg-surface-deep'}`}><span className={`h-4 w-4 rounded-full bg-white transition-transform ${appearance.preferences.reducedMotion ? 'translate-x-5' : ''}`} /></span><span><span className="block text-sm font-black text-text-hi">Reduce motion</span><span className="block text-xs text-text-low">System reduced-motion preferences are always respected</span></span></button>
      </SettingCard>
    );
  }, [appearance, section]);

  return (
    <div className="fixed inset-0 z-[100] overflow-hidden bg-canvas text-text-hi">
      <div aria-hidden className="absolute inset-0 bg-[image:var(--theme-pattern-image)] bg-[size:var(--theme-pattern-size)]" />
      <div className="relative flex h-full flex-col">
        <header className="surface-card z-20 flex min-h-[calc(4.25rem+env(safe-area-inset-top))] shrink-0 items-end justify-between gap-3 rounded-none border-x-0 border-t-0 px-4 pb-3 pt-[env(safe-area-inset-top)] md:px-6">
          <div className="flex min-w-0 items-center gap-3"><AppButton size="icon" variant="ghost" onClick={onClose} aria-label="Close appearance settings"><ArrowLeft className="h-5 w-5" /></AppButton><div className="min-w-0"><p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-[.18em] text-accent-1"><Sparkles className="h-3 w-3" /> Appearance</p><h1 className="truncate text-lg font-black text-text-hi">Theme & interface</h1></div></div>
          <span aria-live="polite" className={`hidden rounded-full px-3 py-1 text-xs font-bold text-accent-2 surface-inset sm:block ${message ? 'opacity-100' : 'opacity-0'}`}>{message || 'Updated'}</span>
        </header>

        <div className="min-h-0 flex-1 md:grid md:grid-cols-[220px_1fr]">
          <aside className="surface-card z-10 hidden rounded-none border-y-0 border-l-0 p-4 md:flex md:flex-col">
            <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[.2em] text-text-faint">Settings</p>
            <nav className="space-y-1">{sections.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setSection(item.id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-xs font-black cursor-pointer ${section === item.id ? 'surface-inset text-accent-1' : 'text-text-low hover:text-text-hi'}`}><Icon className="h-4 w-4" />{item.label}</button>; })}</nav>
            <AppButton variant="ghost" className="mt-auto" onClick={() => notify('Appearance reset', appearance.resetAppearance)}><RotateCcw className="h-4 w-4" /> Reset appearance</AppButton>
          </aside>

          <main className="flex min-h-0 flex-col">
            <nav className="no-scrollbar surface-card z-10 flex shrink-0 gap-2 overflow-x-auto rounded-none border-x-0 px-3 py-2 md:hidden">{sections.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setSection(item.id)} className={`flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-black cursor-pointer ${section === item.id ? 'surface-inset text-accent-1' : 'text-text-low'}`}><Icon className="h-3.5 w-3.5" />{item.label}</button>; })}</nav>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] md:p-8">
              <div className="mx-auto max-w-4xl">
                <div className="mb-5"><p className="flex items-center gap-1.5 text-xs font-black uppercase tracking-[.16em] text-accent-1"><ActiveIcon className="h-4 w-4" /> Personalize</p><h2 className="mt-1 text-2xl font-black text-text-hi">{activeMeta.label}</h2><p className="mt-1 text-sm text-text-low">Changes apply instantly across every trip screen.</p></div>
                {currentSection}
                <div className="mt-4 md:hidden"><AppButton variant="ghost" fullWidth onClick={() => notify('Appearance reset', appearance.resetAppearance)}><RotateCcw className="h-4 w-4" /> Reset appearance</AppButton></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function SettingCard({ title, hint, icon: Icon, children }: { title: string; hint: string; icon: typeof Palette; children: React.ReactNode }) {
  return <section className="surface-card-strong rounded-3xl p-4 sm:p-5"><div className="mb-4 flex items-start gap-3"><span className="surface-inset grid h-10 w-10 shrink-0 place-items-center rounded-xl text-accent-1"><Icon className="h-5 w-5" /></span><div><h3 className="text-sm font-black text-text-hi">{title}</h3><p className="mt-0.5 text-xs text-text-low">{hint}</p></div></div>{children}</section>;
}
