import { Suspense } from 'react';
import TripWorkspace from '@/components/TripWorkspace';
export default function Page() { return <Suspense fallback={<main className="tc-loading">Opening your trips…</main>}><TripWorkspace /></Suspense>; }
