
import React, { useState, useEffect } from 'react';
import { User, Withdrawal } from '../types';
import { DB } from '../storage';

interface WalletProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const Wallet: React.FC<WalletProps> = ({ user, setUser }) => {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [method, setMethod] = useState<'Gift Card' | 'Crypto'>('Gift Card');
  const [details, setDetails] = useState('');
  const [amount, setAmount] = useState(1);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setWithdrawals(DB.getWithdrawals().filter(w => w.userId === user.id));
  }, [user.id]);

  const validateWithdrawal = () => {
    // Min $1
    if (user.balanceApproved < 1) return { valid: false, reason: 'Minimum withdrawal is $1.00' };
    if (amount > user.balanceApproved) return { valid: false, reason: 'Insufficient approved balance.' };

    // Max 2 times per month
    if (user.withdrawalsThisMonth >= 2) return { valid: false, reason: 'Monthly limit (2) reached.' };

    // 14 day gap
    if (user.lastWithdrawalTimestamp) {
        const fourteenDays = 14 * 24 * 60 * 60 * 1000;
        const diff = Date.now() - user.lastWithdrawalTimestamp;
        if (diff < fourteenDays) {
            const daysLeft = Math.ceil((fourteenDays - diff) / (24 * 60 * 60 * 1000));
            return { valid: false, reason: `Minimum 14-day gap required between withdrawals (${daysLeft} days left).` };
        }
    }

    if (!details.trim()) return { valid: false, reason: 'Please provide withdrawal details.' };

    return { valid: true };
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateWithdrawal();
    if (!check.valid) {
        setMessage({ type: 'error', text: check.reason || 'Invalid withdrawal.' });
        return;
    }

    const newWithdrawal: Withdrawal = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user.id,
        amount: amount,
        method: method,
        details: details,
        status: 'pending',
        createdAt: Date.now()
    };

    DB.addWithdrawal(newWithdrawal);

    const updatedUser: User = {
        ...user,
        balanceApproved: user.balanceApproved - amount,
        lastWithdrawalTimestamp: Date.now(),
        withdrawalsThisMonth: user.withdrawalsThisMonth + 1
    };
    DB.saveUser(updatedUser);
    setUser(updatedUser);

    setWithdrawals([...withdrawals, newWithdrawal]);
    setDetails('');
    setAmount(1);
    setMessage({ type: 'success', text: 'Withdrawal request sent! Our team will process it within 48 hours.' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-sm font-medium">Available (Approved)</p>
          <h2 className="text-3xl font-bold text-emerald-400 mt-1">${user.balanceApproved.toFixed(2)}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-sm font-medium">Pending Rewards</p>
          <h2 className="text-3xl font-bold text-amber-400 mt-1">${user.balancePending.toFixed(2)}</h2>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <p className="text-slate-500 text-sm font-medium">Total Earned</p>
          <h2 className="text-3xl font-bold text-indigo-400 mt-1">${(user.balanceApproved + user.balancePending).toFixed(2)}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Withdrawal Form */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6">
          <h3 className="text-xl font-poppins font-bold">Request Withdrawal</h3>
          
          {message && (
            <div className={`p-4 rounded-xl text-sm border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                {message.text}
            </div>
          )}

          <form onSubmit={handleWithdraw} className="space-y-4">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Withdrawal Method</label>
                <div className="flex gap-2">
                    <button 
                        type="button"
                        onClick={() => setMethod('Gift Card')}
                        className={`flex-1 py-3 rounded-xl border font-semibold transition-all ${method === 'Gift Card' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                        Gift Card
                    </button>
                    <button 
                        type="button"
                        onClick={() => setMethod('Crypto')}
                        className={`flex-1 py-3 rounded-xl border font-semibold transition-all ${method === 'Crypto' ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-600/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
                    >
                        Crypto
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Amount (USD)</label>
                <input 
                    type="number" 
                    min="1" 
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(parseFloat(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-semibold"
                />
            </div>

            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">
                    {method === 'Gift Card' ? 'Email for Gift Card' : 'USDT BEP20 Address / Binance ID'}
                </label>
                <input 
                    type="text" 
                    placeholder={method === 'Gift Card' ? 'your@email.com' : '0x... or 123456'}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all font-medium"
                />
            </div>

            <button 
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-500/20 transition-all transform active:scale-95 mt-4"
            >
                Confirm Withdrawal
            </button>
            <p className="text-[10px] text-center text-slate-500 uppercase font-bold tracking-widest">Processed manually within 48h</p>
          </form>
        </div>

        {/* Withdrawal History */}
        <div className="space-y-4">
          <h3 className="text-xl font-poppins font-bold">Recent History</h3>
          <div className="space-y-3">
            {withdrawals.length > 0 ? withdrawals.map(w => (
              <div key={w.id} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">${w.amount.toFixed(2)}</span>
                        <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-medium">{w.method}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 truncate max-w-[150px]">{w.details}</p>
                </div>
                <div className="text-right">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                        w.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                        {w.status.toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-600 mt-1">{new Date(w.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )) : (
              <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-12 text-center text-slate-500 italic">
                No withdrawals yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
