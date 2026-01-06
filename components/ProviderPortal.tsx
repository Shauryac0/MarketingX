
import React, { useState, useEffect } from 'react';
import { User, Task, Submission } from '../types';
import { DB } from '../storage';

interface ProviderPortalProps {
  user: User;
}

const ProviderPortal: React.FC<ProviderPortalProps> = ({ user }) => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [showTaskForm, setShowTaskForm] = useState(false);
  
  // Task form state
  const [taskName, setTaskName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskReward, setTaskReward] = useState(0.20);
  const [taskSlots, setTaskSlots] = useState(10);
  const [taskLimit, setTaskLimit] = useState(30);

  useEffect(() => {
    // In a real app, providers only see submissions for THEIR tasks
    setSubmissions(DB.getSubmissions());
  }, []);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const newTask: Task = {
        id: Math.random().toString(36).substr(2, 9),
        providerId: user.id,
        name: taskName,
        description: taskDesc,
        rewardAmount: taskReward,
        totalSlots: taskSlots,
        slotsTaken: 0,
        timeLimit: taskLimit,
        createdAt: Date.now()
    };
    DB.addTask(newTask);
    setShowTaskForm(false);
    setTaskName('');
    setTaskDesc('');
    alert('Task campaign created successfully!');
  };

  const handleApprove = (sub: Submission) => {
    const updatedSub: Submission = { ...sub, status: 'approved' };
    DB.updateSubmission(updatedSub);

    // Find the user and update their balance
    const users = DB.getUsers();
    const targetUser = users.find(u => u.id === sub.userId);
    if (targetUser) {
        targetUser.balancePending -= sub.rewardAmount;
        targetUser.balanceApproved += sub.rewardAmount;
        DB.saveUser(targetUser);
    }

    setSubmissions(submissions.map(s => s.id === sub.id ? updatedSub : s));
  };

  const handleReject = (sub: Submission) => {
    const updatedSub: Submission = { ...sub, status: 'rejected' };
    DB.updateSubmission(updatedSub);

    // Find user and remove pending
    const users = DB.getUsers();
    const targetUser = users.find(u => u.id === sub.userId);
    if (targetUser) {
        targetUser.balancePending -= sub.rewardAmount;
        DB.saveUser(targetUser);
    }

    setSubmissions(submissions.map(s => s.id === sub.id ? updatedSub : s));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
            <h2 className="text-3xl font-poppins font-bold">Provider Control Panel</h2>
            <p className="text-slate-500">Manage campaigns and review user submissions.</p>
        </div>
        <button 
            onClick={() => setShowTaskForm(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
        >
            <span className="text-xl">+</span> Create New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Statistics */}
        <div className="lg:col-span-1 space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Campaigns</p>
                <p className="text-2xl font-bold mt-1">{DB.getTasks().length}</p>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Pending Approvals</p>
                <p className="text-2xl font-bold mt-1 text-amber-500">{submissions.filter(s => s.status === 'pending').length}</p>
            </div>
        </div>

        {/* Submission Review Table */}
        <div className="lg:col-span-3">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="font-bold">Recent Submissions</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-950/50 text-xs font-bold text-slate-500 uppercase">
                            <tr>
                                <th className="px-5 py-4">User / Task</th>
                                <th className="px-5 py-4">Submitted</th>
                                <th className="px-5 py-4">Proof</th>
                                <th className="px-5 py-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {submissions.length > 0 ? submissions.map(sub => (
                                <tr key={sub.id} className="hover:bg-slate-800/30 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="font-bold text-sm">User ID: {sub.userId.substring(0,6)}</div>
                                        <div className="text-xs text-slate-400">{sub.taskName}</div>
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500">
                                        {new Date(sub.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-5 py-4">
                                        <a href={sub.proofUrl} target="_blank" rel="noreferrer" className="text-indigo-400 text-xs font-bold hover:underline">View Image</a>
                                    </td>
                                    <td className="px-5 py-4">
                                        {sub.status === 'pending' ? (
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleApprove(sub)}
                                                    className="px-3 py-1.5 bg-emerald-600/20 text-emerald-500 border border-emerald-600/30 rounded-lg text-xs font-bold hover:bg-emerald-600/40"
                                                >
                                                    Approve
                                                </button>
                                                <button 
                                                    onClick={() => handleReject(sub)}
                                                    className="px-3 py-1.5 bg-rose-600/20 text-rose-500 border border-rose-600/30 rounded-lg text-xs font-bold hover:bg-rose-600/40"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className={`text-xs font-bold ${sub.status === 'approved' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {sub.status.toUpperCase()}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-5 py-12 text-center text-slate-500 italic">No submissions yet.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>

      {/* Task Creation Modal Overlay */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-8 space-y-6 animate-scaleIn shadow-2xl">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-poppins font-bold">Create Campaign</h3>
                    <button onClick={() => setShowTaskForm(false)} className="text-slate-500 hover:text-white text-2xl">&times;</button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Task Title</label>
                        <input 
                            required 
                            type="text" 
                            placeholder="e.g. Subscribe to my YouTube"
                            value={taskName}
                            onChange={e => setTaskName(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">Description / Instructions</label>
                        <textarea 
                            required 
                            rows={3}
                            placeholder="Explain exactly what the user needs to do..."
                            value={taskDesc}
                            onChange={e => setTaskDesc(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Reward ($)</label>
                            <input 
                                required 
                                type="number" 
                                step="0.01"
                                value={taskReward}
                                onChange={e => setTaskReward(parseFloat(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase">Total Slots</label>
                            <input 
                                required 
                                type="number" 
                                value={taskSlots}
                                onChange={e => setTaskSlots(parseInt(e.target.value))}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>
                    <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20">
                        Launch Campaign
                    </button>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default ProviderPortal;
