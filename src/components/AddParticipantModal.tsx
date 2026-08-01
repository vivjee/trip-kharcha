'use client';

import React, { useState } from 'react';
import { Trip, Participant } from '@/types/trip';
import { X, UserPlus } from 'lucide-react';

interface AddParticipantModalProps {
  trip: Trip;
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: Omit<Participant, 'id'>) => void;
}

export default function AddParticipantModal({
  trip,
  isOpen,
  onClose,
  onAddParticipant,
}: AddParticipantModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  if (!isOpen) return null;

  const maleAvatars = ['👦', '🧔', '👨‍🦱', '👱‍♂️', '👨‍🦲', '🧙‍♂️'];
  const femaleAvatars = ['👩', '👩‍🦰', '👧', '👩‍🦱', '👩‍💼', '👩‍🎨'];

  const avatarPool = gender === 'male' ? maleAvatars : femaleAvatars;
  const currentAvatar = avatarPool[trip.participants.length % avatarPool.length];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const colors = ['emerald', 'blue', 'purple', 'amber', 'rose', 'indigo'];
    const assignedColor = colors[trip.participants.length % colors.length];

    onAddParticipant({
      name: name.trim(),
      avatar: currentAvatar,
      color: assignedColor,
    });

    setName('');
    onClose();
  };

  const isValid = name.trim().length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div className="w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Add Member to {trip.name}</h2>
              <p className="text-[10px] text-slate-500 font-medium">Add someone who joined the trip later</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-200/60 flex items-center justify-center text-slate-600 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Avatar Preview */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">
              {currentAvatar}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">
                {name.trim() || 'New Participant'}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                Will join as member #{trip.participants.length + 1}
              </p>
            </div>
          </div>

          {/* Gender Selector */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">Gender Avatar</label>
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setGender('male')}
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
                onClick={() => setGender('female')}
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

          {/* Name Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Participant Name</label>
            <input
              type="text"
              required
              placeholder="Enter member's name..."
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
              disabled={!isValid}
              className="w-2/3 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none disabled:active:scale-100 flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              Add to Trip
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
