"use client";
import { Capacitor } from "@capacitor/core";

export async function shareFiles(files: File[], title: string, text?: string) {
  if (Capacitor.isNativePlatform()) {
    const [{ Filesystem, Directory }, { Share }] = await Promise.all([
      import("@capacitor/filesystem"),
      import("@capacitor/share"),
    ]);
    const paths: string[] = [];
    try {
      const uris: string[] = [];
      for (const file of files) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        for (let i = 0; i < bytes.length; i += 8192)
          binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        const path = `trip-share-${Date.now()}-${file.name}`;
        const result = await Filesystem.writeFile({
          path,
          data: btoa(binary),
          directory: Directory.Cache,
        });
        paths.push(path);
        uris.push(result.uri);
      }
      await Share.share({ title, text, files: uris, dialogTitle: title });
    } finally {
      // Give the receiving app time to copy the shared file before removing cache entries.
      setTimeout(() => {
        for (const path of paths)
          void Filesystem.deleteFile({
            path,
            directory: Directory.Cache,
          }).catch(() => {});
      }, 60000);
    }
    return;
  }
  if (navigator.share && navigator.canShare?.({ files })) {
    await navigator.share({ title, text, files });
    return;
  }
  for (const file of files) {
    const url = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = file.name;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }
}

export async function installLifecycle(): Promise<() => void> {
  if (!Capacitor.isNativePlatform()) {
    let timer: ReturnType<typeof setTimeout> | undefined;
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      timer = setTimeout(() => {
        void navigator.serviceWorker.register("/sw.js").catch(() => {
          /* Cache availability is optional; local data is independent. */
        });
      }, 5000);
    }
    return () => clearTimeout(timer);
  }
  const { App } = await import("@capacitor/app");
  const back = await App.addListener("backButton", ({ canGoBack }) => {
    const dialogs = document.querySelectorAll<HTMLElement>(
      '[role="dialog"][aria-modal="true"]',
    );
    const dialog = dialogs.item(dialogs.length - 1);
    const close = dialog?.querySelector<HTMLButtonElement>(
      'button[aria-label*="close" i]',
    );
    if (close) {
      close.click();
      return;
    }
    if (canGoBack) history.back();
    else if (!["/", "/trips/"].includes(location.pathname))
      // Native cold launches may have no router history; the exported route is bundled locally.
      // eslint-disable-next-line @next/next/no-location-assign-relative-destination
      location.assign("/trips/");
    else void App.exitApp();
  });
  const resume = await App.addListener("appStateChange", ({ isActive }) => {
    // Resume never reloads the page: open forms and unsaved inputs remain in place.
    if (isActive) document.dispatchEvent(new Event("trip-resume"));
  });
  return () => {
    void back.remove();
    void resume.remove();
  };
}
