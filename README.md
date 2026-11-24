# Trip Calculator 3.1

An offline-first travel companion for Nepal trips, treks, and everyday group spending. It tracks packing, flexible expense splits, simplified payments, and local activity history. Payment simplification is a practical greedy algorithm; it does not guarantee the mathematical minimum number of transfers.

## What is included

- Equal, exact, and percentage splits, with one or multiple payers
- Editable expenses, settlements, trip details, and members
- Settlement progress that keeps expense totals and payments separate
- Optional private profile photo and one changeable trip cover photo
- On-demand, paginated visual summaries containing every pending payment
- Portable JSON backup/import, including stored photos
- Local activity history and per-device participant identity
- Responsive web UI and an Android Capacitor package
- Searchable trip library, four primary trip sections, separate insights and trip details
- Exact paisa arithmetic, recovery instead of destructive loading, retryable saves, and stale-window detection
- Restorable form drafts, accessible mobile forms, and 50-entry expense/activity pages
- System-aware default appearance, optional fonts and advanced customization

Controls over photography never use neumorphic shadows. Neumorphic controls are limited to matching solid surfaces.

## Privacy and storage

Trip data stays in browser/app storage. Photos are cropped, compressed to WebP, and stored in IndexedDB. There is no account server, cloud upload, analytics SDK, or live multi-device sync. Export a backup before clearing app data or moving to another phone.

The version 3 library envelope retains existing trip records and preserves the exact original envelope before migration. Both v2 and v3 trip backups can be imported. A damaged library enters recovery without overwriting its bytes. Another window's changes must be loaded before a conflicting form can be saved.

The web app caches its static export after the initial visit finishes. An update waits for existing app windows to close; it never forces a reload over an open form. Android includes the exported assets in the APK. Browser storage can still be cleared by the user or operating system, so local storage is not a substitute for backups.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Quality checks:

```bash
npm test
npm run lint
npx tsc --noEmit
npm run build
python -m http.server 3107 --directory out
```

Android debug build:

```powershell
npm run apk:build
```

The Android build uses the statically exported Next.js app and syncs it through Capacitor. Use a full JDK 21 (including `jlink`) and Android SDK 36. Set `JAVA_HOME` to the JDK and configure `android/local.properties` for your SDK. The generated APK is `android/app/build/outputs/apk/debug/app-debug.apk`.

Routes `/trips/`, `/trip/?id=...&section=...`, and `/settings/` work in the static export. `npm run start` is not the preview command for a static export; serve `out/` as shown above.
