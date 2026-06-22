import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent,AgentStatus,Task,TaskStatus,Lead,LeadStatus,DecisionLog,ProposedDecision,KnowledgeItem,Notification,Company } from '../types';

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
      agents: [],
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
    { name: 'solo-agents', version: 2 }
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
      tasks: [],
      addTask: (t) => set((s) => ({ tasks: [...s.tasks, t] })),
      updateTask: (id, u) => set((s) => ({ tasks: s.tasks.map((t) => t.id===id ? {...t,...u} : t) })),
      deleteTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id!==id) })),
      moveTask: (id, st) => set((s) => ({ tasks: s.tasks.map((t) => t.id===id ? {...t,status:st,updated_at:new Date().toISOString()} : t) })),
    }),
    { name: 'solo-tasks', version: 2 }
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
      leads: [],
      addLead: (l) => set((s) => ({ leads: [...s.leads, l] })),
      updateLead: (id, u) => set((s) => ({ leads: s.leads.map((l) => l.id===id ? {...l,...u} : l) })),
      deleteLead: (id) => set((s) => ({ leads: s.leads.filter((l) => l.id!==id) })),
      moveStatus: (id, st) => set((s) => ({ leads: s.leads.map((l) => l.id===id ? {...l,status:st,updated_at:new Date().toISOString()} : l) })),
    }),
    { name: 'solo-leads', version: 2 }
  )
);

// DECISION STORE
interface DecisionStore {
  decisions: DecisionLog[];
  proposedDecisions: ProposedDecision[];
  addDecision: (d: DecisionLog) => void;
  updateDecision: (id: string, u: Partial<DecisionLog>) => void;
  deleteDecision: (id: string) => void;
  addProposed: (p: ProposedDecision) => void;
  approveProposed: (id: string, decision: DecisionLog) => void;
  removeProposed: (id: string) => void;
}
export const useDecisionStore = create<DecisionStore>()(
  persist(
    (set) => ({
      decisions: [],
      proposedDecisions: [],
      addDecision: (d) => set((s) => ({ decisions: [...s.decisions, d] })),
      updateDecision: (id, u) => set((s) => ({ decisions: s.decisions.map((d) => d.id===id ? {...d,...u} : d) })),
      deleteDecision: (id) => set((s) => ({ decisions: s.decisions.filter((d) => d.id!==id) })),
      addProposed: (p) => set((s) => ({ proposedDecisions: [...s.proposedDecisions, p] })),
      approveProposed: (id, decision) => set((s) => ({
        decisions: [...s.decisions, decision],
        proposedDecisions: s.proposedDecisions.filter((p) => p.id !== id),
      })),
      removeProposed: (id) => set((s) => ({ proposedDecisions: s.proposedDecisions.filter((p) => p.id !== id) })),
    }),
    { name: 'solo-decisions', version: 3 }
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
      items: [],
      addItem: (i) => set((s) => ({ items: [...s.items, i] })),
      updateItem: (id, u) => set((s) => ({ items: s.items.map((i) => i.id===id ? {...i,...u} : i) })),
      deleteItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id!==id) })),
    }),
    { name: 'solo-knowledge', version: 2 }
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
        name: '',
        tagline: '',
        mission: '',
        revenue_target: 0,
        team_size_target: 0,
        autonomy_limit: 'medium',
        spend_limit: 5000,
        default_model: 'claude-opus-4-8',
        require_approval: true,
        setup_complete: false,
        anthropic_api_key: '',
        supabase_url: '',
        supabase_anon_key: '',
      },
      updateCompany: (u) => set((s) => ({ company: { ...s.company, ...u } })),
    }),
    { name: 'solo-company', version: 3 }
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
      notifs: [],
      add: (n) => set((s) => ({ notifs: [{ ...n, id:Math.random().toString(36).slice(2), created_at:new Date().toISOString(), read:false }, ...s.notifs].slice(0,50) })),
      read: (id) => set((s) => ({ notifs: s.notifs.map((n) => n.id===id ? {...n,read:true} : n) })),
      remove: (id) => set((s) => ({ notifs: s.notifs.filter((n) => n.id!==id) })),
      unread: () => get().notifs.filter((n) => !n.read).length,
    }),
    { name: 'solo-notifs', version: 2 }
  )
);
