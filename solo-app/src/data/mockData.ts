import type { Agent,Task,Lead,KnowledgeItem,KPIRecord,DecisionLog,DepartmentInfo,ClubRoom,WeeklyActivity } from '../types';

export const DEPARTMENTS: DepartmentInfo[] = [
  { id:'engineering', name:'Engineering', name_tr:'Mühendislik', description:'Product development & infrastructure', color:'#00d4ff', icon:'⚙️', bg:'rgba(0,212,255,0.1)' },
  { id:'marketing', name:'Marketing', name_tr:'Pazarlama', description:'Content, campaigns & growth', color:'#f59e0b', icon:'📢', bg:'rgba(245,158,11,0.1)' },
  { id:'support', name:'Support', name_tr:'Destek', description:'Customer service & help', color:'#10b981', icon:'🛟', bg:'rgba(16,185,129,0.1)' },
  { id:'design', name:'Design', name_tr:'Tasarım', description:'UI/UX & brand design', color:'#ec4899', icon:'🎨', bg:'rgba(236,72,153,0.1)' },
  { id:'sales', name:'Sales', name_tr:'Satış', description:'Lead gen & deal closing', color:'#ef4444', icon:'💼', bg:'rgba(239,68,68,0.1)' },
  { id:'analytics', name:'Analytics', name_tr:'Veri Analizi', description:'Data insights & reporting', color:'#7c3aed', icon:'📊', bg:'rgba(124,58,237,0.1)' },
];

export const AGENTS: Agent[] = [
  { id:'a1', name:'Coder', department:'engineering', role:'Full Stack Dev', objective:'Build & ship features', model:'GPT-4', tools:['GitHub','VS Code','Terminal'], autonomy_level:'high', status:'active', schedule:'Mon-Fri 9-17', guardrails:['No prod changes without review'], success_rate:94, tasks_completed:287, last_run:'2 min ago', queue_length:3, created_at:'2024-01-15', mood:'Focused', xp:4500, level:8, avatar_color:'#00d4ff' },
  { id:'a2', name:'QA Reviewer', department:'engineering', role:'Quality Assurance', objective:'Test & validate releases', model:'Claude 3', tools:['Jest','Cypress'], autonomy_level:'medium', status:'active', schedule:'Mon-Fri 9-17', guardrails:['Must log all bugs'], success_rate:98, tasks_completed:156, last_run:'5 min ago', queue_length:1, created_at:'2024-01-20', mood:'Detail-oriented', xp:3200, level:6, avatar_color:'#00d4ff' },
  { id:'a3', name:'Content Writer', department:'marketing', role:'Content Creator', objective:'Write engaging blog posts', model:'GPT-4 Turbo', tools:['Notion','SEO Tools'], autonomy_level:'high', status:'active', schedule:'Daily 10-16', guardrails:['Brand voice consistency'], success_rate:91, tasks_completed:234, last_run:'10 min ago', queue_length:5, created_at:'2024-02-01', mood:'Creative', xp:3800, level:7, avatar_color:'#f59e0b' },
  { id:'a4', name:'SEO Planner', department:'marketing', role:'SEO Specialist', objective:'Optimize content & keywords', model:'Claude 3', tools:['Ahrefs','SEMrush'], autonomy_level:'medium', status:'idle', schedule:'Mon,Wed,Fri', guardrails:['White hat only'], success_rate:87, tasks_completed:98, last_run:'2 hours ago', queue_length:0, created_at:'2024-02-10', mood:'Analytical', xp:2400, level:5, avatar_color:'#f59e0b' },
  { id:'a5', name:'Ticket Triage', department:'support', role:'Support Coordinator', objective:'Route & prioritize tickets', model:'GPT-3.5', tools:['Zendesk','Slack'], autonomy_level:'high', status:'active', schedule:'24/7', guardrails:['P1 < 1h response'], success_rate:93, tasks_completed:5432, last_run:'30 sec ago', queue_length:12, created_at:'2023-12-01', mood:'Helpful', xp:8900, level:12, avatar_color:'#10b981' },
  { id:'a6', name:'Response Drafter', department:'support', role:'Support Agent', objective:'Draft helpful responses', model:'Claude 3', tools:['Email','Knowledge Base'], autonomy_level:'medium', status:'running', schedule:'24/7', guardrails:['Empathetic tone'], success_rate:89, tasks_completed:3421, last_run:'1 min ago', queue_length:8, created_at:'2023-12-15', mood:'Empathetic', xp:6200, level:9, avatar_color:'#10b981' },
  { id:'a7', name:'UI Designer', department:'design', role:'UI/UX Designer', objective:'Create beautiful interfaces', model:'GPT-4 Vision', tools:['Figma','Adobe XD'], autonomy_level:'medium', status:'active', schedule:'Mon-Fri 10-18', guardrails:['Design system compliance'], success_rate:92, tasks_completed:145, last_run:'15 min ago', queue_length:2, created_at:'2024-01-10', mood:'Inspired', xp:3100, level:6, avatar_color:'#ec4899' },
  { id:'a8', name:'Brand Guardian', department:'design', role:'Brand Manager', objective:'Maintain brand consistency', model:'Claude 3', tools:['Brand Guidelines','Figma'], autonomy_level:'low', status:'paused', schedule:'On-demand', guardrails:['Brand compliance only'], success_rate:96, tasks_completed:87, last_run:'4 hours ago', queue_length:0, created_at:'2024-02-05', mood:'Protective', xp:2100, level:4, avatar_color:'#ec4899' },
  { id:'a9', name:'Lead Qualifier', department:'sales', role:'Lead Generation', objective:'Qualify & score leads', model:'GPT-4', tools:['Salesforce','LinkedIn'], autonomy_level:'high', status:'active', schedule:'Mon-Fri 8-17', guardrails:['GDPR compliant'], success_rate:85, tasks_completed:892, last_run:'3 min ago', queue_length:18, created_at:'2023-11-20', mood:'Motivated', xp:7100, level:10, avatar_color:'#ef4444' },
  { id:'a10', name:'Outreach Drafter', department:'sales', role:'Outreach Specialist', objective:'Personalize outreach msgs', model:'Claude 3', tools:['Email','LinkedIn'], autonomy_level:'medium', status:'active', schedule:'Daily 9-15', guardrails:['No spam templates'], success_rate:76, tasks_completed:654, last_run:'5 min ago', queue_length:22, created_at:'2023-12-10', mood:'Persuasive', xp:5300, level:8, avatar_color:'#ef4444' },
  { id:'a11', name:'Data Researcher', department:'analytics', role:'Data Analyst', objective:'Extract & analyze data', model:'GPT-4', tools:['Python','SQL','Jupyter'], autonomy_level:'high', status:'running', schedule:'Mon-Fri 9-17', guardrails:['Data privacy'], success_rate:94, tasks_completed:412, last_run:'2 min ago', queue_length:3, created_at:'2024-01-05', mood:'Curious', xp:4800, level:8, avatar_color:'#7c3aed' },
  { id:'a12', name:'Report Builder', department:'analytics', role:'BI Engineer', objective:'Create insightful reports', model:'Claude 3', tools:['Tableau','Power BI','SQL'], autonomy_level:'medium', status:'active', schedule:'Daily 10-16', guardrails:['Executive ready'], success_rate:91, tasks_completed:287, last_run:'8 min ago', queue_length:2, created_at:'2024-01-22', mood:'Organized', xp:3600, level:7, avatar_color:'#7c3aed' },
];

export const TASKS: Task[] = [
  { id:'t1', title:'Implement auth system', description:'Build OAuth2 with Google/GitHub', status:'running', department:'engineering', agent_id:'a1', agent_name:'Coder', priority:'critical', created_at:'2024-04-15', updated_at:'2024-04-16', tags:['backend','auth'], progress:65 },
  { id:'t2', title:'Write blog post on AI trends', description:'SEO optimized, 2000+ words', status:'review', department:'marketing', agent_id:'a3', agent_name:'Content Writer', priority:'high', created_at:'2024-04-14', updated_at:'2024-04-16', tags:['content','seo'], progress:90 },
  { id:'t3', title:'Fix critical support ticket', description:'Customer lost data - urgent', status:'running', department:'support', agent_id:'a5', agent_name:'Ticket Triage', priority:'critical', created_at:'2024-04-16', updated_at:'2024-04-16', tags:['urgent','critical'], progress:45 },
  { id:'t4', title:'Design new dashboard', description:'Responsive, dark mode ready', status:'queued', department:'design', agent_id:'a7', agent_name:'UI Designer', priority:'high', created_at:'2024-04-15', updated_at:'2024-04-16', tags:['design','ui'], progress:20 },
  { id:'t5', title:'Qualify 50 inbound leads', description:'Score & categorize from form', status:'running', department:'sales', agent_id:'a9', agent_name:'Lead Qualifier', priority:'high', created_at:'2024-04-16', updated_at:'2024-04-16', tags:['sales','leads'], progress:72 },
  { id:'t6', title:'Generate weekly KPI report', description:'All departments, exec summary', status:'backlog', department:'analytics', agent_id:null, priority:'medium', created_at:'2024-04-16', updated_at:'2024-04-16', tags:['analytics','reporting'], progress:0 },
];

export const LEADS: Lead[] = [
  { id:'l1', company:'TechCorp Inc', contact_name:'John Smith', email:'john@techcorp.com', source:'Website Form', status:'qualified', score:92, notes:'Perfect fit for enterprise plan', next_action:'Schedule demo', deal_value:45000, created_at:'2024-04-10', updated_at:'2024-04-16', tags:['enterprise','hot'] },
  { id:'l2', company:'StartupXYZ', contact_name:'Sarah Chen', email:'sarah@startupxyz.com', source:'LinkedIn', status:'contacted', score:68, notes:'Interested but budget constraints', next_action:'Send pricing options', deal_value:8500, created_at:'2024-04-12', updated_at:'2024-04-16', tags:['startup'] },
  { id:'l3', company:'Enterprise Solutions', contact_name:'Mike Johnson', email:'mike@enterprise.com', source:'Partner Referral', status:'proposal', score:85, notes:'Waiting on legal review', next_action:'Follow up on contract', deal_value:120000, created_at:'2024-04-05', updated_at:'2024-04-15', tags:['enterprise','high-value'] },
  { id:'l4', company:'SmallBiz Co', contact_name:'Emma Wilson', email:'emma@smallbiz.com', source:'Google Ads', status:'new', score:45, notes:'Early stage, exploring options', next_action:'Initial call', deal_value:3000, created_at:'2024-04-16', updated_at:'2024-04-16', tags:['cold-lead'] },
  { id:'l5', company:'GlobalCorp', contact_name:'Robert Brown', email:'robert@globalcorp.com', source:'LinkedIn', status:'won', score:98, notes:'Deal closed! 🎉', next_action:'Onboarding', deal_value:250000, created_at:'2024-03-01', updated_at:'2024-04-16', tags:['won','enterprise'] },
];

export const KNOWLEDGE: KnowledgeItem[] = [
  { id:'k1', title:'Brand Voice Guidelines', content:'Write friendly, professional, empowering tone. Avoid jargon.', category:'guide', department:'all', tags:['brand','voice'], assigned_agents:['a3','a7'], created_at:'2024-01-10', updated_at:'2024-04-10', views:234, author:'Brand Team' },
  { id:'k2', title:'API Integration Guide', content:'Step-by-step guide for integrating our REST API...', category:'guide', department:'engineering', tags:['api','integration'], assigned_agents:['a1','a2'], created_at:'2024-02-01', updated_at:'2024-04-12', views:567, author:'Tech Lead' },
  { id:'k3', title:'Lead Qualification Framework', content:'Score matrix: Company size 20%, Budget 30%, Timeline 20%, Pain 30%', category:'template', department:'sales', tags:['sales','leads'], assigned_agents:['a9','a10'], created_at:'2024-01-20', updated_at:'2024-04-14', views:234, author:'Sales Manager' },
  { id:'k4', title:'Incident Response SOP', content:'Immediate actions: 1. Assess 2. Notify 3. Mitigate 4. Communicate', category:'sop', department:'support', tags:['incident','response'], assigned_agents:['a5','a6'], created_at:'2024-01-15', updated_at:'2024-04-11', views:432, author:'Support Lead' },
];

export const KPI_DATA: KPIRecord[] = [
  { id:'1', name:'Revenue', value:485000, target:450000, unit:'USD', department:'sales', date:'2024-04-16', trend:'up', change_percent:7.8 },
  { id:'2', name:'Lead Conversion', value:18, target:15, unit:'%', department:'sales', date:'2024-04-16', trend:'up', change_percent:3.2 },
  { id:'3', name:'CSAT', value:92, target:90, unit:'score', department:'support', date:'2024-04-16', trend:'stable', change_percent:0.5 },
  { id:'4', name:'Content Pages', value:45, target:40, unit:'posts', department:'marketing', date:'2024-04-16', trend:'up', change_percent:5.2 },
  { id:'5', name:'Code Quality', value:94, target:90, unit:'%', department:'engineering', date:'2024-04-16', trend:'stable', change_percent:1.1 },
  { id:'6', name:'Data Accuracy', value:98, target:95, unit:'%', department:'analytics', date:'2024-04-16', trend:'up', change_percent:2.3 },
];

export const DECISIONS: DecisionLog[] = [
  { id:'d1', title:'Switch to Postgres for analytics', context:'MySQL hitting limits at 10M records', decision:'Migrate to Postgres with read replicas', rationale:'Better scaling, native JSON support, JSONB indexing', owner:'Coder', impact:'high', date:'2024-04-10', status:'implemented', tags:['infrastructure','database'], outcome:'Query times improved 60%, cost increased 15%' },
  { id:'d2', title:'Hire freelance designer', context:'Backlog of design tasks growing', decision:'Contract 2 designers for 3 months', rationale:'Faster turnaround, cost-effective vs full-time', owner:'Design Lead', impact:'medium', date:'2024-04-08', status:'active', tags:['hiring','design'] },
  { id:'d3', title:'Enter Japanese market', context:'Growing demand from Japan segment', decision:'Launch JP localization + support in Q3', rationale:'8% of inbound leads, estimated $2M ARR potential', owner:'Founder', impact:'critical', date:'2024-04-01', status:'pending', tags:['expansion','strategy'] },
];

export const CLUB_ROOMS: ClubRoom[] = [
  { id:'lounge', name:'Main Lounge', description:'General hangout & casual chat', icon:'☕', color:'#00d4ff', max_agents:8 },
  { id:'strategy', name:'Strategy Room', description:'Plan & strategize together', icon:'🎯', color:'#7c3aed', max_agents:6 },
  { id:'lab', name:'Experiment Lab', description:'Try new ideas & experiments', icon:'🧪', color:'#f59e0b', max_agents:5 },
  { id:'rest', name:'Rest Corner', description:'Chill & recharge', icon:'😌', color:'#10b981', max_agents:4 },
  { id:'stage', name:'Stage', description:'Showcase & celebrate wins', icon:'🎪', color:'#ec4899', max_agents:12 },
];

export const WEEKLY_ACTIVITY: WeeklyActivity[] = [
  { day:'Mon', tasks:24, leads:18, decisions:2 },
  { day:'Tue', tasks:31, leads:22, decisions:3 },
  { day:'Wed', tasks:28, leads:21, decisions:2 },
  { day:'Thu', tasks:35, leads:25, decisions:4 },
  { day:'Fri', tasks:29, leads:20, decisions:3 },
  { day:'Sat', tasks:12, leads:8, decisions:1 },
  { day:'Sun', tasks:8, leads:5, decisions:0 },
];
