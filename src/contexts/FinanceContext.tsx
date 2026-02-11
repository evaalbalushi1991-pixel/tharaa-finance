import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc, 
  query, 
  where, 
  getDocs,
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { useAuth } from './AuthContext';
import type { Transaction, Obligation, Goal, Asset } from '../types';
import { isInCurrentCycle } from '../utils/dateHelpers';

interface FinanceContextType {
  transactions: Transaction[];
  obligations: Obligation[];
  goals: Goal[];
  assets: Asset[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addObligation: (obligation: Omit<Obligation, 'id' | 'userId' | 'paid' | 'cycleId'>) => Promise<void>;
  payObligation: (id: string) => Promise<void>;
  deleteObligation: (id: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => Promise<void>;
  depositToGoal: (id: string, amount: number) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  addAsset: (asset: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateAsset: (id: string, value: number) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }
  return context;
};

interface FinanceProviderProps {
  children: ReactNode;
}

export const FinanceProvider: React.FC<FinanceProviderProps> = ({ children }) => {
  const { user, updateBalance, userProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [obligations, setObligations] = useState<Obligation[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllData();
    } else {
      setTransactions([]);
      setObligations([]);
      setGoals([]);
      setAssets([]);
      setLoading(false);
    }
  }, [user]);

  const loadAllData = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Load transactions
      const txQuery = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid),
        orderBy('date', 'desc')
      );
      const txSnap = await getDocs(txQuery);
      const txData = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      setTransactions(txData);

      // Load obligations
      const obQuery = query(collection(db, 'obligations'), where('userId', '==', user.uid));
      const obSnap = await getDocs(obQuery);
      const obData = obSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Obligation));
      setObligations(obData);

      // Load goals
      const goalQuery = query(collection(db, 'goals'), where('userId', '==', user.uid));
      const goalSnap = await getDocs(goalQuery);
      const goalData = goalSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Goal));
      setGoals(goalData);

      // Load assets
      const assetQuery = query(collection(db, 'assets'), where('userId', '==', user.uid));
      const assetSnap = await getDocs(assetQuery);
      const assetData = assetSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Asset));
      setAssets(assetData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    
    setLoading(false);
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user || !userProfile) return;

    const newTransaction: Omit<Transaction, 'id'> = {
      ...transaction,
      userId: user.uid,
    };

    const docRef = await addDoc(collection(db, 'transactions'), newTransaction);
    const savedTransaction = { id: docRef.id, ...newTransaction };
    setTransactions(prev => [savedTransaction, ...prev]);

    // Update balance
    const newBalance = transaction.type === 'income' 
      ? userProfile.balance + transaction.amount
      : userProfile.balance - transaction.amount;
    await updateBalance(newBalance);
  };

  const deleteTransaction = async (id: string) => {
    if (!userProfile) return;
    
    const transaction = transactions.find(t => t.id === id);
    if (!transaction) return;

    await deleteDoc(doc(db, 'transactions', id));
    setTransactions(prev => prev.filter(t => t.id !== id));

    // Reverse balance change
    const newBalance = transaction.type === 'income'
      ? userProfile.balance - transaction.amount
      : userProfile.balance + transaction.amount;
    await updateBalance(newBalance);
  };

  const addObligation = async (obligation: Omit<Obligation, 'id' | 'userId' | 'paid' | 'cycleId'>) => {
    if (!user) return;

    const newObligation: Omit<Obligation, 'id'> = {
      ...obligation,
      userId: user.uid,
      paid: false,
      cycleId: new Date().toISOString().slice(0, 7), // YYYY-MM
    };

    const docRef = await addDoc(collection(db, 'obligations'), newObligation);
    setObligations(prev => [...prev, { id: docRef.id, ...newObligation }]);
  };

  const payObligation = async (id: string) => {
    if (!userProfile) return;

    const obligation = obligations.find(o => o.id === id);
    if (!obligation) return;

    // Add transaction
    await addTransaction({
      type: 'expense',
      amount: obligation.amount,
      category: 'bills',
      note: `دفع التزام: ${obligation.name}`,
      date: new Date().toISOString(),
    });

    // Mark as paid
    await updateDoc(doc(db, 'obligations', id), { paid: true });
    setObligations(prev => prev.map(o => o.id === id ? { ...o, paid: true } : o));
  };

  const deleteObligation = async (id: string) => {
    await deleteDoc(doc(db, 'obligations', id));
    setObligations(prev => prev.filter(o => o.id !== id));
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'userId' | 'currentAmount' | 'createdAt'>) => {
    if (!user) return;

    const newGoal: Omit<Goal, 'id'> = {
      ...goal,
      userId: user.uid,
      currentAmount: 0,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'goals'), newGoal);
    setGoals(prev => [...prev, { id: docRef.id, ...newGoal }]);
  };

  const depositToGoal = async (id: string, amount: number) => {
    if (!userProfile) return;

    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newAmount = goal.currentAmount + amount;
    await updateDoc(doc(db, 'goals', id), { currentAmount: newAmount });
    setGoals(prev => prev.map(g => g.id === id ? { ...g, currentAmount: newAmount } : g));

    // Deduct from balance
    await updateBalance(userProfile.balance - amount);
  };

  const deleteGoal = async (id: string) => {
    await deleteDoc(doc(db, 'goals', id));
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const addAsset = async (asset: Omit<Asset, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;

    const newAsset: Omit<Asset, 'id'> = {
      ...asset,
      userId: user.uid,
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'assets'), newAsset);
    setAssets(prev => [...prev, { id: docRef.id, ...newAsset }]);
  };

  const updateAsset = async (id: string, value: number) => {
    await updateDoc(doc(db, 'assets', id), { value });
    setAssets(prev => prev.map(a => a.id === id ? { ...a, value } : a));
  };

  const deleteAsset = async (id: string) => {
    await deleteDoc(doc(db, 'assets', id));
    setAssets(prev => prev.filter(a => a.id !== id));
  };

  const value = {
    transactions,
    obligations,
    goals,
    assets,
    loading,
    addTransaction,
    deleteTransaction,
    addObligation,
    payObligation,
    deleteObligation,
    addGoal,
    depositToGoal,
    deleteGoal,
    addAsset,
    updateAsset,
    deleteAsset,
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
};
