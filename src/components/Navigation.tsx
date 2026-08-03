'use client';

import React from 'react';
import { Home, Receipt, Scale, PieChart, History, Settings2, Map } from 'lucide-react';

export type TabType = 'dashboard' | 'expenses' | 'balances' | 'analytics' | 'activity';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingDebtsCount: number;
  tripName?: string;
  onOpenSettings?: () => void;
}

const navItems = [
  { id: 'dashboard' as TabType, label: 'Overview', icon: Home },
  { id: 'expenses' as TabType, label: 'Expenses', icon: Receipt },
  { id: 'balances' as TabType, label: 'Balances', icon: Scale },
  { id: 'analytics' as TabType, label: 'Analytics', icon: PieChart },
  { id: 'activity' as TabType, label: 'Activity', icon: History },
];

function NavItem({ item, active, badge, onClick, desktop = false }: {
  item: typeof navItems[number]; active: boolean; badge?: number; onClick: () => void; desktop?: boolean;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`${desktop ? 'min-h-12 w-full flex-row justify-start gap-3 px-3' : 'h-full w-full flex-col justify-center gap-1'} relative flex items-center rounded-xl text-xs font-extrabold transition-colors cursor-pointer ${active ? 'text-accent-1' : 'text-text-low hover:text-text-hi'}`}
    >
      <span className={`relative grid h-8 w-8 place-items-center rounded-xl ${active ? 'surface-inset' : ''}`}>
        <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
        {badge ? <span className="absolute -right-1.5 -top-1 min-w-4 rounded-full bg-negative px-1 text-center font-mono text-[9px] font-black text-white">{badge}</span> : null}
      </span>
      <span>{item.label}</span>
      {active && !desktop ? <span className="absolute top-0 h-0.5 w-9 rounded-full bg-accent-1" /> : null}
    </button>
  );
}

export default function Navigation({ activeTab, setActiveTab, pendingDebtsCount, tripName, onOpenSettings }: NavigationProps) {
  return (
    <>
      <nav aria-label="Trip sections" className="surface-card fixed bottom-0 left-0 right-0 z-40 flex h-[calc(4rem+env(safe-area-inset-bottom))] items-center justify-around border-x-0 border-b-0 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
        {navItems.map((item) => <NavItem key={item.id} item={item} active={activeTab === item.id} badge={item.id === 'balances' ? pendingDebtsCount : undefined} onClick={() => setActiveTab(item.id)} />)}
      </nav>

      <aside className="surface-card-strong fixed inset-y-0 left-0 z-50 hidden w-64 flex-col rounded-none border-y-0 border-l-0 p-4 lg:flex">
        <div className="flex items-center gap-3 px-2 py-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-accent-1 text-white shadow-lg shadow-black/10"><Map className="h-5 w-5" /></span>
          <div className="min-w-0"><p className="font-display text-sm font-black text-text-hi">Trip Calculator</p><p className="text-[11px] font-semibold text-text-low">Luxury group expenses</p></div>
        </div>
        <div className="surface-inset mt-4 rounded-2xl p-3">
          <p className="text-[10px] font-bold uppercase tracking-[.18em] text-text-faint">Current trip</p>
          <p className="mt-1 truncate text-sm font-black text-text-hi">{tripName || 'Your trip'}</p>
        </div>
        <nav className="mt-5 space-y-1" aria-label="Desktop trip sections">
          {navItems.map((item) => <NavItem desktop key={item.id} item={item} active={activeTab === item.id} badge={item.id === 'balances' ? pendingDebtsCount : undefined} onClick={() => setActiveTab(item.id)} />)}
        </nav>
        <div className="mt-auto border-t border-line pt-4">
          <button type="button" onClick={onOpenSettings} className="flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-xs font-extrabold text-text-low transition-colors hover:bg-surface-deep hover:text-text-hi cursor-pointer">
            <span className="grid h-8 w-8 place-items-center rounded-xl surface-inset"><Settings2 className="h-4 w-4" /></span> Appearance
          </button>
        </div>
      </aside>
    </>
  );
}
