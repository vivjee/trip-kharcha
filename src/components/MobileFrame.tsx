'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  scrollable?: boolean;
  workspace?: boolean;
}

export default function MobileFrame({ children, scrollable = true, workspace = false }: MobileFrameProps) {
  return (
    <div className={`relative isolate flex h-dvh w-full flex-col overflow-hidden bg-transparent text-text-hi ${workspace ? 'lg:pl-64' : ''}`}>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 bg-canvas/78" />
      <div className={`min-h-0 flex-1 flex flex-col no-scrollbar ${scrollable ? 'overflow-y-auto overscroll-contain pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0' : 'overflow-hidden'}`}>
        {children}
      </div>
    </div>
  );
}
