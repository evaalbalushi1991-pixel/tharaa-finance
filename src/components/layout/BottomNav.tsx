import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, BarChart3, Receipt } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;
  
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/transactions', icon: FileText, label: 'المعاملات' },
    { path: '/analytics', icon: BarChart3, label: 'التحليلات' },
    { path: '/obligations', icon: Receipt, label: 'الالتزامات' },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <React.Fragment key={item.path}>
                <Link
                  to={item.path}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </Link>
                {index === 1 && (
                  <div className="w-12" /> // Spacer for floating button
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
