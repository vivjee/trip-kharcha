'use client';

import React, { useState, useEffect } from 'react';
import { Trip, Expense, Settlement, SimplifiedDebt, Participant, AuditLogEntry, UserProfile } from '@/types/trip';
import { calculateSimplifiedDebts } from '@/lib/debt-simplification';
import { loadTripsFromStorage, saveTripsToStorage, loadUserProfileFromStorage, saveUserProfileToStorage } from '@/lib/storage';

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
import ShareSummaryModal from '@/components/ShareSummaryModal';
import CompleteTripModal from '@/components/CompleteTripModal';
import AddParticipantModal from '@/components/AddParticipantModal';
import SyncTripModal from '@/components/SyncTripModal';
import ClaimIdentityModal from '@/components/ClaimIdentityModal';
import CreateProfileModal from '@/components/CreateProfileModal';
import Toast from '@/components/Toast';

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTripId, setActiveTripId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isCreateProfileOpen, setIsCreateProfileOpen] = useState(false);

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isSettleUpOpen, setIsSettleUpOpen] = useState(false);
  const [isTripModalOpen, setIsTripModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCompleteTripOpen, setIsCompleteTripOpen] = useState(false);
  const [isAddParticipantOpen, setIsAddParticipantOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isClaimIdentityOpen, setIsClaimIdentityOpen] = useState(false);
  const [currentParticipantId, setCurrentParticipantId] = useState<string>('');
  const [presetDebt, setPresetDebt] = useState<SimplifiedDebt | undefined>(undefined);

  // Load from LocalStorage on mount
  useEffect(() => {
    const data = loadTripsFromStorage();
    setTrips(data.trips);
    setActiveTripId(data.activeTripId);

    const savedProfile = loadUserProfileFromStorage();
    if (savedProfile) {
      setUserProfile(savedProfile);
      setCurrentParticipantId(savedProfile.id);
    }

    setIsLoaded(true);
  }, []);

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    saveUserProfileToStorage(profile);
    setCurrentParticipantId(profile.id);
    showToast(`Profile set to ${profile.avatar} ${profile.name}!`);
  };

  // Save to LocalStorage on updates
  useEffect(() => {
    if (isLoaded && trips.length > 0) {
      saveTripsToStorage(trips, activeTripId);
    }
  }, [trips, activeTripId, isLoaded]);

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

  const simplifiedDebts = currentTrip
    ? calculateSimplifiedDebts(currentTrip)
    : [];

  // Handlers
  const handleSelectTrip = (id: string) => {
    setActiveTripId(id);
    setActiveTab('dashboard');
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
      expenses: [],
      settlements: [],
    };

    setTrips([newTrip, ...trips]);
    setActiveTripId(newId);

    if (hostParticipantId) {
      setCurrentParticipantId(hostParticipantId);
    }

    showToast(`Trip "${newTrip.name}" created!`);
  };

  const handleAddExpense = (expenseData: Omit<Expense, 'id'>) => {
    if (!currentTrip) return;

    const newExpense: Expense = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };

    const updatedTrip: Trip = {
      ...currentTrip,
      expenses: [newExpense, ...currentTrip.expenses],
    };

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast(`Added ${newExpense.title} (रू ${newExpense.amount})`);
  };

  const handleAddSettlement = (settlementData: Omit<Settlement, 'id'>) => {
    if (!currentTrip) return;

    const newSettlement: Settlement = {
      ...settlementData,
      id: `set-${Date.now()}`,
    };

    const updatedTrip: Trip = {
      ...currentTrip,
      settlements: [newSettlement, ...currentTrip.settlements],
    };

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast('Settlement recorded successfully');
  };

  const handleToggleTripStatus = () => {
    if (!currentTrip) return;
    const newStatus = currentTrip.status === 'active' ? 'completed' : 'active';
    if (newStatus === 'completed') {
      setIsCompleteTripOpen(true);
    } else {
      const updatedTrip: Trip = { ...currentTrip, status: newStatus };
      setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
      showToast('Trip status updated to Active');
    }
  };

  const handleConfirmCompleteTrip = () => {
    if (!currentTrip) return;
    const updatedTrip: Trip = { ...currentTrip, status: 'completed' };
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

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast(`Added ${newParticipant.name} to trip`);
  };

  const handleDeleteExpense = (expenseId: string) => {
    if (!currentTrip) return;

    const updatedTrip: Trip = {
      ...currentTrip,
      expenses: currentTrip.expenses.filter((e) => e.id !== expenseId),
    };

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast('Expense removed');
  };

  const handleDeleteSettlement = (settlementId: string) => {
    if (!currentTrip) return;

    const updatedTrip: Trip = {
      ...currentTrip,
      settlements: currentTrip.settlements.filter((s) => s.id !== settlementId),
    };

    setTrips(trips.map((t) => (t.id === currentTrip.id ? updatedTrip : t)));
    showToast('Settlement removed');
  };

  const handleDeleteTrip = (tripId: string) => {
    const targetTrip = trips.find((t) => t.id === tripId);
    if (confirm(`Are you sure you want to delete "${targetTrip?.name || 'this trip'}"?`)) {
      const remainingTrips = trips.filter((t) => t.id !== tripId);
      setTrips(remainingTrips);

      if (activeTripId === tripId) {
        const nextTripId = remainingTrips[0]?.id || '';
        setActiveTripId(nextTripId);
      }

      showToast('Trip deleted');
    }
  };

  const handleResetDemoData = () => {
    if (confirm('Clear all trip data and reset to a clean slate?')) {
      setTrips([]);
      setActiveTripId('');
      showToast('All trip data cleared');
    }
  };

  const handleOpenSettleUpWithDebt = (debt?: SimplifiedDebt) => {
    setPresetDebt(debt);
    setIsSettleUpOpen(true);
  };

  // Case 1: Zero Trips Exist
  if (trips.length === 0) {
    return (
      <MobileFrame>
        <Toast message={toastMessage} />
        <ZeroStateIntro
          userProfile={userProfile}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
          onOpenCreateTrip={() => setIsTripModalOpen(true)}
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
      <MobileFrame>
        <Toast message={toastMessage} />
        <TripsHubView
          trips={trips}
          userProfile={userProfile}
          onSelectTrip={handleSelectTrip}
          onOpenNewTripModal={() => setIsTripModalOpen(true)}
          onOpenCreateProfile={() => setIsCreateProfileOpen(true)}
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
    <MobileFrame>
      <Toast message={toastMessage} />

      {/* Header with Close Button */}
      <Header
        currentTrip={currentTrip}
        trips={trips}
        onSelectTrip={handleSelectTrip}
        onCloseTrip={handleCloseTrip}
        onOpenNewTripModal={() => setIsTripModalOpen(true)}
        onToggleTripStatus={handleToggleTripStatus}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
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
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                onOpenSettleUp={(debt) => handleOpenSettleUpWithDebt(debt)}
                onOpenAddParticipant={() => setIsAddParticipantOpen(true)}
                onNavigateTab={(tab) => setActiveTab(tab)}
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
                onOpenAddExpense={() => setIsAddExpenseOpen(true)}
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
      />

      {/* Modals */}
      <AddExpenseModal
        trip={currentTrip}
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSaveExpense={handleAddExpense}
      />

      <SettleUpModal
        trip={currentTrip}
        presetDebt={presetDebt}
        isOpen={isSettleUpOpen}
        onClose={() => {
          setIsSettleUpOpen(false);
          setPresetDebt(undefined);
        }}
        onConfirmSettlement={handleAddSettlement}
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

      <AddParticipantModal
        trip={currentTrip}
        isOpen={isAddParticipantOpen}
        onClose={() => setIsAddParticipantOpen(false)}
        onAddParticipant={handleAddParticipant}
      />

      <SyncTripModal
        trip={currentTrip}
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onOpenClaimIdentity={() => setIsClaimIdentityOpen(true)}
      />

      <ClaimIdentityModal
        trip={currentTrip}
        currentParticipantId={currentParticipantId}
        isOpen={isClaimIdentityOpen}
        onClose={() => setIsClaimIdentityOpen(false)}
        onClaimIdentity={(partId) => {
          setCurrentParticipantId(partId);
          const p = currentTrip.participants.find((item) => item.id === partId);
          if (p) showToast(`Identity switched to ${p.name}`);
        }}
      />
    </MobileFrame>
  );
}
