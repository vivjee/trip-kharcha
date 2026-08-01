'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Trip, Participant, UserProfile } from '@/types/trip';
import { X, Plus, Trash2, MapPin, Users, ArrowRight, ArrowLeft, Check, Sparkles } from 'lucide-react';

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  existingTrips?: Trip[];
  onCreateTrip: (
    newTrip: Omit<Trip, 'id' | 'expenses' | 'settlements' | 'status' | 'createdAt'>,
    hostParticipantId?: string
  ) => void;
}

export default function TripModal({
  isOpen,
  onClose,
  userProfile,
  existingTrips = [],
  onCreateTrip,
}: TripModalProps) {
  const getTodayLocalDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<string>(getTodayLocalDate());

  // Step 2 Participants (Automatically pre-populates with saved user profile as Host)
  const [participants, setParticipants] = useState<{ name: string; avatar: string; isMe: boolean }[]>([]);

  useEffect(() => {
    if (isOpen) {
      setStartDate(getTodayLocalDate());
      if (userProfile) {
        setParticipants([
          { name: userProfile.name, avatar: userProfile.avatar, isMe: true }
        ]);
      } else {
        setParticipants([]);
      }
    }
  }, [isOpen, userProfile]);

  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberGender, setNewMemberGender] = useState<'male' | 'female'>('male');

  // Extract unique past members from previous trips excluding members already added to draft
  const pastSuggestedMembers = useMemo(() => {
    if (!existingTrips || existingTrips.length === 0) return [];
    const memberMap = new Map<string, Participant>();
    existingTrips.forEach((t) => {
      t.participants.forEach((p) => {
        const nameKey = p.name.trim().toLowerCase();
        const isAlreadyAdded = participants.some(
          (dp) => dp.name.trim().toLowerCase() === nameKey
        );
        if (!isAlreadyAdded && !memberMap.has(nameKey)) {
          memberMap.set(nameKey, p);
        }
      });
    });
    return Array.from(memberMap.values());
  }, [existingTrips, participants]);

  if (!isOpen) return null;

  const maleAvatars = ['👦', '🧔', '👨‍🦱', '👱‍♂️', '👨‍🦲', '🧙‍♂️'];
  const femaleAvatars = ['👩', '👩‍🦰', '👧', '👩‍🦱', '👩‍💼', '👩‍🎨'];

  const isStep1Valid = name.trim().length > 0 && startDate.length > 0;
  const isStep2Valid = participants.length >= 2;

  const handleAddMember = () => {
    if (!newMemberName.trim()) return;

    const avatarPool = newMemberGender === 'male' ? maleAvatars : femaleAvatars;
    const selectedAvatar = avatarPool[participants.length % avatarPool.length];

    setParticipants([
      ...participants,
      { name: newMemberName.trim(), avatar: selectedAvatar, isMe: false },
    ]);
    setNewMemberName('');
  };

  const handleAddSuggestedMember = (p: Participant) => {
    setParticipants([
      ...participants,
      { name: p.name, avatar: p.avatar, isMe: false },
    ]);
  };

  const handleRemoveMember = (idx: number) => {
    setParticipants(participants.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || participants.length < 2) return;

    const colors = ['emerald', 'blue', 'purple', 'amber', 'rose', 'indigo'];

    let hostId: string | undefined = undefined;

    const formattedParticipants: Participant[] = participants.map((p, idx) => {
      const partId = `part-${Date.now()}-${idx}`;
      if (p.isMe) {
        hostId = partId;
      }
      return {
        id: partId,
        name: p.name,
        avatar: p.avatar,
        color: colors[idx % colors.length],
      };
    });

    if (!hostId && formattedParticipants.length > 0) {
      hostId = formattedParticipants[0].id;
    }

    onCreateTrip(
      {
        name: name.trim(),
        description: description.trim() || 'Trip expense tracking',
        coverImageEmoji: '',
        currency: 'NPR',
        currencySymbol: 'रू',
        startDate: startDate || new Date().toISOString().split('T')[0],
        participants: formattedParticipants,
      },
      hostId
    );

    // Reset Form
    setName('');
    setDescription('');
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {step === 1 ? 'Create New Trip' : `Add Trip Members (${name})`}
              </h2>
              <p className="text-[10px] font-semibold text-slate-500">
                Step {step} of 2 • {step === 1 ? 'Trip Details' : 'Add Friends'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 no-scrollbar">
          {step === 1 ? (
            <>
              {/* Trip Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trip Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pokhara Trek, Chitwan Safari"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 bg-slate-50/50"
                />
              </div>

              {/* Start Date Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Trip Start Date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 text-xs font-bold text-slate-900 bg-slate-50/50 cursor-pointer"
                />
              </div>

              {/* Step 1 Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!isStep1Valid}
                  onClick={() => setStep(2)}
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1.5"
                >
                  Next: Add Members
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Step 2: Add Members */}
              <div className="bg-indigo-50/60 p-3 rounded-2xl border border-indigo-100 text-xs font-semibold text-slate-700 space-y-1">
                <p className="font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  Add Friends to {name}
                </p>
                <p className="text-[11px] text-slate-500">
                  Your profile is automatically included. Add friends who are joining you!
                </p>
              </div>

              {/* Member List */}
              <div className="space-y-2 max-h-44 overflow-y-auto no-scrollbar py-1">
                {participants.map((p, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                      p.isMe
                        ? 'bg-purple-50 border-purple-300 shadow-2xs'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-lg shadow-2xs">
                        {p.avatar}
                      </span>
                      <div>
                        <p className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                          <span>{p.name}</span>
                          {p.isMe && (
                            <span className="text-[9px] font-black text-purple-700 bg-purple-100 px-2 py-0.2 rounded-full uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {!p.isMe && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Remove participant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {participants.length < 2 && (
                <p className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                  ⚠️ Add at least 1 friend (minimum 2 total members) to start your trip.
                </p>
              )}

              {/* Quick-Add Recent Friends Section (If past trips have members) */}
              {pastSuggestedMembers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Quick-Add Recent Friends
                    </span>
                    <span className="text-[9px] text-slate-400 font-semibold">
                      From past trips
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {pastSuggestedMembers.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleAddSuggestedMember(p)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-950 text-xs font-bold transition-all active:scale-95 cursor-pointer flex-shrink-0 shadow-2xs group"
                      >
                        <span className="text-sm">{p.avatar}</span>
                        <span>{p.name}</span>
                        <Plus className="w-3.5 h-3.5 text-indigo-600 group-hover:scale-125 transition-transform stroke-[2.5]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Friend Form */}
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-slate-600 uppercase">Add New Friend</span>
                  <div className="flex items-center bg-slate-200 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setNewMemberGender('male')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        newMemberGender === 'male'
                          ? 'bg-white text-indigo-700 font-extrabold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      👦 Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMemberGender('female')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        newMemberGender === 'female'
                          ? 'bg-white text-purple-700 font-extrabold shadow-2xs'
                          : 'text-slate-600'
                      }`}
                    >
                      👩 Female
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter member's name..."
                    value={newMemberName}
                    onChange={(e) => setNewMemberName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddMember}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

              {/* Step 2 Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 cursor-pointer flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <button
                  type="submit"
                  disabled={!isStep2Valid}
                  className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Create & Start Trip
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
