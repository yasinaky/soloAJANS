export type AgentStatus = 'active'|'idle'|'paused'|'error'|'running';
export type Department = 'engineering'|'marketing'|'support'|'design'|'sales'|'analytics';
export type TaskStatus = 'backlog'|'queued'|'running'|'review'|'done'|'blocked';
export type LeadStatus = 'new'|'contacted'|'qualified'|'proposal'|'won'|'lost';
export type DecisionStatus = 'active'|'pending'|'implemented'|'cancelled';
export type KnowledgeCategory = 'sop'|'prompt'|'doc'|'template'|'guide';
export type AutonomyLevel = 'low'|'medium'|'high'|'full';
export type Priority = 'low'|'medium'|'high'|'critical';

export interface Agent {
  id: string; name: string; department: Department; role: string;
  objective: string; model: string; tools: string[];
  autonomy_level: AutonomyLevel; status: AgentStatus;
  schedule: string; guardrails: string[];
  success_rate: number; tasks_completed: number;
  last_run: string; queue_length: number; created_at: string;
  mood?: string; xp?: number; level?: number; avatar_color?: string;
}
export interface Task {
  id: string; title: string; description: string;
  status: TaskStatus; department: Department;
  agent_id: string|null; agent_name?: string;
  priority: Priority; created_at: string; updated_at: string;
  due_date?: string; tags: string[]; progress?: number;
  output?: string; output_at?: string; approved?: boolean;
}

export interface Company {
  name: string; tagline: string; mission: string;
  revenue_target: number; team_size_target: number;
  autonomy_limit: string; spend_limit: number;
  default_model: string; require_approval: boolean;
  setup_complete: boolean;
}
export interface Lead {
  id: string; company: string; contact_name: string;
  email: string; phone?: string; source: string;
  status: LeadStatus; score: number; notes: string;
  next_action: string; next_action_date?: string;
  deal_value?: number; created_at: string; updated_at: string; tags: string[];
}
export interface KnowledgeItem {
  id: string; title: string; content: string;
  category: KnowledgeCategory; department: Department|'all';
  tags: string[]; assigned_agents: string[];
  created_at: string; updated_at: string; views: number; author: string;
}
export interface KPIRecord {
  id: string; name: string; value: number; target: number;
  unit: string; department: Department; date: string;
  trend: 'up'|'down'|'stable'; change_percent: number;
}
export interface DecisionLog {
  id: string; title: string; context: string;
  decision: string; rationale: string; owner: string;
  impact: 'low'|'medium'|'high'|'critical';
  date: string; status: DecisionStatus; tags: string[]; outcome?: string;
}
export interface Notification {
  id: string; title: string; message: string;
  type: 'info'|'success'|'warning'|'error';
  read: boolean; created_at: string; link?: string;
}
export interface DepartmentInfo {
  id: Department; name: string; name_tr: string;
  description: string; color: string; icon: string; bg: string;
}
export interface ClubRoom {
  id: string; name: string; description: string;
  icon: string; color: string; max_agents: number;
}
export interface WeeklyActivity { day: string; tasks: number; leads: number; decisions: number; }
