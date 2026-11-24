"use client";
import { useEffect } from "react";
const focusable =
  'button:not([disabled]),[href],input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
export default function DialogAccessibility() {
  useEffect(() => {
    let active: HTMLElement | null = null;
    let token = "";
    let backing = false;
    const returns = new Map<HTMLElement, HTMLElement | null>();
    const inerts = new Map<HTMLElement, boolean>();
    const restoreInert = () => {
      for (const [el, was] of inerts) el.inert = was;
      inerts.clear();
    };
    const closeDialog = () =>
      active
        ?.querySelector<HTMLButtonElement>('button[aria-label*="close" i]')
        ?.click();
    const sync = () => {
      const next =
        Array.from(
          document.querySelectorAll<HTMLElement>(
            '[role="dialog"][aria-modal="true"]',
          ),
        ).at(-1) || null;
      if (next === active) return;
      const previous = active;
      restoreInert();
      if (previous && !previous.isConnected) {
        const target = returns.get(previous);
        returns.delete(previous);
        if (target?.isConnected) target.focus({ preventScroll: true });
      }
      if (previous && !next && history.state?.tcDialog === token && !backing)
        history.back();
      backing = false;
      if (next) {
        if (!returns.has(next))
          returns.set(
            next,
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null,
          );
        if (!previous) {
          token = crypto.randomUUID();
          history.pushState(
            { ...history.state, tcDialog: token },
            "",
            location.href,
          );
        }
        let branch: HTMLElement = next;
        while (branch.parentElement) {
          for (const sibling of Array.from(branch.parentElement.children)) {
            if (
              sibling !== branch &&
              sibling instanceof HTMLElement &&
              !["SCRIPT", "STYLE", "LINK"].includes(sibling.tagName)
            ) {
              inerts.set(sibling, sibling.inert);
              sibling.inert = true;
            }
          }
          branch = branch.parentElement;
          if (branch === document.body) break;
        }
        requestAnimationFrame(() => {
          if (next.isConnected && !next.contains(document.activeElement))
            next
              .querySelector<HTMLElement>(focusable)
              ?.focus({ preventScroll: true });
        });
      }
      active = next;
    };
    const pop = () => {
      if (active) {
        backing = true;
        closeDialog();
      }
    };
    const keys = (e: KeyboardEvent) => {
      if (!active) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeDialog();
        return;
      }
      if (e.key !== "Tab") return;
      const elements = Array.from(
        active.querySelectorAll<HTMLElement>(focusable),
      ).filter((el) => el.offsetParent !== null);
      if (!elements.length) {
        e.preventDefault();
        active.tabIndex = -1;
        active.focus();
        return;
      }
      const first = elements[0],
        last = elements.at(-1)!;
      if (
        e.shiftKey &&
        (document.activeElement === first ||
          !active.contains(document.activeElement))
      ) {
        e.preventDefault();
        last.focus();
      } else if (
        !e.shiftKey &&
        (document.activeElement === last ||
          !active.contains(document.activeElement))
      ) {
        e.preventDefault();
        first.focus();
      }
    };
    const observer = new MutationObserver((records) => {
      if (
        (active && !active.isConnected) ||
        records.some((r) =>
          [...r.addedNodes, ...r.removedNodes].some(
            (n) =>
              n instanceof Element &&
              (n.matches('[role="dialog"]') ||
                n.querySelector('[role="dialog"]')),
          ),
        )
      )
        sync();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    document.addEventListener("keydown", keys, true);
    window.addEventListener("popstate", pop);
    sync();
    return () => {
      observer.disconnect();
      restoreInert();
      document.removeEventListener("keydown", keys, true);
      window.removeEventListener("popstate", pop);
    };
  }, []);
  return null;
}
