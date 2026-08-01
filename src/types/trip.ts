export interface UserProfile {
  id: string;
  name: string;
  gender: 'male' | 'female';
  avatar: string;
  photoId?: string;
}

export interface Participant {
  id: string;
  profileId?: string;
  name: string;
  avatar: string;
  photoId?: string;
  color: string;
}

export type CategoryType = 'food' | 'transport' | 'stay' | 'activity' | 'shopping' | 'other';
export type SplitMode = 'equal' | 'exact' | 'percentage';

export interface ExpensePayer {
  participantId: string;
  amount: number;
}

export interface ExpenseShare {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  paidById: string;
  payers?: ExpensePayer[];
  includedParticipantIds: string[];
  splitMode?: SplitMode;
  shares?: ExpenseShare[];
  category: CategoryType;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByParticipantId?: string;
}

export interface Settlement {
  id: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  createdByParticipantId?: string;
}

export type AuditActionType =
  | 'ADD_EXPENSE'
  | 'EDIT_EXPENSE'
  | 'DELETE_EXPENSE'
  | 'RECORD_SETTLEMENT'
  | 'EDIT_SETTLEMENT'
  | 'DELETE_SETTLEMENT'
  | 'ADD_PARTICIPANT'
  | 'CLAIM_IDENTITY'
  | 'CREATE_TRIP'
  | 'COMPLETE_TRIP'
  | 'REOPEN_TRIP'
  | 'UPDATE_COVER'
  | 'IMPORT_TRIP';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  performedBy: {
    id: string;
    name: string;
    avatar: string;
    photoId?: string;
  };
  actionType: AuditActionType;
  details: string;
}

export interface Trip {
  id: string;
  name: string;
  description: string;
  coverImageEmoji: string;
  coverPhotoId?: string;
  accentColor?: string;
  currency: string;
  currencySymbol: string;
  participants: Participant[];
  expenses: Expense[];
  settlements: Settlement[];
  status: 'active' | 'completed';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt?: string;
  roomCode?: string;
  auditLogs?: AuditLogEntry[];
}

export interface ParticipantBalance {
  participantId: string;
  participantName: string;
  avatar: string;
  photoId?: string;
  color: string;
  totalPaid: number;
  totalOwed: number;
  settlementPaid: number;
  settlementReceived: number;
  netBalance: number;
}

export interface SimplifiedDebt {
  id: string;
  from: Participant;
  to: Participant;
  amount: number;
}
