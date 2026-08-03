'use client';

import React, { useState, useEffect } from 'react';
import { Trip, Expense, Settlement, SimplifiedDebt, Participant, UserProfile } from '@/types/trip';
import { calculateSimplifiedDebts } from '@/lib/debt-simplification';
import { loadTripsFromStorage, saveTripsToStorage, loadUserProfileFromStorage, saveUserProfileToStorage } from '@/lib/storage';
import { appendAuditLog, createAuditEntry } from '@/lib/audit';
import { deleteStoredPhoto } from '@/lib/image-storage';

import { motion, AnimatePresence } from 'framer-motion';

// Components
import MobileFrame from '@/components/MobileFrame';
import Header from '@/components/Header';
import Navigation, { TabType } from '@/components/Navigation';
import TripDashboard from '@/components/TripDashboard';
import ExpensesView from '@/components/ExpensesView';
import BalancesView from '@/components/BalancesView';
import AnalyticsView from '@/components/AnalyticsView';
import ActivityLogView from '@/components/ActivityLogView';
import ZeroStateIntro from '@/components/ZeroStateIntro';
import TripsHubView from '@/components/TripsHubView';
import AddExpenseModal from '@/components/AddExpenseModal';
import SettleUpModal from '@/components/SettleUpModal';
import TripModal from '@/components/TripModal';
import EditTripModal, { type TripDetailsUpdate } from '@/components/EditTripModal';
import ShareSummaryModal from '@/components/ShareSummaryModal';
import CompleteTripModal from '@/components/CompleteTripModal';
import ReopenTripModal from '@/components/ReopenTripModal';
import AddParticipantModal from '@/components/AddParticipantModal';
import SyncTripModal from '@/components/SyncTripModal';
import ClaimIdentityModal from '@/components/ClaimIdentityModal';
import CreateProfileModal from '@/components/CreateProfileModal';
import Toast from '@/components/Toast';
import AppearanceSettings from '@/components/AppearanceSettings';

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  const [identityByTripId, setIdentityByTripId] = useState<Record<string, string>>({});

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isEditTripOpen, setIsEditTripOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCompleteTripOpen, setIsCompleteTripOpen] = useState(false);
  const [isReopenTripOpen, setIsReopenTripOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isClaimIdentityOpen, setIsClaimIdentityOpen] = useState(false);
  const [currentParticipantId, setCurrentParticipantId] = useState<string>('');
  const [presetDebt, setPresetDebt] = useState<SimplifiedDebt | undefined>(undefined);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | undefined>(undefined);
  const [settlementToEdit, setSettlementToEdit] = useState<Settlement | undefined>(undefined);

  // Load from LocalStorage on mount
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const data = loadTripsFromStorage();
      const savedProfile = loadUserProfileFromStorage();
      setTrips(data.trips);
      setActiveTripId(data.activeTripId);
      setIdentityByTripId(data.identityByTripId);
      setUserProfile(savedProfile);

      const activeTrip = data.trips.find((trip) => trip.id === data.activeTripId);
      const linkedParticipant = activeTrip?.participants.find((participant) =>
        participant.id === data.identityByTripId[activeTrip.id]
        || participant.profileId === savedProfile?.id
        || participant.id === savedProfile?.id,
      );
      setCurrentParticipantId(linkedParticipant?.id || '');
      setIsLoaded(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleSaveProfile = (profile: UserProfile) => {
    const previousProfile = userProfile;
    setUserProfile(profile);
    saveUserProfileToStorage(profile);
    setTrips((currentTrips) => currentTrips.map((trip) => ({
      ...trip,
      participants: trip.participants.map((participant) => {
        const identityId = identityByTripId[trip.id];
        const isSameProfile = participant.profileId === profile.id
          || participant.id === profile.id
          || participant.id === identityId
          || (!participant.profileId && previousProfile?.name === participant.name && participant.id === identityId);
        return isSameProfile
          ? { ...participant, profileId: profile.id, name: profile.name, avatar: profile.avatar, photoId: profile.photoId }
          : participant;
      }),
    })));
    setCurrentParticipantId(activeTripId ? identityByTripId[activeTripId] || profile.id : profile.id);
    showToast(`Profile set to ${profile.avatar} ${profile.name}!`);
  };

  // Save to LocalStorage on updates
  useEffect(() => {
    if (isLoaded) saveTripsToStorage(trips, activeTripId, identityByTripId);
  }, [trips, activeTripId, identityByTripId, isLoaded]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-extrabold text-slate-400">Loading Nepal Trips...</p>
        </div>
      </div>
    );
  }

  const currentTrip = trips.find((t) => t.id === activeTripId);

  if (isAppearanceOpen) {
    return <AppearanceSettings onClose={() => setIsAppearanceOpen(false)} />;
  }

  const simplifiedDebts = currentTrip
    ? calculateSimplifiedDebts(currentTrip)
    : [];

  // Handlers
  const handleSelectTrip = (id: string) => {
    setActiveTripId(id);
    setActiveTab('dashboard');
    const trip = trips.find((item) => item.id === id);
    const participant = trip?.participants.find((item) =>
      item.id === identityByTripId[id]
      || item.profileId === userProfile?.id
      || item.id === userProfile?.id,
    );
    setCurrentParticipantId(participant?.id || '');
  };

  const handleCloseTrip = () => {
    setActiveTripId('');
  };

  const handleCreateTrip = (
    newTripData: Omit<Trip, 'id' | 'expenses' | 'settlements' | 'status' | 'createdAt'>,
    hostParticipantId?: string
  ) => {
    const newId = `trip-${Date.now()}`;
    const newTrip: Trip = {
      ...newTripData,
      id: newId,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expenses: [],
      settlements: [],
      auditLogs: [],
    };

    const actor = newTrip.participants.find((participant) => participant.id === hostParticipantId);
    newTrip.auditLogs = [createAuditEntry('CREATE_TRIP', `Created trip “${newTrip.name}”`, actor)];

    setTrips([newTrip, ...trips]);
    setActiveTripId(newId);

    if (hostParticipantId) {
      setCurrentParticipantId(hostParticipantId);
      setIdentityByTripId((current) => ({ ...current, [newId]: hostParticipantId }));
    }

    showToast(`Trip "${newTrip.name}" created!`);
  };

  const handleSaveExpense = (expenseData: Omit<Expense, 'id'>, expenseId?: string) => {
    if (!currentTrip) return;
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const now = new Date().toISOString();
    const savedExpense: Expense = {
      ...expenseData,
      id: expenseId || `exp-${Date.now()}`,
      createdAt: expenseData.createdAt || now,
      updatedAt: now,
      createdByParticipantId: expenseData.createdByParticipantId || actor?.id,
    };
    const expenses = expenseId
      ? currentTrip.expenses.map((expense) => expense.id === expenseId ? savedExpense : expense)
      : [savedExpense, ...currentTrip.expenses];
    const updatedTrip = appendAuditLog(
      { ...currentTrip, expenses },
      expenseId ? 'EDIT_EXPENSE' : 'ADD_EXPENSE',
      `${expenseId ? 'Updated' : 'Added'} ${savedExpense.title} (${currentTrip.currencySymbol} ${savedExpense.amount.toLocaleString()})`,
      actor,
    );
    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    setExpenseToEdit(undefined);
    showToast(`${expenseId ? 'Updated' : 'Added'} ${savedExpense.title}`);
  };

  const handleSaveSettlement = (settlementData: Omit<Settlement, 'id'>, settlementId?: string) => {
    if (!currentTrip) return;
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const now = new Date().toISOString();
    const savedSettlement: Settlement = {
      ...settlementData,
      id: settlementId || `set-${Date.now()}`,
      createdAt: settlementData.createdAt || now,
      updatedAt: now,
      createdByParticipantId: settlementData.createdByParticipantId || actor?.id,
    };
    const settlements = settlementId
      ? currentTrip.settlements.map((settlement) => settlement.id === settlementId ? savedSettlement : settlement)
      : [savedSettlement, ...currentTrip.settlements];
    const from = currentTrip.participants.find((participant) => participant.id === savedSettlement.fromParticipantId);
    const to = currentTrip.participants.find((participant) => participant.id === savedSettlement.toParticipantId);
    const updatedTrip = appendAuditLog(
      { ...currentTrip, settlements },
      settlementId ? 'EDIT_SETTLEMENT' : 'RECORD_SETTLEMENT',
      `${from?.name || 'A member'} paid ${to?.name || 'a member'} ${currentTrip.currencySymbol} ${savedSettlement.amount.toLocaleString()}`,
      actor,
    );
    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    setSettlementToEdit(undefined);
    showToast(settlementId ? 'Settlement updated' : 'Settlement recorded');
  };

  const handleToggleTripStatus = () => {
    if (!currentTrip) return;
    if (currentTrip.status === 'active') {
      setIsCompleteTripOpen(true);
    } else {
      setIsReopenTripOpen(true);
    }
  };

  const handleConfirmReopenTrip = () => {
    if (!currentTrip) return;
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const updatedTrip = appendAuditLog(
      { ...currentTrip, status: 'active', endDate: undefined },
      'REOPEN_TRIP',
      `Reopened trip “${currentTrip.name}”`,
      actor,
    );
    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    setIsReopenTripOpen(false);
    showToast('Trip status updated to Active');
  };

  const handleConfirmCompleteTrip = (endDate: string) => {
    if (!currentTrip) return;
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const updatedTrip = appendAuditLog(
      { ...currentTrip, status: 'completed', endDate },
      'COMPLETE_TRIP',
      `Completed trip “${currentTrip.name}”`,
      actor,
    );
    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    setIsCompleteTripOpen(false);
    showToast(`Trip "${currentTrip.name}" marked as Completed!`);
  };

  const handleAddParticipant = (newParticipantData: Omit<Participant, 'id'>) => {
    if (!currentTrip) return;

    const newParticipant: Participant = {
      ...newParticipantData,
      id: `part-${Date.now()}`,
    };

    const updatedTrip: Trip = {
      ...currentTrip,
      participants: [...currentTrip.participants, newParticipant],
    };

    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const auditedTrip = appendAuditLog(
      updatedTrip,
      'ADD_PARTICIPANT',
      `Added ${newParticipant.name} to the trip`,
      actor,
    );
    setTrips(trips.map((t) => (t.id === currentTrip.id ? auditedTrip : t)));
    showToast(`Added ${newParticipant.name} to trip`);
  };

  const handleUpdateParticipant = (participantId: string, name: string) => {
    if (!currentTrip) return;
    const participant = currentTrip.participants.find((item) => item.id === participantId);
    if (!participant || participant.name === name) return;

    const actor = currentTrip.participants.find((item) => item.id === currentParticipantId);
    const updatedTrip = appendAuditLog({
      ...currentTrip,
      participants: currentTrip.participants.map((item) => (
        item.id === participantId ? { ...item, name } : item
      )),
    }, 'UPDATE_PARTICIPANT', `Renamed ${participant.name} to ${name}`, actor);

    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    showToast(`Updated ${name}`);
  };

  const handleRemoveParticipant = (participantId: string) => {
    if (!currentTrip) return;
    const participant = currentTrip.participants.find((item) => item.id === participantId);
    if (!participant) return;

    const isUsed = currentTrip.expenses.some((expense) => (
      expense.paidById === participantId
      || expense.payers?.some((payer) => payer.participantId === participantId)
      || expense.includedParticipantIds.includes(participantId)
      || expense.shares?.some((share) => share.participantId === participantId)
    )) || currentTrip.settlements.some((settlement) => (
      settlement.fromParticipantId === participantId
      || settlement.toParticipantId === participantId
    ));

    if (participantId === currentParticipantId || isUsed || currentTrip.participants.length <= 1) {
      showToast('This member cannot be removed while they are part of trip records');
      return;
    }

    const actor = currentTrip.participants.find((item) => item.id === currentParticipantId);
    const updatedTrip = appendAuditLog({
      ...currentTrip,
      participants: currentTrip.participants.filter((item) => item.id !== participantId),
    }, 'REMOVE_PARTICIPANT', `Removed ${participant.name} from the trip`, actor);

    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    showToast(`Removed ${participant.name}`);
  };

  const handleUpdateTripDetails = (updates: TripDetailsUpdate) => {
    if (!currentTrip) return;
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const updatedTrip = appendAuditLog({ ...currentTrip, ...updates }, 'UPDATE_TRIP', `Updated trip details for “${updates.name}”`, actor);
    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    setIsEditTripOpen(false);
    showToast('Trip details updated');
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!currentTrip) return;

    const removed = currentTrip.expenses.find((expense) => expense.id === expenseId);
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const updatedTrip = appendAuditLog({
      ...currentTrip,
      expenses: currentTrip.expenses.filter((e) => e.id !== expenseId),
    }, 'DELETE_EXPENSE', `Deleted ${removed?.title || 'an expense'}`, actor);

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast('Expense removed');
  };

  const handleDeleteSettlement = (settlementId: string) => {
    if (!currentTrip) return;

    const removed = currentTrip.settlements.find((settlement) => settlement.id === settlementId);
    const from = currentTrip.participants.find((participant) => participant.id === removed?.fromParticipantId);
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const updatedTrip = appendAuditLog({
      ...currentTrip,
      settlements: currentTrip.settlements.filter((s) => s.id !== settlementId),
    }, 'DELETE_SETTLEMENT', `Deleted settlement from ${from?.name || 'a member'}`, actor);

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast('Settlement removed');
  };

  const handleDeleteTrip = (tripId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (confirm(`Are you sure you want to delete "${targetTrip?.name || 'this trip'}"?`)) {
      if (targetTrip?.coverPhotoId) void deleteStoredPhoto(targetTrip.coverPhotoId);
      const remainingTrips = trips.filter((t) => t.id !== tripId);
      setTrips(remainingTrips);

      if (activeTripId === tripId) {
        const nextTripId = remainingTrips[0]?.id || '';
        setActiveTripId(nextTripId);
      }
      setIdentityByTripId((current) => {
        const next = { ...current };
        delete next[tripId];
        return next;
      });

      showToast('Trip deleted');
    }
  };

  const handleResetDemoData = () => {
    if (confirm('Clear all trip data and reset to a clean slate?')) {
      trips.forEach((trip) => {
        if (trip.coverPhotoId) void deleteStoredPhoto(trip.coverPhotoId);
      });
      setTrips([]);
      setActiveTripId('');
      setIdentityByTripId({});
      showToast('All trip data cleared');
    }
  };

  const handleOpenSettleUpWithDebt = (debt?: SimplifiedDebt) => {
    const targetDebt = debt || simplifiedDebts[0];
    if (!targetDebt) {
      showToast('Everyone is already settled up');
      return;
    }
    setSettlementToEdit(undefined);
    setPresetDebt(targetDebt);
    setIsSettleUpOpen(true);
  };

  const handleUpdateCover = (photoId: string | undefined, accentColor?: string) => {
    if (!currentTrip) return;
    if (currentTrip.coverPhotoId && currentTrip.coverPhotoId !== photoId) {
      void deleteStoredPhoto(currentTrip.coverPhotoId);
    }
    const actor = currentTrip.participants.find((participant) => participant.id === currentParticipantId);
    const updatedTrip = appendAuditLog(
      { ...currentTrip, coverPhotoId: photoId, accentColor: photoId ? accentColor || currentTrip.accentColor : undefined },
      'UPDATE_COVER',
      photoId ? 'Updated the trip cover photo' : 'Removed the trip cover photo',
      actor,
    );
    setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
    showToast(photoId ? 'Trip cover updated' : 'Trip cover removed');
  };

  const handleImportTrip = (importedTrip: Trip) => {
    const actor = importedTrip.participants.find((participant) =>
      participant.profileId === userProfile?.id
      || participant.id === userProfile?.id
      || participant.name === userProfile?.name,
    );
    const tripWithAudit = appendAuditLog(importedTrip, 'IMPORT_TRIP', `Imported backup of “${importedTrip.name.replace(/ \(Imported\)$/, '')}”`, actor);
    setTrips([tripWithAudit, ...trips]);
    setActiveTripId(tripWithAudit.id);
    setActiveTab('dashboard');
    if (actor) {
      setCurrentParticipantId(actor.id);
      setIdentityByTripId((current) => ({ ...current, [tripWithAudit.id]: actor.id }));
    }
    showToast(`Imported ${tripWithAudit.name}`);
  };

  // Case 1: Zero Trips Exist
  if (trips.length === 0) {
    return (
      <MobileFrame scrollable={false}>
        <Toast message={toastMessage} />
        <ZeroStateIntro
          userProfile={userProfile}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          onOpenCreateTrip={() => setIsTripModalOpen(true)}
          onOpenSettings={() => setIsAppearanceOpen(true)}
        />
        <TripModal
          isOpen={isTripModalOpen}
          onClose={() => setIsTripModalOpen(false)}
          userProfile={userProfile}
          existingTrips={trips}
          onCreateTrip={handleCreateTrip}
        />
        <CreateProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onSaveProfile={handleSaveProfile}
          initialProfile={userProfile}
        />
      </MobileFrame>
    );
  }

  // Case 2: No Trip Selected (My Trips Hub View)
  if (!activeTripId || !currentTrip) {
    return (
      <MobileFrame scrollable={false}>
        <Toast message={toastMessage} />
        <TripsHubView
          trips={trips}
          userProfile={userProfile}
          onSelectTrip={handleSelectTrip}
          onOpenNewTripModal={() => setIsTripModalOpen(true)}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          onOpenSettings={() => setIsAppearanceOpen(true)}
          onDeleteTrip={handleDeleteTrip}
        />
        <TripModal
          isOpen={isTripModalOpen}
          onClose={() => setIsTripModalOpen(false)}
          userProfile={userProfile}
          existingTrips={trips}
          onCreateTrip={handleCreateTrip}
        />
        <CreateProfileModal
          isOpen={isCreateProfileOpen}
          onClose={() => setIsCreateProfileOpen(false)}
          onSaveProfile={handleSaveProfile}
          initialProfile={userProfile}
        />
      </MobileFrame>
    );
  }

  // Case 3: Active Single Trip Selected
  return (
    <MobileFrame workspace>
      <Toast message={toastMessage} />

      {/* Header with Close Button */}
      <Header
        currentTrip={currentTrip}
        trips={trips}
        onSelectTrip={handleSelectTrip}
        onCloseTrip={handleCloseTrip}
        onOpenNewTripModal={() => setIsTripModalOpen(true)}
        onOpenEditTripModal={() => setIsEditTripOpen(true)}
        onOpenAddExpense={() => {
          setExpenseToEdit(undefined);
          setIsAddExpenseOpen(true);
        }}
        onToggleTripStatus={handleToggleTripStatus}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        onOpenSettings={() => setIsAppearanceOpen(true)}
        onDeleteTrip={handleDeleteTrip}
        onResetDemoData={handleResetDemoData}
      />

      {/* Main Tab Views */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <TripDashboard
                trip={currentTrip}
                simplifiedDebts={simplifiedDebts}
                onOpenAddExpense={() => {
                  setExpenseToEdit(undefined);
                  setIsAddExpenseOpen(true);
                }}
                onOpenSettleUp={(debt) => handleOpenSettleUpWithDebt(debt)}
                onOpenAddParticipant={() => setIsAddParticipantOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onUpdateCover={handleUpdateCover}
              />
            </motion.div>
          )}

          {activeTab === 'expenses' && (
            <motion.div
              key="expenses"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ExpensesView
                trip={currentTrip}
                onOpenAddExpense={() => {
                  setExpenseToEdit(undefined);
                  setIsAddExpenseOpen(true);
                }}
                onEditExpense={(expense) => {
                  setExpenseToEdit(expense);
                  setIsAddExpenseOpen(true);
                }}
                onDeleteExpense={handleDeleteExpense}
              />
            </motion.div>
          )}

          {activeTab === 'balances' && (
            <motion.div
              key="balances"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <BalancesView
                trip={currentTrip}
                simplifiedDebts={simplifiedDebts}
                onOpenSettleUp={handleOpenSettleUpWithDebt}
                onEditSettlement={(settlement) => {
                  setPresetDebt(undefined);
                  setSettlementToEdit(settlement);
                  setIsSettleUpOpen(true);
                }}
                onDeleteSettlement={handleDeleteSettlement}
              />
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsView trip={currentTrip} />
            </motion.div>
          )}

          {activeTab === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ActivityLogView trip={currentTrip} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingDebtsCount={simplifiedDebts.length}
        tripName={currentTrip.name}
        onOpenSettings={() => setIsAppearanceOpen(true)}
      />

      {/* Modals */}
      <AddExpenseModal
        trip={currentTrip}
        isOpen={isAddExpenseOpen}
        expenseToEdit={expenseToEdit}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setExpenseToEdit(undefined);
        }}
        onSaveExpense={handleSaveExpense}
      />

      <SettleUpModal
        trip={currentTrip}
        presetDebt={presetDebt}
        settlementToEdit={settlementToEdit}
        isOpen={isSettleUpOpen}
        onClose={() => {
          setIsSettleUpOpen(false);
          setPresetDebt(undefined);
          setSettlementToEdit(undefined);
        }}
        onSaveSettlement={handleSaveSettlement}
      />

      <TripModal
        isOpen={isTripModalOpen}
        onClose={() => setIsTripModalOpen(false)}
        userProfile={userProfile}
        existingTrips={trips}
        onCreateTrip={handleCreateTrip}
      />

      {isEditTripOpen && (
        <EditTripModal
          trip={currentTrip}
          isOpen
          onClose={() => setIsEditTripOpen(false)}
          onSave={handleUpdateTripDetails}
        />
      )}

      <CreateProfileModal
        isOpen={isCreateProfileOpen}
        onClose={() => setIsCreateProfileOpen(false)}
        onSaveProfile={handleSaveProfile}
        initialProfile={userProfile}
      />

      <ShareSummaryModal
        trip={currentTrip}
        simplifiedDebts={simplifiedDebts}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <CompleteTripModal
        trip={currentTrip}
        simplifiedDebts={simplifiedDebts}
        isOpen={isCompleteTripOpen}
        onClose={() => setIsCompleteTripOpen(false)}
        onConfirmComplete={handleConfirmCompleteTrip}
      />

      <ReopenTripModal
        trip={currentTrip}
        isOpen={isReopenTripOpen}
        onClose={() => setIsReopenTripOpen(false)}
        onConfirm={handleConfirmReopenTrip}
      />

      {isAddParticipantOpen && (
        <AddParticipantModal
          trip={currentTrip}
          currentParticipantId={currentParticipantId}
          isOpen
          onClose={() => setIsAddParticipantOpen(false)}
          onAddParticipant={handleAddParticipant}
          onUpdateParticipant={handleUpdateParticipant}
          onRemoveParticipant={handleRemoveParticipant}
        />
      )}

      <SyncTripModal
        trip={currentTrip}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onOpenClaimIdentity={() => setIsClaimIdentityOpen(true)}
        onImportTrip={handleImportTrip}
      />

      <ClaimIdentityModal
        trip={currentTrip}
        currentParticipantId={currentParticipantId}
        isOpen={isClaimIdentityOpen}
        onClose={() => setIsClaimIdentityOpen(false)}
        onClaimIdentity={(partId) => {
          setCurrentParticipantId(partId);
          setIdentityByTripId((current) => ({ ...current, [currentTrip.id]: partId }));
          const p = currentTrip.participants.find((item) => item.id === partId);
          if (p) {
            const updatedTrip = appendAuditLog(currentTrip, 'CLAIM_IDENTITY', `${p.name} claimed this device identity`, p);
            setTrips(trips.map((trip) => trip.id === currentTrip.id ? updatedTrip : trip));
            showToast(`Identity switched to ${p.name}`);
          }
        }}
      />
    </MobileFrame>
  );
}
