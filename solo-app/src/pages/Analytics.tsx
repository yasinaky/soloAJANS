import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAgentStore } from '../stores/index';
import { useTaskStore } from '../stores/index';
import { KPI_DATA, WEEKLY_ACTIVITY } from '../data/mockData';

const DEPT_PERF = [
  { name:'Mühendislik', eff:94 }, { name:'Pazarlama', eff:88 }, { name:'Destek', eff:91 },
  { name:'Tasarım', eff:87 }, { name:'Satış', eff:82 }, { name:'Analitik', eff:93 },
];
const COLORS = ['#10b981','#00d4ff','#f59e0b','#ec4899','#7c3aed'];
const TS = { contentStyle:{ background:'var(--bg-c)', border:'1px solid var(--bd)', borderRadius:8 } };

export function Analytics() {
  const agents = useAgentStore((s) => s.agents);
  const tasks = useTaskStore((s) => s.tasks);
  const pie = [
    { name:'Tamamlandı', value:tasks.filter(t=>t.status==='done').length },
    { name:'Çalışıyor', value:tasks.filter(t=>t.status==='running').length },
    { name:'İnceleme', value:tasks.filter(t=>t.status==='review').length },
    { name:'Kuyruk', value:tasks.filter(t=>t.status==='queued').length },
    { name:'Backlog', value:tasks.filter(t=>t.status==='backlog').length },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tp">Analitik & Raporlar</h1><p className="ts text-sm mt-1">AI operasyonlarınızın derin analizi</p></div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4">KPI Özeti — Gerçek vs Hedef</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={KPI_DATA}><CartesianGrid strokeDasharray="3 3" stroke="var(--bd)"/><XAxis dataKey="name" stroke="var(--tm)" fontSize={11}/><YAxis stroke="var(--tm)" fontSize={12}/><Tooltip {...TS}/><Legend/><Bar dataKey="value" fill="var(--cyan)" name="Gerçek" radius={[4,4,0,0]}/><Bar dataKey="target" fill="var(--purple)" name="Hedef" radius={[4,4,0,0]}/></BarChart>
        </ResponsiveContainer>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4">Departman Verimliliği</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={DEPT_PERF}><CartesianGrid strokeDasharray="3 3" stroke="var(--bd)"/><XAxis dataKey="name" stroke="var(--tm)" fontSize={11}/><YAxis stroke="var(--tm)" fontSize={12}/><Tooltip {...TS}/><Bar dataKey="eff" fill="var(--cyan)" name="Verimlilik %" radius={[4,4,0,0]}/></BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Haftalık Trend</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={WEEKLY_ACTIVITY}><CartesianGrid strokeDasharray="3 3" stroke="var(--bd)"/><XAxis dataKey="day" stroke="var(--tm)" fontSize={12}/><YAxis stroke="var(--tm)" fontSize={12}/><Tooltip {...TS}/><Legend/><Line type="monotone" dataKey="tasks" stroke="var(--cyan)" strokeWidth={2}/><Line type="monotone" dataKey="leads" stroke="var(--green)" strokeWidth={2}/></LineChart>
          </ResponsiveContainer>
        </div>
        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Görev Dağılımı</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart><Pie data={pie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({name,value})=>`${name}(${value})`}>{COLORS.map((c,i)=><Cell key={i} fill={c}/>)}</Pie><Tooltip {...TS}/></PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4">En İyi 5 Ajan</h2>
        <div className="space-y-3">
          {agents.sort((a,b)=>b.success_rate-a.success_rate).slice(0,5).map((a,i)=>(
            <div key={a.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background:'var(--bg-s)' }}>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold tcyan">#{i+1}</span>
                <div><div className="font-medium tp text-sm">{a.name}</div><div className="text-xs tm">{a.tasks_completed} görev</div></div>
              </div>
              <div className="text-right"><div className="font-bold tgreen text-lg">{a.success_rate}%</div><div className="text-xs tm">Başarı</div></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
