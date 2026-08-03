'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  scrollable?: boolean;
}

export default function MobileFrame({ children, scrollable = true }: MobileFrameProps) {
  return (
    <div className="w-full h-dvh overflow-hidden bg-slate-50 text-slate-900 flex flex-col relative">
      <div className={`min-h-0 flex-1 flex flex-col no-scrollbar ${scrollable ? 'overflow-y-auto overscroll-contain pb-[calc(5rem+env(safe-area-inset-bottom))]' : 'overflow-hidden'}`}>
        {children}
      </div>
    </div>
  );
}
