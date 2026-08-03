'use client';

import React, { useState } from 'react';
import type { Participant, Trip } from '@/types/trip';
import { Check, Pencil, Trash2, UserPlus, Users, X } from 'lucide-react';
import Avatar from '@/components/Avatar';

interface AddParticipantModalProps {
  trip: Trip;
  currentParticipantId: string;
  isOpen: boolean;
  onClose: () => void;
  onAddParticipant: (participant: Omit<Participant, 'id'>) => void;
  onUpdateParticipant: (participantId: string, name: string) => void;
  onRemoveParticipant: (participantId: string) => void;
}

const maleAvatars = ['👦', '🧔', '👨‍🦱', '👱‍♂️', '👨‍🦲', '🧙‍♂️'];
const femaleAvatars = ['👩', '👩‍🦰', '👧', '👩‍🦱', '👩‍💼', '👩‍🎨'];

export default function AddParticipantModal({
  trip,
  currentParticipantId,
  isOpen,
  onClose,
  onAddParticipant,
  onUpdateParticipant,
  onRemoveParticipant,
}: AddParticipantModalProps) {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [editingParticipantId, setEditingParticipantId] = useState<string>();
  const [editingName, setEditingName] = useState('');

  if (!isOpen) return null;

  const avatarPool = gender === 'male' ? maleAvatars : femaleAvatars;
  const currentAvatar = avatarPool[trip.participants.length % avatarPool.length];

  const participantIsUsed = (participantId: string) => (
    trip.expenses.some((expense) => (
      expense.paidById === participantId
      || expense.payers?.some((payer) => payer.participantId === participantId)
      || expense.includedParticipantIds.includes(participantId)
      || expense.shares?.some((share) => share.participantId === participantId)
    ))
    || trip.settlements.some((settlement) => (
      settlement.fromParticipantId === participantId
      || settlement.toParticipantId === participantId
    ))
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;

    const colors = ['emerald', 'blue', 'purple', 'amber', 'rose', 'indigo'];
    onAddParticipant({
      name: name.trim(),
      avatar: currentAvatar,
      color: colors[trip.participants.length % colors.length],
    });
    setName('');
  };

  const beginEditing = (participant: Participant) => {
    setEditingParticipantId(participant.id);
    setEditingName(participant.name);
  };

  const saveEditing = () => {
    if (!editingParticipantId || !editingName.trim()) return;
    onUpdateParticipant(editingParticipantId, editingName.trim());
    setEditingParticipantId(undefined);
    setEditingName('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end md:items-center justify-center p-0 md:p-4 animate-pop-in">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="manage-members-title"
        className="w-full max-w-md max-h-[92dvh] bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2 id="manage-members-title" className="text-sm font-bold text-slate-900 truncate">Manage Trip Members</h2>
              <p className="text-[10px] text-slate-500 font-medium truncate">{trip.name} · {trip.participants.length} people</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close member manager"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          <section aria-labelledby="current-members-title" className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 id="current-members-title" className="text-xs font-black text-slate-900">Current members</h3>
              <span className="text-[10px] font-bold text-slate-400">Rename or remove unused people</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {trip.participants.map((participant) => {
                const isEditing = editingParticipantId === participant.id;
                const isCurrentUser = participant.id === currentParticipantId;
                const isUsed = participantIsUsed(participant.id);
                const canRemove = !isCurrentUser && !isUsed && trip.participants.length > 1;
                const removeReason = isCurrentUser
                  ? 'Your active identity cannot be removed'
                  : isUsed
                    ? 'This member appears in expenses or settlements'
                    : trip.participants.length <= 1
                      ? 'A trip needs at least one member'
                      : 'Remove member';

                return (
                  <div key={participant.id} className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar person={participant} size="xs" />
                      <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <input
                          autoFocus
                          value={editingName}
                          onChange={(event) => setEditingName(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter') saveEditing();
                            if (event.key === 'Escape') setEditingParticipantId(undefined);
                          }}
                          aria-label={`Rename ${participant.name}`}
                          className="min-h-11 w-full rounded-xl border border-indigo-300 bg-white px-2 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        />
                      ) : (
                        <>
                          <p className="truncate text-sm font-black text-slate-900">{participant.name}</p>
                          <p className="truncate text-xs font-semibold text-slate-500">{isCurrentUser ? 'You' : isUsed ? 'In trip records' : 'No records'}</p>
                        </>
                      )}
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {isEditing ? (
                        <button type="button" onClick={saveEditing} disabled={!editingName.trim()} aria-label={`Save ${participant.name}`} className="flex h-11 items-center justify-center rounded-xl bg-indigo-600 text-white disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"><Check className="w-4 h-4" /></button>
                      ) : (
                      <button
                        type="button"
                        onClick={() => beginEditing(participant)}
                        aria-label={`Rename ${participant.name}`}
                        className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:text-indigo-700 cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      )}

                    <button
                      type="button"
                      onClick={() => canRemove && onRemoveParticipant(participant.id)}
                      disabled={!canRemove}
                      title={removeReason}
                      aria-label={`${removeReason}: ${participant.name}`}
                      className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-rose-600 hover:bg-rose-50 cursor-pointer disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="h-px bg-slate-200" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-900">Add someone new</h3>
              <p className="mt-0.5 text-[10px] font-medium text-slate-500">Photos stay personal; trip members use lightweight avatars.</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="w-11 h-11 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl shadow-2xs">{currentAvatar}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-black text-slate-900">{name.trim() || 'New member'}</p>
                <div className="mt-1 flex gap-1 rounded-xl bg-slate-200/70 p-0.5">
                  {(['male', 'female'] as const).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setGender(option)}
                      className={`min-h-10 flex-1 rounded-lg px-2 text-xs font-extrabold capitalize cursor-pointer ${gender === option ? 'bg-white text-indigo-700 shadow-2xs' : 'text-slate-500'}`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="new-member-name" className="block text-xs font-bold text-slate-700 mb-1">Member name</label>
              <input
                id="new-member-name"
                type="text"
                required
                maxLength={50}
                placeholder="Enter their name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="flex min-h-12 w-full items-center justify-center gap-1.5 rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-sm transition-colors hover:bg-indigo-700 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <UserPlus className="w-4 h-4" />
              Add to Trip
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
