
import React from 'react';
import { User, UserRole } from '../types';

interface NavbarProps {
  user: User;
  currentView: string;
  setView: (view: 'dashboard' | 'wallet' | 'provider' | 'reviewer') => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, currentView, setView, onLogout }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView(user.role === 'provider' ? 'provider' : 'dashboard')}
        >
          <div className="w-8 h-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center font-bold text-white">X</div>
          <span className="font-poppins font-bold text-xl tracking-tight hidden sm:inline-block">MarketingX</span>
        </div>

        <div className="flex items-center gap-4 sm:gap-8">
          {user.role === 'user' && (
            <>
              <button 
                onClick={() => setView('dashboard')}
                className={`text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Tasks
              </button>
              <button 
                onClick={() => setView('wallet')}
                className={`text-sm font-medium transition-colors ${currentView === 'wallet' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Wallet
              </button>
            </>
          )}

          {user.role === 'provider' && (
            <>
              <button 
                onClick={() => setView('provider')}
                className={`text-sm font-medium transition-colors ${currentView === 'provider' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Admin Panel
              </button>
              <button 
                onClick={() => setView('dashboard')}
                className={`text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-100'}`}
              >
                Task Preview
              </button>
            </>
          )}

          <div className="h-6 w-px bg-slate-800"></div>

          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-xs text-slate-500 font-medium">Logged in as</p>
              <p className="text-sm font-semibold">{user.username}</p>
            </div>
            <button 
              onClick={onLogout}
              className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-full transition-all"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
