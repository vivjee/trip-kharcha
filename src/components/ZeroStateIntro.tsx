'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { UserProfile } from '@/types/trip';
import { Plus, Sparkles, User, UserCheck, CheckCircle2 } from 'lucide-react';
import Avatar from '@/components/Avatar';

interface ZeroStateIntroProps {
  userProfile: UserProfile | null;
  onOpenCreateProfile: () => void;
  onOpenCreateTrip: () => void;
}

export default function ZeroStateIntro({
  userProfile,
  onOpenCreateProfile,
  onOpenCreateTrip,
}: ZeroStateIntroProps) {
  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between p-4 overflow-hidden select-none">
      {/* Scenic Nepal Mountain Background - Fills 100% Full Width & Height */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/nepal_hero.jpg"
          alt="Nepal Mountain Landscape"
          fill
          quality={90}
          priority
          className="object-cover object-center scale-105 filter brightness-[0.55] contrast-110"
        />
        {/* Luxury Dark Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/50 to-slate-950/95" />
      </div>

      {/* Top Branding Header */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 pt-2 flex items-center justify-between w-full max-w-md mx-auto"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-lg shadow-lg">
            🏔️
          </div>
          <div>
            <h1 className="text-xs font-black text-white tracking-wide">Trip Calculator</h1>
            <p className="text-[9px] font-extrabold text-indigo-300 uppercase tracking-widest">
              Nepal Edition · v2
            </p>
          </div>
        </div>

        {userProfile ? (
          <button
            onClick={onOpenCreateProfile}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white text-[10px] font-bold border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
          >
            <Avatar person={userProfile} size="xs" />
            <span>{userProfile.name}</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreateProfile}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/30 backdrop-blur-md text-purple-200 text-[10px] font-bold border border-purple-400/40 hover:bg-purple-500/40 transition-all cursor-pointer"
          >
            <User className="w-3 h-3" />
            <span>Setup Profile</span>
          </button>
        )}
      </motion.div>

      {/* Perfectly Centered Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="relative z-10 my-auto py-2 space-y-4 text-center max-w-md mx-auto w-full"
      >
        {/* Main Glassmorphism Welcome Card */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-3xl border border-white/15 shadow-2xl text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
              <Sparkles className="w-3 h-3 text-amber-300" />
              {userProfile ? `Welcome back, ${userProfile.name}!` : 'First Time Setup'}
            </span>
            <span className="text-[10px] font-black text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
              Clean Slate
            </span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight tracking-tight">
              Track & Split Group Expenses Effortlessly
            </h2>
            <p className="text-[11px] text-slate-300 font-medium leading-relaxed">
              Fast, offline-first expense tracking tailored for Nepalese trips, treks, and group hangouts.
            </p>
          </div>

          {/* Quick Core Benefits */}
          <div className="pt-1 space-y-1.5 text-[11px] text-slate-200 font-semibold">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>NPR (रू) multi-payer expense splits</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Works 100% offline in remote Nepal & treks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Simplified debt calculation & audit history</span>
            </div>
          </div>
        </div>

        {/* Primary Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="pt-1"
        >
          {!userProfile ? (
            <button
              onClick={onOpenCreateProfile}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-xl shadow-purple-950/40 border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4 stroke-[2.5]" />
              Create My Profile
            </button>
          ) : (
            <button
              onClick={onOpenCreateTrip}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-xs shadow-xl shadow-indigo-950/40 border border-white/20 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Create Your First Trip
            </button>
          )}
        </motion.div>
      </motion.div>

      {/* Bottom Spacer */}
      <div className="relative z-10 pb-2" />
    </div>
  );
}
