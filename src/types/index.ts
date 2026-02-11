export type TransactionType = 'income' | 'expense';

export type Category = 
  | 'food' | 'fuel' | 'bills' | 'shopping' 
  | 'health' | 'education' | 'entertainment' 
  | 'transport' | 'salary' | 'other';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  note?: string;
  date: string;
  userId: string;
}

export interface Obligation {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
  cycleId: string;
  userId: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  userId: string;
  createdAt: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'gold' | 'realestate' | 'account' | 'other';
  value: number;
  note?: string;
  userId: string;
  createdAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  balance: number;
  cycleStartDay: number;
  createdAt: string;
}

export interface FinancialCycle {
  id: string;
  startDate: Date;
  endDate: Date;
}

export const CATEGORIES: Record<Category, { icon: string; label: string }> = {
  food: { icon: '🍔', label: 'طعام' },
  fuel: { icon: '⛽', label: 'وقود' },
  bills: { icon: '💡', label: 'فواتير' },
  shopping: { icon: '🛍️', label: 'تسوق' },
  health: { icon: '🏥', label: 'صحة' },
  education: { icon: '📚', label: 'تعليم' },
  entertainment: { icon: '🎮', label: 'ترفيه' },
  transport: { icon: '🚗', label: 'مواصلات' },
  salary: { icon: '💰', label: 'راتب' },
  other: { icon: '📦', label: 'أخرى' },
};
