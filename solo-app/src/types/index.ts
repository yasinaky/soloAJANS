export type Department = 'engineering' | 'marketing' | 'support' | 'design' | 'sales' | 'analytics';
export type TaskStatus = 'backlog' | 'queued' | 'running' | 'review' | 'done' | 'blocked';
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type AutonomyLevel = 'low' | 'medium' | 'high' | 'full';
export type AgentStatus = 'active' | 'idle' | 'paused' | 'error' | 'running';
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';
export type KnowledgeCategory = 'sop' | 'prompt' | 'doc' | 'template' | 'guide';
export type DecisionStatus = 'pending' | 'active' | 'implemented' | 'cancelled';

export interface Agent {
  id: string;
  name: string;
  department: Department;
  role: string;
  objective: string;
  model: string;
  tools: string[];
  autonomy_level: AutonomyLevel;
  status: AgentStatus;
  schedule: string;
  guardrails: string[];
  success_rate: number;
  tasks_completed: number;
  last_run: string;
  queue_length: number;
  created_at: string;
  xp?: number;
  level?: number;
  avatar_color?: string;
  mood?: string;
  godmode?: boolean;
}

export interface SubTask {
  id: string;
  parent_task_id: string;
  title: string;
  description: string;
  department: Department;
  agent_id: string | null;
  agent_name?: string;
  status: TaskStatus;
  priority: Priority;
  progress: number;
  expected_output: string;
  actual_output?: string;
  created_at: string;
  updated_at: string;
  output_at?: string;
  due_date?: string;
  tags: string[];
}

export interface OrchestratedTask {
  id: string;
  title: string;
  description: string;
  status: 'awaiting' | 'planning' | 'executing' | 'aggregating' | 'completed' | 'failed';
  priority: Priority;
  orchestrator_id: string | null;
  orchestrator_name?: string;
  sub_tasks: SubTask[];
  aggregated_result?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  estimated_completion?: string;
  progress: number; // 0-100
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  department: Department;
  agent_id: string | null;
  agent_name?: string;
  priority: Priority;
  created_at: string;
  updated_at: string;
  output?: string;
  output_at?: string;
  due_date?: string;
  tags: string[];
  progress: number;
  // Orchestration fields
  is_orchestrated?: boolean;
  orchestration_id?: string; // OrchestratedTask.id referansı
}

export interface Lead {
  id: string;
  company: string;
  contact_name: string;
  email: string;
  phone?: string;
  source: string;
  status: LeadStatus;
  score: number;
  notes: string;
  next_action: string;
  deal_value?: number;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: KnowledgeCategory;
  department: string;
  tags: string[];
  assigned_agents: string[];
  created_at: string;
  updated_at: string;
  views: number;
  author: string;
}

export interface KPIRecord {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  department: Department;
  date: string;
  trend: 'up' | 'down' | 'stable';
  change_percent: number;
}

export interface DecisionLog {
  id: string;
  title: string;
  context: string;
  decision: string;
  rationale: string;
  owner: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  status: DecisionStatus;
  tags: string[];
  outcome?: string;
}

export interface DepartmentInfo {
  id: Department;
  name: string;
  name_tr: string;
  description: string;
  color: string;
  icon: string;
  bg: string;
}

export interface ClubRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  max_agents: number;
}

export interface WeeklyActivity {
  day: string;
  tasks: number;
  leads: number;
  decisions: number;
}

export interface Company {
  name: string;
  tagline: string;
  anthropic_api_key?: string;
  setup_complete: boolean;
  default_model?: string;
}
