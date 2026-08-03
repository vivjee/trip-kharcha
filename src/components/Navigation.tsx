'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Receipt, Scale, PieChart } from 'lucide-react';

export type TabType = 'dashboard' | 'expenses' | 'balances' | 'analytics';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingDebtsCount: number;
}

export default function Navigation({ activeTab, setActiveTab, pendingDebtsCount }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Overview', icon: Home },
    { id: 'expenses' as TabType, label: 'Expenses', icon: Receipt },
    {
      id: 'balances' as TabType,
      label: 'Balances',
      icon: Scale,
      badge: pendingDebtsCount > 0 ? pendingDebtsCount : undefined,
    },
    { id: 'analytics' as TabType, label: 'Analytics', icon: PieChart },
  ];

  return (
    <nav aria-label="Trip sections" className="fixed bottom-0 left-0 right-0 h-[calc(4rem+env(safe-area-inset-bottom))] pb-[env(safe-area-inset-bottom)] bg-white/95 backdrop-blur-2xl border-t border-slate-200/90 flex items-center justify-around px-2 z-40 shadow-xl shadow-slate-950/5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center justify-center w-full h-full relative transition-colors duration-200 cursor-pointer ${
              isActive ? 'text-indigo-600 font-extrabold' : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            <div className="relative">
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1, y: isActive ? -1 : 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive ? 'stroke-[2.5] text-indigo-600' : 'stroke-[1.8]'
                  }`}
                />
              </motion.div>

              {item.badge !== undefined && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-2.5 bg-rose-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded-full border-2 border-white shadow-xs"
                >
                  {item.badge}
                </motion.span>
              )}
            </div>
            <span className="text-[11px] font-extrabold mt-1 tracking-tight">{item.label}</span>

            {/* Sliding Luxury Active Pill Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeTabIndicator"
                className="absolute top-0 w-10 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full shadow-xs"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
