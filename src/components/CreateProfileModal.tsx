'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/types/trip';
import { X, UserCheck, Sparkles, Check } from 'lucide-react';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

export default function CreateProfileModal({
  isOpen,
  onClose,
  onSaveProfile,
  initialProfile,
}: CreateProfileModalProps) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');

  const maleAvatars = ['👦', '🧔', '👨‍🦱', '👱‍♂️', '👨‍🦲', '🧙‍♂️'];
  const femaleAvatars = ['👩', '👩‍🦰', '👧', '👩‍🦱', '👩‍💼', '👩‍🎨'];

  const avatarPool = gender === 'male' ? maleAvatars : femaleAvatars;
  const [selectedAvatar, setSelectedAvatar] = useState(
    initialProfile?.avatar || avatarPool[0]
  );

  if (!isOpen) return null;

  const handleGenderChange = (newGender: 'male' | 'female') => {
    setGender(newGender);
    const newPool = newGender === 'male' ? maleAvatars : femaleAvatars;
    setSelectedAvatar(newPool[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const profile: UserProfile = {
      id: initialProfile?.id || `user-${Date.now()}`,
      name: name.trim(),
      gender,
      avatar: selectedAvatar,
    };

    onSaveProfile(profile);
    onClose();
  };

  const isFormValid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-indigo-950 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold border border-indigo-500/30">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black leading-tight">
                {initialProfile ? 'Edit Your Profile' : 'Create Your Profile'}
              </h2>
              <p className="text-[10px] text-slate-300 font-medium">Your personal identity across all trips</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto no-scrollbar">
          {/* Avatar Preview Spotlight */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-3xl shadow-sm">
              {selectedAvatar}
            </div>
            <div>
              <p className="text-sm font-black text-slate-900 leading-tight">
                {name.trim() || 'Your Name'}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-500" />
                Default participant for your trips & sync
              </p>
            </div>
          </div>

          {/* Gender Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Gender</label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => handleGenderChange('male')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  gender === 'male'
                    ? 'bg-white text-indigo-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👦 Male
              </button>
              <button
                type="button"
                onClick={() => handleGenderChange('female')}
                className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ${
                  gender === 'female'
                    ? 'bg-white text-purple-700 shadow-2xs font-extrabold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                👩 Female
              </button>
            </div>
          </div>

          {/* Avatar Options Picker */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Choose Avatar</label>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
              {avatarPool.map((av) => (
                <button
                  key={av}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all cursor-pointer border flex-shrink-0 ${
                    selectedAvatar === av
                      ? 'bg-indigo-100 border-indigo-500 scale-110 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {av}
                </button>
              ))}
            </div>
          </div>

          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              required
              placeholder="Enter your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 bg-slate-50/50"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
