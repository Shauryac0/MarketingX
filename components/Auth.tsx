
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { DB } from '../storage';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<UserRole>('user');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminCode, setAdminCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLogin) {
      // Secret Login Logic
      if (adminCode === 'SECRET99') {
          const provider = DB.getUsers().find(u => u.role === 'provider');
          if (provider) {
              onLogin(provider);
              return;
          }
      }

      const users = DB.getUsers();
      const user = users.find(u => u.email === email);
      if (user) {
          // Simple auth simulation (real apps use bcrypt)
          onLogin(user);
      } else {
          alert('User not found. Try signing up.');
      }
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        email,
        role: 'user', // only users can signup normally
        balanceApproved: 0,
        balancePending: 0,
        redditVerified: false,
        redditKarma: 0,
        redditAccountAge: 0,
        dailyTasksCompleted: 0,
        withdrawalsThisMonth: 0
      };
      DB.saveUser(newUser);
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-900/20 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-[2rem] p-8 md:p-12 relative z-10 shadow-2xl">
            <div className="text-center mb-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center font-bold text-white text-3xl mx-auto mb-4 shadow-xl shadow-indigo-500/20">X</div>
                <h1 className="text-3xl font-poppins font-bold tracking-tight">MarketingX</h1>
                <p className="text-slate-500 mt-2">{isLogin ? 'Welcome back! Ready to earn?' : 'Start your earning journey today.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Username</label>
                        <input 
                            required
                            type="text" 
                            placeholder="johndoe"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                        />
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Email Address</label>
                    <input 
                        required
                        type="email" 
                        placeholder="name@company.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Password</label>
                    <input 
                        required
                        type="password" 
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-slate-200"
                    />
                </div>

                {isLogin && (
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">Secret Admin Code (Optional)</label>
                        <input 
                            type="password" 
                            placeholder="Providers only..."
                            value={adminCode}
                            onChange={e => setAdminCode(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-4 outline-none focus:border-rose-500 transition-all text-slate-200 text-sm"
                        />
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl font-bold text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 transform hover:-translate-y-1 transition-all mt-6 active:scale-95"
                >
                    {isLogin ? 'Sign In' : 'Create Account'}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-slate-500">
                {isLogin ? (
                    <p>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-indigo-400 font-bold hover:underline">Sign up</button></p>
                ) : (
                    <p>Already have an account? <button onClick={() => setIsLogin(true)} className="text-indigo-400 font-bold hover:underline">Log in</button></p>
                )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-800 text-center">
                <p className="text-[10px] uppercase font-bold text-slate-600 tracking-widest">Provider Hint: Code is SECRET99</p>
            </div>
        </div>
    </div>
  );
};

export default Auth;
