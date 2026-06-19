import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent,AgentStatus,Task,TaskStatus,Lead,LeadStatus,DecisionLog,KnowledgeItem,Notification,Company } from '../types';
import { AGENTS, TASKS, LEADS, DECISIONS, KNOWLEDGE } from '../data/mockData';

// AGENT STORE
interface AgentStore {
  agents: Agent[];
  addAgent: (a: Agent) => void;
  updateAgent: (id: string, u: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
  setStatus: (id: string, s: AgentStatus) => void;
  addXP: (id: string, xp: number) => void;
}
export const useAgentStore = create<AgentStore>()(
  persist(
    (set) => ({
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
    }),
    { name: 'solo-agents' }
  )
);

// TASK STORE
interface TaskStore {
  tasks: Task[];
  addTask: (t: Task) => void;
  updateTask: (id: string, u: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, s: TaskStatus) => void;
}
export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: TASKS,
      addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
      updateTask: (id, u) => set((s) => ({ tasks: s.tasks.map((t) => t.id===id ? {...t,...u} : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id!==id) })),
      moveTask: (id, st) => set((s) => ({ tasks: s.tasks.map((t) => t.id===id ? {...t,status:st,updated_at:new Date().toISOString()} : t) })),
    }),
    { name: 'solo-tasks' }
  )
);

// LEAD STORE
interface LeadStore {
  leads: Lead[];
  addLead: (l: Lead) => void;
  updateLead: (id: string, u: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveStatus: (id: string, s: LeadStatus) => void;
}
export const useLeadStore = create<LeadStore>()(
  persist(
    (set) => ({
      leads: LEADS,
      addLead: (l) => set((s) => ({ leads: [...s.leads, l] })),
      updateLead: (id, u) => set((s) => ({ leads: s.leads.map((l) => l.id===id ? {...l,...u} : l) })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id!==id) })),
      moveStatus: (id, st) => set((s) => ({ leads: s.leads.map((l) => l.id===id ? {...l,status:st,updated_at:new Date().toISOString()} : l) })),
    }),
    { name: 'solo-leads' }
  )
);

// DECISION STORE
interface DecisionStore {
  decisions: DecisionLog[];
  addDecision: (d: DecisionLog) => void;
  updateDecision: (id: string, u: Partial<DecisionLog>) => void;
  deleteDecision: (id: string) => void;
}
export const useDecisionStore = create<DecisionStore>()(
  persist(
    (set) => ({
      decisions: DECISIONS,
      addDecision: (d) => set((s) => ({ decisions: [...s.decisions, d] })),
      updateDecision: (id, u) => set((s) => ({ decisions: s.decisions.map((d) => d.id===id ? {...d,...u} : d) })),
      deleteDecision: (id) => set((s) => ({ decisions: s.decisions.filter((d) => d.id!==id) })),
    }),
    { name: 'solo-decisions' }
  )
);

// KNOWLEDGE STORE
interface KnowledgeStore {
  items: KnowledgeItem[];
  addItem: (i: KnowledgeItem) => void;
  updateItem: (id: string, u: Partial<KnowledgeItem>) => void;
  deleteItem: (id: string) => void;
}
export const useKnowledgeStore = create<KnowledgeStore>()(
  persist(
    (set) => ({
      items: KNOWLEDGE,
      addItem: (i) => set((s) => ({ items: [...s.items, i] })),
      updateItem: (id, u) => set((s) => ({ items: s.items.map((i) => i.id===id ? {...i,...u} : i) })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id!==id) })),
    }),
    { name: 'solo-knowledge' }
  )
);

// COMPANY STORE
interface CompanyStore {
  company: Company;
  updateCompany: (u: Partial<Company>) => void;
}
export const useCompanyStore = create<CompanyStore>()(
  persist(
    (set) => ({
      company: {
        name: 'My AI Company',
        tagline: 'AI Company Operating System',
        mission: 'Building the future with autonomous AI agents',
        revenue_target: 100000,
        team_size_target: 50,
        autonomy_limit: 'medium',
        spend_limit: 5000,
        default_model: 'Claude 3',
        require_approval: true,
      },
      updateCompany: (u) => set((s) => ({ company: { ...s.company, ...u } })),
    }),
    { name: 'solo-company' }
  )
);

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
export const useNotifStore = create<NotifStore>()(
  persist(
    (set, get) => ({
      notifs: [
        { id:'n1', title:'Sistem Hazır', message:'Solo OS başarıyla başlatıldı', type:'success' as const, read:false, created_at:new Date().toISOString() },
      ],
      add: (n) => set((s) => ({ notifs: [{ ...n, id:Math.random().toString(36).slice(2), created_at:new Date().toISOString(), read:false }, ...s.notifs].slice(0,50) })),
      read: (id) => set((s) => ({ notifs: s.notifs.map((n) => n.id===id ? {...n,read:true} : n) })),
      remove: (id) => set((s) => ({ notifs: s.notifs.filter((n) => n.id!==id) })),
      unread: () => get().notifs.filter((n) => !n.read).length,
    }),
    { name: 'solo-notifs' }
  )
);
