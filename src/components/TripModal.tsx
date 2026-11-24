"use client";

import { useDraftState, clearDraft } from "@/lib/drafts";
import SaveStatus, { useSaveForm } from "@/components/SaveStatus";
import React, { useMemo } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Plus,
  Sparkles,
  Trash2,
  Users,
  X,
} from "lucide-react";
import PhotoPicker from "@/components/PhotoPicker";
import { getTodayLocalDate } from "@/lib/date-utils";
import { deleteStoredPhoto } from "@/lib/image-storage";
import {
  generateDefaultChecklist,
  getTripTypeMeta,
  TRIP_TYPES,
} from "@/lib/essentials-templates";
import { Participant, Trip, TripType, UserProfile } from "@/types/trip";

interface TripModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  existingTrips?: Trip[];
  onCreateTrip: (
    newTrip: Omit<
      Trip,
      "id" | "expenses" | "settlements" | "status" | "createdAt"
    >,
    hostParticipantId?: string,
  ) => Promise<boolean>;
}

interface DraftParticipant {
  name: string;
  avatar: string;
  photoId?: string;
  profileId?: string;
  isMe: boolean;
}

const maleAvatars = ["👦", "🧔", "👨‍🦱", "👱‍♂️", "👨‍🦲", "🧙‍♂️"];
const femaleAvatars = ["👩", "👩‍🦰", "👧", "👩‍🦱", "👩‍💼", "👩‍🎨"];

function TripForm({
  userProfile,
  existingTrips = [],
  onClose,
  onCreateTrip,
}: Omit<TripModalProps, "isOpen">) {
  const draftPrefix = "new-trip";
  const { saving, error, run } = useSaveForm();
  const [step, setStep] = useDraftState<1 | 2>(draftPrefix + ":step", 1);
  const [name, setName] = useDraftState(draftPrefix + ":name", "");
  const [tripType, setTripType] = useDraftState<TripType>(
    draftPrefix + ":tripType",
    "short_trek",
  );
  const [startDate, setStartDate] = useDraftState(
    draftPrefix + ":startDate",
    getTodayLocalDate(),
  );
  const [coverPhotoId, setCoverPhotoId] = useDraftState<string | undefined>(
    draftPrefix + ":coverPhotoId",
    undefined,
  );
  const [accentColor, setAccentColor] = useDraftState<string | undefined>(
    draftPrefix + ":accentColor",
    undefined,
  );
  const [participants, setParticipants] = useDraftState<DraftParticipant[]>(
    draftPrefix + ":participants",
    userProfile
      ? [
          {
            name: userProfile.name,
            avatar: userProfile.avatar,
            photoId: userProfile.photoId,
            profileId: userProfile.id,
            isMe: true,
          },
        ]
      : [],
  );
  const [newMemberName, setNewMemberName] = useDraftState(
    draftPrefix + ":newMemberName",
    "",
  );
  const [newMemberGender, setNewMemberGender] = useDraftState<
    "male" | "female"
  >(draftPrefix + ":newMemberGender", "male");

  const suggestedMembers = useMemo(() => {
    const unique = new Map<string, Participant>();
    existingTrips.forEach((trip) =>
      trip.participants.forEach((participant) => {
        const key = participant.name.trim().toLowerCase();
        const alreadyAdded = participants.some(
          (draft) => draft.name.trim().toLowerCase() === key,
        );
        if (
          !alreadyAdded &&
          participant.profileId !== userProfile?.id &&
          !unique.has(key)
        )
          unique.set(key, participant);
      }),
    );
    return [...unique.values()];
  }, [existingTrips, participants, userProfile?.id]);

  const closeAndCleanDraft = () => {
    if (coverPhotoId) void deleteStoredPhoto(coverPhotoId);
    clearDraft(draftPrefix);
    onClose();
  };

  const updateCover = (photoId?: string, color?: string) => {
    if (coverPhotoId && coverPhotoId !== photoId)
      void deleteStoredPhoto(coverPhotoId);
    setCoverPhotoId(photoId);
    setAccentColor(color);
  };

  const pendingMemberName = newMemberName.trim();
  const pendingMemberIsNew =
    Boolean(pendingMemberName) &&
    !participants.some(
      (participant) =>
        participant.name.toLowerCase() === pendingMemberName.toLowerCase(),
    );
  const canCreateTrip = participants.length + (pendingMemberIsNew ? 1 : 0) >= 1;
  const isSoloDraft = participants.length + (pendingMemberIsNew ? 1 : 0) === 1;

  const addMember = () => {
    if (!pendingMemberIsNew) return;
    const pool = newMemberGender === "male" ? maleAvatars : femaleAvatars;
    setParticipants([
      ...participants,
      {
        name: pendingMemberName,
        avatar: pool[participants.length % pool.length],
        isMe: false,
      },
    ]);
    setNewMemberName("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const pendingAvatarPool =
      newMemberGender === "male" ? maleAvatars : femaleAvatars;
    const participantsToCreate = pendingMemberIsNew
      ? [
          ...participants,
          {
            name: pendingMemberName,
            avatar:
              pendingAvatarPool[participants.length % pendingAvatarPool.length],
            isMe: false,
          },
        ]
      : participants;
    if (!name.trim() || participantsToCreate.length < 1) return;
    const colors = ["emerald", "blue", "purple", "amber", "rose", "indigo"];
    let hostId: string | undefined;
    const formattedParticipants = participantsToCreate.map(
      (participant, index): Participant => {
        const id =
          participant.isMe && userProfile
            ? userProfile.id
            : `part-${Date.now()}-${index}`;
        if (participant.isMe) hostId = id;
        return {
          id,
          profileId: participant.profileId,
          name: participant.name,
          avatar: participant.avatar,
          photoId: participant.photoId,
          color: colors[index % colors.length],
        };
      },
    );

    const typeMeta = getTripTypeMeta(tripType);
    if (
      !(await run(() =>
        onCreateTrip(
          {
            name: name.trim(),
            description: typeMeta.description,
            coverImageEmoji: typeMeta.emoji,
            coverPhotoId,
            accentColor,
            currency: "NPR",
            currencySymbol: "रू",
            startDate,
            tripType,
            checklist: generateDefaultChecklist(tripType),
            participants: formattedParticipants,
          },
          hostId || formattedParticipants[0]?.id,
        ),
      ))
    )
      return;
    clearDraft(draftPrefix);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-end md:items-center justify-center md:p-4 animate-pop-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="trip-modal-title"
    >
      <div
        data-long-form
        className="app-modal-sheet w-full max-w-md bg-white rounded-t-[28px] md:rounded-[28px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94dvh]"
      >
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-indigo-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-text-hi flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="trip-modal-title"
                className="text-base font-extrabold text-slate-900"
              >
                {step === 1 ? "Create New Trip" : `Add Members`}
              </h2>
              <p className="text-xs font-semibold text-text-mid">
                Step {step} of 2 ·{" "}
                {step === 1 ? "Trip details & essentials type" : name}
              </p>
            </div>
          </div>
          <button
            onClick={closeAndCleanDraft}
            aria-label="Close trip form"
            className="w-11 h-11 -mr-2 rounded-full bg-slate-200/70 flex items-center justify-center text-slate-600 hover:bg-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={submit}
          className="p-5 overflow-y-auto space-y-4 no-scrollbar"
        >
          <SaveStatus saving={saving} error={error} />
          {step === 1 ? (
            <>
              <details className="tc-optional-photo">
                <summary>Add a cover photo (optional)</summary>
                <PhotoPicker
                  kind="cover"
                  photoId={coverPhotoId}
                  label="Trip cover photo"
                  helperText="You can also add this later in Trip details."
                  onChange={updateCover}
                />
              </details>

              <label className="block text-sm font-bold text-slate-700 space-y-1.5">
                Trip Title
                <input
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Langtang Valley Trek"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                />
              </label>

              <fieldset className="space-y-2">
                <legend className="block text-xs font-extrabold uppercase tracking-wide text-slate-600">
                  Trip Type
                </legend>
                <div className="grid grid-cols-2 gap-2.5">
                  {TRIP_TYPES.map((t) => {
                    const isSelected = tripType === t.type;
                    return (
                      <button
                        key={t.type}
                        type="button"
                        onClick={() => setTripType(t.type)}
                        className={`group relative overflow-hidden rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-indigo-50 border-indigo-600 ring-2 ring-indigo-500/40 shadow-md"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 hover:shadow-xs"
                        }`}
                      >
                        {/* Scenic Image Banner */}
                        <div
                          data-media-overlay
                          className="relative h-20 w-full overflow-hidden bg-slate-100"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={t.image}
                            alt={t.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/20" />

                          {/* Badge tag in top right */}
                          <div className="absolute top-2 right-2 z-10 flex items-center">
                            <span
                              className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 ${
                                isSelected
                                  ? "tc-selected text-white border border-indigo-400/40 shadow-sm"
                                  : "bg-slate-950/75 text-white/95 border border-white/20 backdrop-blur-md shadow-xs"
                              }`}
                            >
                              {isSelected && (
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              )}
                              <span>{t.badge}</span>
                            </span>
                          </div>

                          {/* Trip Title at the bottom with full width */}
                          <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center gap-1.5 min-w-0">
                            <span className="text-sm shrink-0 drop-shadow-sm">
                              {t.emoji}
                            </span>
                            <span className="truncate text-xs font-black text-white drop-shadow-sm">
                              {t.title}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-2.5">
                          <p
                            className={`text-[11px] leading-tight line-clamp-2 ${
                              isSelected
                                ? "text-slate-900 font-bold"
                                : "text-slate-600 font-medium"
                            }`}
                          >
                            {t.tagline}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-text-mid font-medium">
                  Pre-loads your packing & gear essentials from the official
                  catalog.
                </p>
              </fieldset>

              <label className="block text-sm font-bold text-slate-700 space-y-1.5">
                Trip Start Date
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 bg-white"
                />
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAndCleanDraft}
                  className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!name.trim() || !startDate}
                  onClick={() => setStep(2)}
                  className="w-2/3 min-h-12 rounded-xl tc-selected text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-text-mid"
                >
                  Next: Add Members <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-indigo-50 p-3.5 rounded-2xl border border-indigo-100">
                <p className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  Who Is Joining {name}?
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {userProfile
                    ? "Your profile is already included. Add friends to split costs, or go solo."
                    : "Add yourself first, then anyone joining. Going solo works too."}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto no-scrollbar">
                {participants.map((participant, index) => (
                  <div
                    key={`${participant.name}-${index}`}
                    className={`flex min-w-0 items-center gap-2 rounded-xl border p-2 ${participant.isMe ? "bg-purple-50 border-purple-200" : "bg-white border-slate-200"}`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white text-base">
                      {participant.avatar}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-extrabold text-slate-900">
                        {participant.name}
                      </p>
                      {participant.isMe && (
                        <span className="text-xs font-black text-text-hi">
                          You
                        </span>
                      )}
                    </div>
                    {!participant.isMe && (
                      <button
                        type="button"
                        onClick={() =>
                          setParticipants(
                            participants.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                        aria-label={`Remove ${participant.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-text-mid hover:bg-rose-50 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {suggestedMembers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-extrabold text-indigo-900 uppercase tracking-wide flex items-center gap-1">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Recent Friends
                  </p>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {suggestedMembers.map((participant) => (
                      <button
                        key={participant.id}
                        type="button"
                        onClick={() =>
                          setParticipants([
                            ...participants,
                            {
                              name: participant.name,
                              avatar: participant.avatar,
                              photoId: participant.photoId,
                              profileId: participant.profileId,
                              isMe: false,
                            },
                          ])
                        }
                        className="min-h-11 px-3 rounded-xl bg-indigo-50 border border-indigo-200 text-sm font-bold text-indigo-950 whitespace-nowrap cursor-pointer"
                      >
                        {participant.avatar} {participant.name}{" "}
                        <Plus className="w-3.5 h-3.5 inline" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-slate-600 uppercase">
                    {participants.length ? "Add A Friend" : "Add Yourself"}
                  </span>
                  <div className="flex rounded-lg bg-slate-200 p-1 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setNewMemberGender("male")}
                      className={`min-h-10 rounded-md px-3 cursor-pointer ${newMemberGender === "male" ? "bg-white text-text-hi shadow-sm" : "text-slate-600"}`}
                    >
                      👦 Male
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMemberGender("female")}
                      className={`min-h-10 rounded-md px-3 cursor-pointer ${newMemberGender === "female" ? "bg-white text-text-hi shadow-sm" : "text-slate-600"}`}
                    >
                      👩 Female
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    aria-label={participants.length ? "Friend’s name" : "Your name"}
                    placeholder={participants.length ? "Friend’s name" : "Your name"}
                    value={newMemberName}
                    onChange={(event) => setNewMemberName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addMember();
                      }
                    }}
                    className="min-h-12 min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-semibold"
                  />
                  <button
                    type="button"
                    onClick={addMember}
                    disabled={!pendingMemberIsNew}
                    className="tc-add-button"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
              {!canCreateTrip ? (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Add at least one person to start the trip.
                </p>
              ) : (
                isSoloDraft && (
                  <p className="text-xs font-semibold text-text-mid">
                    Solo trip: expenses are tracked just for you. You can add
                    members later from Trip details.
                  </p>
                )
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 min-h-12 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  type="submit"
                  aria-disabled={saving}
                  disabled={!canCreateTrip}
                  className="w-2/3 min-h-12 rounded-xl tc-selected text-white font-extrabold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-200 disabled:text-text-mid"
                >
                  <Check className="w-4 h-4" />
                  Create & Plan Trip
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}

export default function TripModal({ isOpen, ...props }: TripModalProps) {
  if (!isOpen) return null;
  return (
    <TripForm
      key={`new-trip-${props.existingTrips?.length || 0}-${props.userProfile?.id || "guest"}`}
      existingTrips={props.existingTrips || []}
      {...props}
    />
  );
}
