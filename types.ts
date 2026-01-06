
export type UserRole = 'user' | 'provider' | 'reviewer';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  balanceApproved: number;
  balancePending: number;
  redditVerified: boolean;
  redditKarma: number;
  redditAccountAge: number; // in months
  lastTaskTimestamp?: number;
  dailyTasksCompleted: number;
  lastWithdrawalTimestamp?: number;
  withdrawalsThisMonth: number;
}

export interface Task {
  id: string;
  providerId: string;
  name: string;
  description: string;
  timeLimit: number; // in minutes
  rewardAmount: number; // in USD
  totalSlots: number;
  slotsTaken: number;
  createdAt: number;
}

export interface Submission {
  id: string;
  taskId: string;
  userId: string;
  proofUrl: string; // Base64 or placeholder URL
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: number;
  rewardAmount: number;
  taskName: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: 'Gift Card' | 'Crypto';
  details: string; // Email or Address
  status: 'pending' | 'paid';
  createdAt: number;
}
