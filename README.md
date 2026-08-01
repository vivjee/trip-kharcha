# Trip Calculator v2

An offline-first group expense app for Nepal trips, treks, and everyday group spending. It tracks flexible expense splits, calculates a minimum set of payments, and keeps an understandable local audit trail.

## What v2 includes

- Equal, exact, and percentage splits, with one or multiple payers
- Editable expenses, settlements, trip details, and members
- Settlement progress that keeps expense totals and payments separate
- Optional private profile photo and one changeable trip cover photo
- On-demand visual share card that is never saved inside the app
- Portable JSON backup/import, including stored photos
- Local activity history and per-device participant identity
- Responsive web UI and an Android Capacitor package

## Privacy and storage

Trip data stays in browser/app storage. Photos are cropped, compressed to WebP, and stored in IndexedDB on the device. v2 has no account server, cloud upload, analytics SDK, or live multi-device sync. Export a backup before clearing app data or moving to another phone.

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
```

Android debug build:

```powershell
npm run apk:build
```

The Android build uses the statically exported Next.js app and syncs it through Capacitor.
