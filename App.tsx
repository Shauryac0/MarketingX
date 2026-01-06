
import React, { useState, useEffect } from 'react';
import { User } from './types';
import { DB } from './storage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Wallet from './components/Wallet';
import ProviderPortal from './components/ProviderPortal';
import Navbar from './components/Navbar';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(DB.getCurrentUser());
  const [view, setView] = useState<'dashboard' | 'wallet' | 'provider' | 'reviewer'>('dashboard');

  // Sync user state with DB whenever it changes
  useEffect(() => {
    DB.setCurrentUser(user);
    if (user) {
        // If logged in as provider, default to provider view
        if (user.role === 'provider' && view === 'dashboard') {
            setView('provider');
        }
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setView('dashboard');
  };

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col">
      <Navbar 
        user={user} 
        currentView={view} 
        setView={setView} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        {view === 'dashboard' && <Dashboard user={user} setUser={setUser} />}
        {view === 'wallet' && <Wallet user={user} setUser={setUser} />}
        {view === 'provider' && <ProviderPortal user={user} />}
        {view === 'reviewer' && (
            <div className="flex items-center justify-center h-64 text-slate-400 italic">
                Payment Reviewer Panel is simulated - Contact Admin for bulk payments.
            </div>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-slate-500 text-sm">
        &copy; {new Date().getFullYear()} MarketingX. Build your audience, earn rewards.
      </footer>
    </div>
  );
};

export default App;
