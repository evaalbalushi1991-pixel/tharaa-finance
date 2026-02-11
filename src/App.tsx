import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FinanceProvider } from './contexts/FinanceContext';
import { BottomNav } from './components/layout/BottomNav';
import { Home, FileText, BarChart3, Receipt, Vault, Target, Plus, LogOut } from 'lucide-react';
import { CATEGORIES } from './types';
import { formatCurrency, formatCurrencyWithSymbol } from './utils/formatters';
import { getCurrentCycle, formatCycleDisplay, formatDate, isInCurrentCycle } from './utils/dateHelpers';
import type { Transaction, Category } from './types';

// Login Page
const LoginPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      alert('خطأ في تسجيل الدخول');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
          💰 ثراء
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
          >
            {isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </form>
        
        <button
          onClick={() => setIsSignUp(!isSignUp)}
          className="w-full mt-4 text-primary-600 font-semibold"
        >
          {isSignUp ? 'لدي حساب بالفعل' : 'إنشاء حساب جديد'}
        </button>
      </div>
    </div>
  );
};

// Dashboard Page
const DashboardPage: React.FC<{ onAddTransaction: () => void }> = ({ onAddTransaction }) => {
  const { userProfile } = useAuth();
  const balance = userProfile?.balance || 0;
  
  return (
    <div className="pb-24 px-4">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white -mx-4 px-6 py-8 rounded-b-3xl mb-6">
        <h1 className="text-2xl font-bold mb-2">مرحباً بك 👋</h1>
        <p className="text-sm opacity-90">{formatCycleDisplay(getCurrentCycle())}</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-8 rounded-3xl shadow-xl mb-6">
        <p className="text-sm opacity-90 mb-2">الرصيد المتاح</p>
        <h2 className="text-5xl font-bold mb-1">{formatCurrency(balance)}</h2>
        <p className="text-xs opacity-75">ريال عماني</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <button
          onClick={onAddTransaction}
          className="bg-success-500 text-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow"
        >
          <Plus className="mx-auto mb-2" size={32} />
          <p className="font-semibold">إضافة معاملة</p>
        </button>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="text-4xl mb-2">⛽</div>
          <p className="text-sm text-gray-600 font-semibold">وقود الدورة</p>
          <p className="text-2xl font-bold text-gray-900">0.0</p>
        </div>
      </div>

      {/* Recent */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <h3 className="text-xl font-bold mb-4">آخر المعاملات</h3>
        <p className="text-center text-gray-400 py-8">لا توجد معاملات حتى الآن</p>
      </div>
    </div>
  );
};

// Transactions Page
const TransactionsPage: React.FC = () => {
  return (
    <div className="pb-24 px-4">
      <h2 className="text-2xl font-bold mb-6 mt-4">📋 السجل الشامل</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <input
          type="text"
          placeholder="ابحث في المعاملات..."
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl mb-4"
        />
        <p className="text-center text-gray-400 py-8">لا توجد معاملات</p>
      </div>
    </div>
  );
};

// Analytics Page
const AnalyticsPage: React.FC = () => {
  return (
    <div className="pb-24 px-4">
      <h2 className="text-2xl font-bold mb-6 mt-4">📊 التحليلات المالية</h2>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <p className="text-center text-gray-400 py-8">لا توجد بيانات كافية للتحليل</p>
      </div>
    </div>
  );
};

// Obligations Page
const ObligationsPage: React.FC = () => {
  return (
    <div className="pb-24 px-4">
      <h2 className="text-2xl font-bold mb-6 mt-4">📝 الالتزامات الشهرية</h2>
      <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold mb-4">
        + إضافة التزام جديد
      </button>
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <p className="text-center text-gray-400 py-8">لا توجد التزامات</p>
      </div>
    </div>
  );
};

// Transaction Modal
const TransactionModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category>('food');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">إضافة معاملة</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setType('expense')}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              type === 'expense' ? 'bg-danger-100 text-danger-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            مصروف
          </button>
          <button
            onClick={() => setType('income')}
            className={`flex-1 py-3 rounded-xl font-semibold ${
              type === 'income' ? 'bg-success-100 text-success-600' : 'bg-gray-100 text-gray-600'
            }`}
          >
            إيراد
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">المبلغ (ر.ع)</label>
            <input
              type="number"
              step="0.1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-2xl font-bold text-center"
              placeholder="0.0"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">الفئة</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
            >
              {Object.entries(CATEGORIES).map(([key, { icon, label }]) => (
                <option key={key} value={key}>
                  {icon} {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">ملاحظات (اختياري)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
              placeholder="أضف ملاحظة..."
            />
          </div>

          <button className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold">
            حفظ المعاملة
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App
const AppContent: React.FC = () => {
  const { user, signOut } = useAuth();
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  if (!user) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        {/* Logout Button */}
        <button
          onClick={signOut}
          className="absolute top-4 left-4 p-2 bg-white rounded-lg shadow-lg text-gray-600 hover:text-gray-900 z-50"
        >
          <LogOut size={20} />
        </button>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<DashboardPage onAddTransaction={() => setShowTransactionModal(true)} />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/obligations" element={<ObligationsPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        {/* Bottom Nav */}
        <BottomNav />

        {/* Floating Add Button */}
        <button
          onClick={() => setShowTransactionModal(true)}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
        >
          <Plus size={32} />
        </button>

        {/* Transaction Modal */}
        <TransactionModal
          isOpen={showTransactionModal}
          onClose={() => setShowTransactionModal(false)}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FinanceProvider>
          <AppContent />
        </FinanceProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
