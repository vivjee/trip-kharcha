export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  avatar: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string; // Emoji avatar or avatar color
  color: string; // Tailwind color or hex
}

export type CategoryType = 'food' | 'transport' | 'stay' | 'activity' | 'shopping' | 'other';

export interface ExpensePayer {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number; // in NPR
  paidById: string; // Participant ID (for single-payer or main payer)
  payers?: ExpensePayer[]; // Optional multi-payer list
  includedParticipantIds: string[]; // Opt-in participant IDs
  category: CategoryType;
  date: string; // ISO string or human date
  notes?: string;
  createdByParticipantId?: string; // Audit attribution
}

export interface Settlement {
  id: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number; // in NPR
  date: string;
  notes?: string;
  createdByParticipantId?: string; // Audit attribution
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  performedBy: {
    id: string;
    name: string;
    avatar: string;
  };
  actionType: 'ADD_EXPENSE' | 'DELETE_EXPENSE' | 'RECORD_SETTLEMENT' | 'DELETE_SETTLEMENT' | 'CLAIM_IDENTITY' | 'CREATE_TRIP' | 'COMPLETE_TRIP' | 'JOIN_TRIP';
  details: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  coverImageEmoji: string;
  currency: string; // Default 'NPR'
  currencySymbol: string; // Default 'रू'
  participants: Participant[];
  expenses: Expense[];
  settlements: Settlement[];
  status: 'active' | 'completed';
  startDate: string; // ISO date string 'YYYY-MM-DD'
  endDate?: string; // ISO date string 'YYYY-MM-DD' when completed
  createdAt: string;
  roomCode?: string; // 6-digit sync code e.g. "NEPAL-7821"
  auditLogs?: AuditLogEntry[]; // History of who did what
}

export interface ParticipantBalance {
  participantId: string;
  participantName: string;
  avatar: string;
  color: string;
  totalPaid: number;
  totalOwed: number;
  netBalance: number; // Positive = should receive money, Negative = owes money
}

export interface SimplifiedDebt {
  id: string;
  from: Participant;
  to: Participant;
  amount: number;
}
