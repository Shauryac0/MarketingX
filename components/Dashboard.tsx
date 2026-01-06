
import React, { useState, useEffect } from 'react';
import { User, Task, Submission } from '../types';
import { DB } from '../storage';

interface DashboardProps {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const Dashboard: React.FC<DashboardProps> = ({ user, setUser }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [proofFile, setProofFile] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    setTasks(DB.getTasks().filter(t => t.slotsTaken < t.totalSlots));
    setSubmissions(DB.getSubmissions().filter(s => s.userId === user.id));
  }, [user.id]);

  const canClaimTask = () => {
    if (!user.redditVerified) return { allowed: false, reason: 'Verify Reddit account first.' };
    
    // Rule: Max 4 tasks per day
    if (user.dailyTasksCompleted >= 4) return { allowed: false, reason: 'Daily task limit (4) reached.' };

    // Rule: 6 hour gap between tasks
    if (user.lastTaskTimestamp) {
        const sixHours = 6 * 60 * 60 * 1000;
        const timeSinceLast = Date.now() - user.lastTaskTimestamp;
        if (timeSinceLast < sixHours) {
            const minutesLeft = Math.ceil((sixHours - timeSinceLast) / (60 * 1000));
            return { allowed: false, reason: `Wait ${minutesLeft} more minutes (6h gap rule).` };
        }
    }

    return { allowed: true };
  };

  const handleClaim = (task: Task) => {
    const check = canClaimTask();
    if (!check.allowed) {
        setMessage({ type: 'error', text: check.reason || 'Cannot claim task.' });
        return;
    }
    setActiveTask(task);
    setMessage(null);
  };

  const handleProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = () => {
    if (!activeTask || !proofFile) return;

    const newSubmission: Submission = {
      id: Math.random().toString(36).substr(2, 9),
      taskId: activeTask.id,
      taskName: activeTask.name,
      userId: user.id,
      proofUrl: proofFile,
      status: 'pending',
      submittedAt: Date.now(),
      rewardAmount: activeTask.rewardAmount
    };

    DB.addSubmission(newSubmission);

    // Update User counters
    const updatedUser: User = {
        ...user,
        balancePending: user.balancePending + activeTask.rewardAmount,
        lastTaskTimestamp: Date.now(),
        dailyTasksCompleted: user.dailyTasksCompleted + 1
    };
    DB.saveUser(updatedUser);
    setUser(updatedUser);

    // Update Task slots
    const updatedTask = { ...activeTask, slotsTaken: activeTask.slotsTaken + 1 };
    DB.updateTask(updatedTask);

    // Reset local state
    setSubmissions([...submissions, newSubmission]);
    setActiveTask(null);
    setProofFile(null);
    setMessage({ type: 'success', text: 'Proof submitted! Reward pending approval.' });
  };

  const handleVerifyReddit = () => {
    // Simulated Reddit Verification
    const updatedUser: User = {
        ...user,
        redditVerified: true,
        redditKarma: 250,
        redditAccountAge: 5
    };
    DB.saveUser(updatedUser);
    setUser(updatedUser);
    setMessage({ type: 'success', text: 'Reddit Account Verified Successfully!' });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Verification Banner */}
      {!user.redditVerified && (
        <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-indigo-400">Reddit Verification Required</h3>
            <p className="text-sm text-slate-400">To prevent spam, your Reddit account must be 3+ months old with 200+ karma.</p>
          </div>
          <button 
            onClick={handleVerifyReddit}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20"
          >
            Verify Account
          </button>
        </div>
      )}

      {message && (
        <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Available Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-poppins font-bold">Available Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.length > 0 ? tasks.map(task => (
              <div key={task.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl hover:border-indigo-500/50 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-lg group-hover:text-indigo-400 transition-colors">{task.name}</h4>
                  <span className="bg-emerald-500/10 text-emerald-500 text-xs px-2 py-1 rounded-full font-bold">
                    ${task.rewardAmount.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4 line-clamp-2">{task.description}</p>
                <div className="flex items-center justify-between mt-auto">
                    <span className="text-xs text-slate-500">Slots: {task.slotsTaken}/{task.totalSlots}</span>
                    <button 
                        onClick={() => handleClaim(task)}
                        className="text-xs font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1"
                    >
                        Claim Task &rarr;
                    </button>
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-12 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800 text-slate-500">
                No tasks available right now. Check back later!
              </div>
            )}
          </div>
        </div>

        {/* Task Submission Sidebar */}
        <div className="space-y-4">
          <h2 className="text-2xl font-poppins font-bold">Current Task</h2>
          {activeTask ? (
            <div className="bg-slate-900 border border-indigo-500/30 p-6 rounded-2xl space-y-4 sticky top-24">
              <div>
                <h4 className="font-bold text-indigo-400">{activeTask.name}</h4>
                <p className="text-xs text-slate-400 mt-1">Limit: {activeTask.timeLimit} mins</p>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed">{activeTask.description}</p>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Upload Proof (Screenshot)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleProofUpload}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-indigo-600/20 file:text-indigo-400 hover:file:bg-indigo-600/30 transition-all cursor-pointer"
                />
              </div>

              {proofFile && (
                <div className="rounded-xl overflow-hidden border border-slate-800">
                  <img src={proofFile} alt="Proof preview" className="w-full h-32 object-cover" />
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button 
                  onClick={handleSubmitProof}
                  disabled={!proofFile}
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl font-bold hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Submit Proof
                </button>
                <button 
                  onClick={() => setActiveTask(null)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  &times;
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-2xl p-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-600 text-xl font-bold">?</div>
              <p className="text-sm text-slate-500">Select a task to start earning</p>
            </div>
          )}

          {/* User History List */}
          <div className="pt-4 space-y-3">
             <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h3>
             {submissions.length > 0 ? submissions.slice(0, 5).map(sub => (
                <div key={sub.id} className="bg-slate-900 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium truncate max-w-[120px]">{sub.taskName}</p>
                        <p className="text-[10px] text-slate-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        sub.status === 'pending' ? 'bg-amber-500/10 text-amber-500' : 
                        sub.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                        {sub.status.toUpperCase()}
                    </span>
                </div>
             )) : (
                <p className="text-xs text-slate-600 italic">No activity yet</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
