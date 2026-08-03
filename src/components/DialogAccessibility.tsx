'use client';

import { useEffect } from 'react';

const focusableSelector = [
  'button:not([disabled])',
  '[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export default function DialogAccessibility() {
  useEffect(() => {
    let activeDialog: HTMLElement | null = null;
    let returnFocus: HTMLElement | null = null;

    const syncDialog = () => {
      const dialogs = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'));
      const nextDialog = dialogs.at(-1) ?? null;
      if (nextDialog === activeDialog) return;
      if (!nextDialog && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
      if (nextDialog) {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        window.requestAnimationFrame(() => {
          if (!nextDialog.contains(document.activeElement)) nextDialog.querySelector<HTMLElement>(focusableSelector)?.focus({ preventScroll: true });
        });
      }
      activeDialog = nextDialog;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activeDialog) return;
      if (event.key === 'Escape') {
        const closeButton = activeDialog.querySelector<HTMLButtonElement>('button[aria-label^="Close"], button[aria-label*="close" i]');
        if (closeButton) { event.preventDefault(); closeButton.click(); }
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(activeDialog.querySelectorAll<HTMLElement>(focusableSelector)).filter((element) => element.offsetParent !== null);
      if (focusable.length === 0) { event.preventDefault(); activeDialog.focus(); return; }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };

    const observer = new MutationObserver(syncDialog);
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener('keydown', handleKeyDown, true);
    syncDialog();
    return () => { observer.disconnect(); document.removeEventListener('keydown', handleKeyDown, true); };
  }, []);

  return null;
}
