'use client';

import React from 'react';
import Image from 'next/image';
import { UserProfile } from '@/types/trip';
import { Plus, User, UserCheck, CheckCircle2, Map, Settings2 } from 'lucide-react';
import Avatar from '@/components/Avatar';
import AppButton from '@/components/AppButton';

interface ZeroStateIntroProps {
  userProfile: UserProfile | null;
  onOpenCreateProfile: () => void;
  onOpenCreateTrip: () => void;
  onOpenSettings: () => void;
}

export default function ZeroStateIntro({ userProfile, onOpenCreateProfile, onOpenCreateTrip, onOpenSettings }: ZeroStateIntroProps) {
  return (
    <div data-media-overlay className="fixed inset-0 z-40 flex flex-col overflow-hidden bg-slate-950 p-4 select-none">
      <Image src="/images/nepal_hero.jpg" alt="Nepal mountain landscape" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-slate-950/65" />

      <header className="relative z-10 mx-auto flex w-full max-w-md items-center justify-between gap-3 pt-[env(safe-area-inset-top)]">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white"><Map className="h-5 w-5" /></div>
          <div>
            <h1 className="text-sm font-black text-white">Trip Calculator</h1>
            <p className="text-xs font-semibold text-slate-300">Offline group expenses · v2</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AppButton variant="secondary" size="icon" onClick={onOpenSettings} aria-label="Open appearance settings">
            <Settings2 className="h-5 w-5" />
          </AppButton>
          <AppButton variant="secondary" size={userProfile ? 'standard' : 'icon'} onClick={onOpenCreateProfile} aria-label="Open profile">
            {userProfile ? <><Avatar person={userProfile} size="xs" /><span className="max-w-20 truncate">{userProfile.name}</span></> : <User className="h-5 w-5" />}
          </AppButton>
        </div>
      </header>

      <main className="relative z-10 mx-auto my-auto w-full max-w-md">
        <section className="rounded-2xl border border-white/80 bg-white p-5 text-slate-900 shadow-xl">
          <p className="text-xs font-extrabold text-indigo-700">{userProfile ? `Welcome back, ${userProfile.name}` : 'Get started in a minute'}</p>
          <h2 className="mt-2 text-2xl font-black leading-tight">Split trip expenses without the confusion.</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Track who paid, see who owes whom, and settle with fewer payments—even when you are offline.</p>

          <div className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
            {['Simple NPR and multi-payer splits', 'Works offline on trips and treks', 'Clear balances and activity history'].map((benefit) => (
              <div key={benefit} className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" /> {benefit}
              </div>
            ))}
          </div>

          {!userProfile ? (
            <AppButton size="large" fullWidth className="mt-6" onClick={onOpenCreateProfile}>
              <UserCheck className="h-5 w-5" /> Create my profile
            </AppButton>
          ) : (
            <AppButton size="large" fullWidth className="mt-6" onClick={onOpenCreateTrip}>
              <Plus className="h-5 w-5" /> Create your first trip
            </AppButton>
          )}
          <p className="mt-3 text-center text-xs font-medium text-slate-500">Your data and photos stay on this device.</p>
        </section>
      </main>
    </div>
  );
}
