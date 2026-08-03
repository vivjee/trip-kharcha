'use client';

import React, { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, MapPin, Plus, Sparkles, Trash2, Users, X } from 'lucide-react';
import PhotoPicker from '@/components/PhotoPicker';
import { getTodayLocalDate } from '@/lib/date-utils';
import { deleteStoredPhoto } from '@/lib/image-storage';
import { Participant, Trip, UserProfile } from '@/types/trip';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  existingTrips?: Trip[];
  onCreateTrip: (
    newTrip: Omit<Trip, 'id' | 'expenses' | 'settlements' | 'status' | 'createdAt'>,
    hostParticipantId?: string,
  ) => void;
}

interface DraftParticipant {
  name: string;
  avatar: string;
  photoId?: string;
  profileId?: string;
  isMe: boolean;
}

const maleAvatars = ['👦', '🧔', '👨‍🦱', '👱‍♂️', '👨‍🦲', '🧙‍♂️'];
const femaleAvatars = ['👩', '👩‍🦰', '👧', '👩‍🦱', '👩‍💼', '👩‍🎨'];

function TripForm({ userProfile, existingTrips = [], onClose, onCreateTrip }: Omit<TripModalProps, 'isOpen'>) {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(getTodayLocalDate());
  const [coverPhotoId, setCoverPhotoId] = useState<string>();
  const [accentColor, setAccentColor] = useState<string>();
  const [participants, setParticipants] = useState<DraftParticipant[]>(userProfile ? [{
    name: userProfile.name,
    avatar: userProfile.avatar,
    photoId: userProfile.photoId,
    profileId: userProfile.id,
    isMe: true,
  }] : []);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberGender, setNewMemberGender] = useState<'male' | 'female'>('male');

  const suggestedMembers = useMemo(() => {
    const unique = new Map<string, Participant>();
    existingTrips.forEach((trip) => trip.participants.forEach((participant) => {
      const key = participant.name.trim().toLowerCase();
      const alreadyAdded = participants.some((draft) => draft.name.trim().toLowerCase() === key);
      if (!alreadyAdded && participant.profileId !== userProfile?.id && !unique.has(key)) unique.set(key, participant);
    }));
    return [...unique.values()];
  }, [existingTrips, participants, userProfile?.id]);

  const closeAndCleanDraft = () => {
    if (coverPhotoId) void deleteStoredPhoto(coverPhotoId);
    onClose();
  };

  const updateCover = (photoId?: string, color?: string) => {
    if (coverPhotoId && coverPhotoId !== photoId) void deleteStoredPhoto(coverPhotoId);
    setCoverPhotoId(photoId);
    setAccentColor(color);
  };

  const pendingMemberName = newMemberName.trim();
  const pendingMemberIsNew = Boolean(pendingMemberName) && !participants.some((participant) => participant.name.toLowerCase() === pendingMemberName.toLowerCase());
  const canCreateTrip = participants.length >= 2 || pendingMemberIsNew;

  const addMember = () => {
    if (!pendingMemberIsNew) return;
    const pool = newMemberGender === 'male' ? maleAvatars : femaleAvatars;
    setParticipants([...participants, { name: pendingMemberName, avatar: pool[participants.length % pool.length], isMe: false }]);
    setNewMemberName('');
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const pendingAvatarPool = newMemberGender === 'male' ? maleAvatars : femaleAvatars;
    const participantsToCreate = pendingMemberIsNew
      ? [...participants, { name: pendingMemberName, avatar: pendingAvatarPool[participants.length % pendingAvatarPool.length], isMe: false }]
      : participants;
    if (!name.trim() || participantsToCreate.length < 2) return;
    const colors = ['emerald', 'blue', 'purple', 'amber', 'rose', 'indigo'];
    let hostId: string | undefined;
    const formattedParticipants = participantsToCreate.map((participant, index): Participant => {
      const id = participant.isMe && userProfile ? userProfile.id : `part-${Date.now()}-${index}`;
      if (participant.isMe) hostId = id;
      return {
        id,
        profileId: participant.profileId,
        name: participant.name,
        avatar: participant.avatar,
        photoId: participant.photoId,
        color: colors[index % colors.length],
      };
    });
    onCreateTrip({
      name: name.trim(),
      description: 'Trip expense tracking',
      coverImageEmoji: '🏔️',
      coverPhotoId,
      accentColor,
      currency: 'NPR',
      currencySymbol: 'रू',
      startDate,
      participants: formattedParticipants,
    }, hostId || formattedParticipants[0]?.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in" role="dialog" aria-modal="true" aria-labelledby="trip-modal-title">
      <div className="w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94dvh]">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/70">
          <div className="flex items-center gap-2.5"><div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center"><MapPin className="w-5 h-5" /></div><div><h2 id="trip-modal-title" className="text-base font-extrabold text-slate-900">{step === 1 ? 'Create New Trip' : `Add Members`}</h2><p className="text-xs font-semibold text-slate-500">Step {step} of 2 · {step === 1 ? 'Trip details' : name}</p></div></div>
          <button onClick={closeAndCleanDraft} aria-label="Close trip form" className="w-11 h-11 -mr-2 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="p-5 overflow-y-auto space-y-5 no-scrollbar">
          {step === 1 ? (
            <>
              <PhotoPicker kind="cover" photoId={coverPhotoId} label="Add a trip cover" helperText="Optional · You can change this anytime" onChange={updateCover} />
              <label className="block text-sm font-bold text-slate-700 space-y-1.5">Trip title<input autoFocus type="text" required placeholder="e.g. Pokhara Weekend" value={name} onChange={(event) => setName(event.target.value)} className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 bg-white" /></label>
              <label className="block text-sm font-bold text-slate-700 space-y-1.5">Trip start date<input type="date" required value={startDate} onChange={(event) => setStartDate(event.target.value)} className="w-full px-3.5 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-sm font-bold text-slate-900 bg-white" /></label>
              <div className="flex gap-3 pt-2"><button type="button" onClick={closeAndCleanDraft} className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm cursor-pointer">Cancel</button><button type="button" disabled={!name.trim() || !startDate} onClick={() => setStep(2)} className="w-2/3 min-h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400">Next: Add Members <ArrowRight className="w-4 h-4" /></button></div>
            </>
          ) : (
            <>
              <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-100"><p className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5"><Users className="w-4 h-4" />Who is joining {name}?</p><p className="text-xs text-slate-600 mt-1">Your profile is already included.</p></div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                {participants.map((participant, index) => (
                  <div key={`${participant.name}-${index}`} className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 ${participant.isMe ? 'bg-purple-50 border-purple-200' : 'bg-white border-slate-200'}`}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-base">{participant.avatar}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-slate-900">{participant.name}</p>
                      {participant.isMe && <span className="text-[9px] font-black uppercase text-purple-700">You</span>}
                    </div>
                    {!participant.isMe && (
                      <button type="button" onClick={() => setParticipants(participants.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove ${participant.name}`} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {suggestedMembers.length > 0 && <div className="space-y-2"><p className="text-xs font-extrabold text-indigo-900 uppercase tracking-wide flex items-center gap-1"><Sparkles className="w-4 h-4 text-amber-500" />Recent friends</p><div className="flex gap-2 overflow-x-auto no-scrollbar">{suggestedMembers.map((participant) => <button key={participant.id} type="button" onClick={() => setParticipants([...participants, { name: participant.name, avatar: participant.avatar, photoId: participant.photoId, profileId: participant.profileId, isMe: false }])} className="min-h-11 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-sm font-bold text-indigo-950 whitespace-nowrap cursor-pointer">{participant.avatar} {participant.name} <Plus className="w-3.5 h-3.5 inline" /></button>)}</div></div>}

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between"><span className="text-xs font-extrabold text-slate-600 uppercase">Add a friend</span><div className="flex bg-slate-200 p-1 rounded-lg text-xs font-bold"><button type="button" onClick={() => setNewMemberGender('male')} className={`px-3 py-1 rounded-md cursor-pointer ${newMemberGender === 'male' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'}`}>👦 Male</button><button type="button" onClick={() => setNewMemberGender('female')} className={`px-3 py-1 rounded-md cursor-pointer ${newMemberGender === 'female' ? 'bg-white text-purple-700 shadow-sm' : 'text-slate-600'}`}>👩 Female</button></div></div>
                <div className="flex gap-2"><input type="text" placeholder="Friend’s name" value={newMemberName} onChange={(event) => setNewMemberName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addMember(); } }} className="flex-1 min-w-0 px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-semibold bg-white" /><button type="button" onClick={addMember} className="min-w-20 rounded-xl bg-slate-900 text-white font-bold text-sm cursor-pointer"><Plus className="w-4 h-4 inline mr-1" />Add</button></div>
              </div>
              {!canCreateTrip && <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">Add at least one friend to start the trip.</p>}
              <div className="flex gap-3 pt-2"><button type="button" onClick={() => setStep(1)} className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center gap-1 cursor-pointer"><ArrowLeft className="w-4 h-4" />Back</button><button type="submit" disabled={!canCreateTrip} className="w-2/3 min-h-12 rounded-xl bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"><Check className="w-4 h-4" />Create & Start Trip</button></div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function TripModal({ isOpen, ...props }: TripModalProps) {
  if (!isOpen) return null;
  return <TripForm key={`new-trip-${props.existingTrips?.length || 0}-${props.userProfile?.id || 'guest'}`} existingTrips={props.existingTrips || []} {...props} />;
}
