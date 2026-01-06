
import { User, Task, Submission, Withdrawal } from './types';

/**
 * MOCK DATABASE SERVICE
 * This file simulates a backend using localStorage.
 * In a real production app, these would be API calls to MongoDB.
 */

const STORAGE_KEYS = {
  USERS: 'mx_users',
  TASKS: 'mx_tasks',
  SUBMISSIONS: 'mx_submissions',
  WITHDRAWALS: 'mx_withdrawals',
  CURRENT_USER: 'mx_current_user'
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

const setToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const DB = {
  // Users
  getUsers: (): User[] => getFromStorage(STORAGE_KEYS.USERS, []),
  saveUser: (user: User) => {
    const users = DB.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) users[index] = user;
    else users.push(user);
    setToStorage(STORAGE_KEYS.USERS, users);
  },
  getCurrentUser: (): User | null => getFromStorage(STORAGE_KEYS.CURRENT_USER, null),
  setCurrentUser: (user: User | null) => setToStorage(STORAGE_KEYS.CURRENT_USER, user),

  // Tasks
  getTasks: (): Task[] => getFromStorage(STORAGE_KEYS.TASKS, []),
  addTask: (task: Task) => {
    const tasks = DB.getTasks();
    tasks.push(task);
    setToStorage(STORAGE_KEYS.TASKS, tasks);
  },
  updateTask: (task: Task) => {
    const tasks = DB.getTasks();
    const index = tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      tasks[index] = task;
      setToStorage(STORAGE_KEYS.TASKS, tasks);
    }
  },

  // Submissions
  getSubmissions: (): Submission[] => getFromStorage(STORAGE_KEYS.SUBMISSIONS, []),
  addSubmission: (sub: Submission) => {
    const subs = DB.getSubmissions();
    subs.push(sub);
    setToStorage(STORAGE_KEYS.SUBMISSIONS, subs);
  },
  updateSubmission: (sub: Submission) => {
    const subs = DB.getSubmissions();
    const index = subs.findIndex(s => s.id === sub.id);
    if (index > -1) {
      subs[index] = sub;
      setToStorage(STORAGE_KEYS.SUBMISSIONS, subs);
    }
  },

  // Withdrawals
  getWithdrawals: (): Withdrawal[] => getFromStorage(STORAGE_KEYS.WITHDRAWALS, []),
  addWithdrawal: (w: Withdrawal) => {
    const ws = DB.getWithdrawals();
    ws.push(w);
    setToStorage(STORAGE_KEYS.WITHDRAWALS, ws);
  }
};

// Initial Seed Data for Demo
if (DB.getUsers().length === 0) {
    // Provider Admin
    DB.saveUser({
        id: 'provider_1',
        username: 'AdminX',
        email: 'admin@marketingx.com',
        role: 'provider',
        balanceApproved: 0,
        balancePending: 0,
        redditVerified: true,
        redditKarma: 1000,
        redditAccountAge: 24,
        dailyTasksCompleted: 0,
        withdrawalsThisMonth: 0
    });
}
