import { create } from 'zustand';
import type { Agent,AgentStatus,Task,TaskStatus,Lead,LeadStatus,DecisionLog,KnowledgeItem,Notification } from '../types';
import { AGENTS } from '../data/mockData';
import { TASKS } from '../data/mockData';
import { LEADS } from '../data/mockData';
import { DECISIONS } from '../data/mockData';
import { KNOWLEDGE } from '../data/mockData';

// AGENT STORE
interface AgentStore {
  agents: Agent[];
  addAgent: (a: Agent) => void;
  updateAgent: (id: string, u: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setStatus: (id: string, s: AgentStatus) => void;
  addXP: (id: string, xp: number) => void;
}
export const useAgentStore = create<AgentStore>((set) => ({
  agents: AGENTS,
  addAgent: (a) => set((s) => ({ agents: [...s.agents, a] })),
  updateAgent: (id, u) => set((s) => ({ agents: s.agents.map((a) => a.id===id ? {...a,...u} : a) })),
  deleteAgent: (id) => set((s) => ({ agents: s.agents.filter((a) => a.id!==id) })),
  setStatus: (id, st) => set((s) => ({ agents: s.agents.map((a) => a.id===id ? {...a,status:st} : a) })),
  addXP: (id, xp) => set((s) => ({ agents: s.agents.map((a) => {
    if (a.id!==id) return a;
    const nx = (a.xp||0)+xp;
    return {...a, xp:nx, level: Math.floor(nx/1000)+1};
  })})),
}));

// TASK STORE
interface TaskStore {
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (id: string, u: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, s: TaskStatus) => void;
}
export const useTaskStore = create<TaskStore>((set) => ({
  tasks: TASKS,
  addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
  updateTask: (id, u) => set((s) => ({ tasks: s.tasks.map((t) => t.id===id ? {...t,...u} : t) })),
  deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id!==id) })),
  moveTask: (id, st) => set((s) => ({ tasks: s.tasks.map((t) => t.id===id ? {...t,status:st} : t) })),
}));

// LEAD STORE
interface LeadStore {
  leads: Lead[];
  addLead: (l: Lead) => void;
  updateLead: (id: string, u: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveStatus: (id: string, s: LeadStatus) => void;
}
export const useLeadStore = create<LeadStore>((set) => ({
  leads: LEADS,
  addLead: (l) => set((s) => ({ leads: [...s.leads, l] })),
  updateLead: (id, u) => set((s) => ({ leads: s.leads.map((l) => l.id===id ? {...l,...u} : l) })),
  deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id!==id) })),
  moveStatus: (id, st) => set((s) => ({ leads: s.leads.map((l) => l.id===id ? {...l,status:st} : l) })),
}));

// DECISION STORE
interface DecisionStore {
  decisions: DecisionLog[];
  addDecision: (d: DecisionLog) => void;
  updateDecision: (id: string, u: Partial<DecisionLog>) => void;
  deleteDecision: (id: string) => void;
}
export const useDecisionStore = create<DecisionStore>((set) => ({
  decisions: DECISIONS,
  addDecision: (d) => set((s) => ({ decisions: [...s.decisions, d] })),
  updateDecision: (id, u) => set((s) => ({ decisions: s.decisions.map((d) => d.id===id ? {...d,...u} : d) })),
  deleteDecision: (id) => set((s) => ({ decisions: s.decisions.filter((d) => d.id!==id) })),
}));

// KNOWLEDGE STORE
interface KnowledgeStore {
  items: KnowledgeItem[];
  addItem: (i: KnowledgeItem) => void;
  updateItem: (id: string, u: Partial<KnowledgeItem>) => void;
  deleteItem: (id: string) => void;
}
export const useKnowledgeStore = create<KnowledgeStore>((set) => ({
  items: KNOWLEDGE,
  addItem: (i) => set((s) => ({ items: [...s.items, i] })),
  updateItem: (id, u) => set((s) => ({ items: s.items.map((i) => i.id===id ? {...i,...u} : i) })),
  deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id!==id) })),
}));

// THEME STORE
type Theme = 'dark'|'light';
interface ThemeStore { theme: Theme; toggle: () => void; }
export const useThemeStore = create<ThemeStore>((set) => {
  const saved = (localStorage.getItem('theme') as Theme)||'light';
  if (saved==='light') document.documentElement.setAttribute('data-theme','light');
  return {
    theme: saved,
    toggle: () => set((s) => {
      const t = s.theme==='dark' ? 'light' : 'dark';
      localStorage.setItem('theme', t);
      if (t==='light') document.documentElement.setAttribute('data-theme','light');
      else document.documentElement.removeAttribute('data-theme');
      return { theme: t };
    }),
  };
});

// NOTIFICATION STORE
interface NotifStore {
  notifs: Notification[];
  add: (n: Omit<Notification,'id'|'created_at'|'read'>) => void;
  read: (id: string) => void;
  remove: (id: string) => void;
  unread: () => number;
}
export const useNotifStore = create<NotifStore>((set, get) => ({
  notifs: [
    { id:'n1', title:'Task Complete', message:'Coder completed auth system', type:'success', read:false, created_at:new Date(Date.now()-5*60000).toISOString() },
    { id:'n2', title:'Critical Alert', message:'Support: Customer data loss incident', type:'error', read:false, created_at:new Date(Date.now()-2*60000).toISOString() },
    { id:'n3', title:'Lead Qualified', message:'TechCorp Inc - Score: 92', type:'info', read:true, created_at:new Date(Date.now()-30*60000).toISOString() },
  ],
  add: (n) => set((s) => ({ notifs: [{ ...n, id:Math.random().toString(36).slice(2), created_at:new Date().toISOString(), read:false }, ...s.notifs] })),
  read: (id) => set((s) => ({ notifs: s.notifs.map((n) => n.id===id ? {...n,read:true} : n) })),
  remove: (id) => set((s) => ({ notifs: s.notifs.filter((n) => n.id!==id) })),
  unread: () => get().notifs.filter((n) => !n.read).length,
}));
