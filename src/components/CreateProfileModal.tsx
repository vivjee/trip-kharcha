'use client';

import React, { useState } from 'react';
import { Check, UserRound, X } from 'lucide-react';
import PhotoPicker from '@/components/PhotoPicker';
import { deleteStoredPhoto } from '@/lib/image-storage';
import { UserProfile } from '@/types/trip';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  initialProfile?: UserProfile | null;
}

const avatars = {
  male: ['👦', '🧔', '👨‍🦱', '👱‍♂️', '👨‍🦲', '🧙‍♂️'],
  female: ['👩', '👩‍🦰', '👧', '👩‍🦱', '👩‍💼', '👩‍🎨'],
};

function ProfileForm({ initialProfile, onClose, onSaveProfile }: Omit<CreateProfileModalProps, 'isOpen'>) {
  const [name, setName] = useState(initialProfile?.name || '');
  const [gender, setGender] = useState<'male' | 'female'>(initialProfile?.gender || 'male');
  const [avatar, setAvatar] = useState(initialProfile?.avatar || avatars.male[0]);
  const [photoId, setPhotoId] = useState<string | undefined>(initialProfile?.photoId);

  const updatePhoto = (nextPhotoId?: string) => {
    if (photoId && photoId !== initialProfile?.photoId && photoId !== nextPhotoId) void deleteStoredPhoto(photoId);
    setPhotoId(nextPhotoId);
  };

  const cancel = () => {
    if (photoId && photoId !== initialProfile?.photoId) void deleteStoredPhoto(photoId);
    onClose();
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    if (initialProfile?.photoId && initialProfile.photoId !== photoId) void deleteStoredPhoto(initialProfile.photoId);
    onSaveProfile({
      id: initialProfile?.id || `profile-${Date.now()}`,
      name: name.trim(),
      gender,
      avatar,
      photoId,
    });
    onClose();
  };

  const selectGender = (nextGender: 'male' | 'female') => {
    setGender(nextGender);
    if (!avatars[nextGender].includes(avatar)) setAvatar(avatars[nextGender][0]);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="profile-title">
      <div className="w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden max-h-[94dvh] flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-950 text-white">
          <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center"><UserRound className="w-5 h-5" /></div><div><h2 id="profile-title" className="text-base font-extrabold">{initialProfile ? 'Edit Your Profile' : 'Create Your Profile'}</h2><p className="text-xs text-indigo-200">Your identity across every trip</p></div></div>
          <button onClick={cancel} aria-label="Close profile form" className="w-11 h-11 -mr-2 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-5 overflow-y-auto space-y-5">
          <PhotoPicker kind="profile" photoId={photoId} fallback={<span className="text-4xl">{avatar}</span>} label="Add your photo" helperText="Optional · Tap to use your camera, phone, or an emoji" onChange={updatePhoto} />

          <label className="block text-sm font-bold text-slate-700 space-y-1.5">Your name<input autoFocus type="text" required placeholder="Enter your name" value={name} onChange={(event) => setName(event.target.value)} className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-slate-900 bg-white" /></label>

          <fieldset className="space-y-2"><legend className="text-sm font-bold text-slate-700">Emoji style</legend><div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl text-sm font-bold"><button type="button" onClick={() => selectGender('male')} aria-pressed={gender === 'male'} className={`min-h-11 rounded-lg cursor-pointer ${gender === 'male' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>👦 Male</button><button type="button" onClick={() => selectGender('female')} aria-pressed={gender === 'female'} className={`min-h-11 rounded-lg cursor-pointer ${gender === 'female' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}>👩 Female</button></div></fieldset>

          <fieldset className="space-y-2"><legend className="text-sm font-bold text-slate-700">Emoji fallback</legend><div className="grid grid-cols-6 gap-2">{avatars[gender].map((item) => <button key={item} type="button" onClick={() => setAvatar(item)} aria-pressed={avatar === item} aria-label={`Use ${item} avatar`} className={`aspect-square rounded-full text-xl flex items-center justify-center cursor-pointer border-2 ${avatar === item ? 'bg-indigo-50 border-indigo-500 shadow-sm' : 'bg-slate-50 border-slate-200'}`}>{item}</button>)}</div><p className="text-xs text-slate-500">The emoji appears if your photo is unavailable or removed.</p></fieldset>

          <div className="flex gap-3 pt-2"><button type="button" onClick={cancel} className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-100 cursor-pointer">Cancel</button><button type="submit" disabled={!name.trim()} className="w-2/3 min-h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"><Check className="w-4 h-4" />Save Profile</button></div>
        </form>
      </div>
    </div>
  );
}

export default function CreateProfileModal({ isOpen, ...props }: CreateProfileModalProps) {
  if (!isOpen) return null;
  return <ProfileForm key={props.initialProfile?.id || 'new-profile'} {...props} />;
}
