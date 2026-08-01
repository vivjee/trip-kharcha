'use client';

import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  return (
    <div className="w-full min-h-screen bg-slate-50 text-slate-900 flex flex-col relative">
      <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar pb-20">
        {children}
      </div>
    </div>
  );
}
