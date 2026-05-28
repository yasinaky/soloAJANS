import { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAgentStore, useTaskStore, useLeadStore } from '../stores/index';
import { WEEKLY_ACTIVITY, KPI_DATA } from '../data/mockData';

const LIVE_EVENTS = [
  { agent:'Coder', action:'yeni commit push etti', icon:'⚡' },
  { agent:'Lead Qualifier', action:'lead qualify etti', icon:'🎯' },
  { agent:'Content Writer', action:'blog yazısı tamamladı', icon:'✍️' },
  { agent:'Data Researcher', action:'analiz raporu oluşturdu', icon:'📊' },
  { agent:'Ticket Triage', action:'destek talebini çözdü', icon:'✅' },
  { agent:'SEO Planner', action:'anahtar kelime analizi yaptı', icon:'🔍' },
  { agent:'UI Designer', action:'yeni tasarım teslim etti', icon:'🎨' },
  { agent:'Report Builder', action:'KPI dashboard güncelledi', icon:'📈' },
  { agent:'Outreach Drafter', action:'10 kişiye outreach gönderdi', icon:'📧' },
  { agent:'Brand Guardian', action:'marka kılavuzunu güncelledi', icon:'🛡️' },
];

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return `${s} sn önce`;
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  return `${Math.floor(s / 3600)} sa önce`;
}

export function Dashboard() {
  const navigate = useNavigate();
  const agents = useAgentStore((s) => s.agents);
  const tasks = useTaskStore((s) => s.tasks);
  const leads = useLeadStore((s) => s.leads);
  const [count, setCount] = useState(0);
  const [tick, setTick] = useState(0);

  const activeCount = agents.filter((a) => a.status === 'active' || a.status === 'running').length;

  const [feed, setFeed] = useState(() =>
    [
      { agent:'Coder', action:'auth sistemini push etti', icon:'⚡', time: new Date(Date.now() - 2 * 60000) },
      { agent:'Lead Qualifier', action:'5 yeni lead qualify etti', icon:'🎯', time: new Date(Date.now() - 5 * 60000) },
      { agent:'Content Writer', action:'blog yazısı yayınladı', icon:'✍️', time: new Date(Date.now() - 12 * 60000) },
      { agent:'Data Researcher', action:'haftalık rapor oluşturdu', icon:'📊', time: new Date(Date.now() - 18 * 60000) },
      { agent:'Ticket Triage', action:'3 destek talebi çözdü', icon:'✅', time: new Date(Date.now() - 25 * 60000) },
    ]
  );
  const feedRef = useRef(feed);
  feedRef.current = feed;

  useEffect(() => {
    let c = 0;
    const t = setInterval(() => { c++; setCount(c); if (c >= activeCount) clearInterval(t); }, 70);
    return () => clearInterval(t);
  }, [activeCount]);

  useEffect(() => {
    const t = setInterval(() => {
      const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      setFeed((f) => [{ ...ev, time: new Date() }, ...f.slice(0, 7)]);
      setTick((n) => n + 1);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const kpis = [
    { icon: Zap, label: 'Aktif Ajan', value: count, total: agents.length, color: 'var(--cyan)', path:'/agents' },
    { icon: Target, label: 'Açık Görev', value: tasks.filter((t) => t.status !== 'done').length, total: tasks.length, color: 'var(--purple)', path:'/workflows' },
    { icon: TrendingUp, label: 'Sıcak Lead', value: leads.filter((l) => l.status === 'qualified' || l.status === 'proposal').length, total: leads.length, color: 'var(--green)', path:'/leads' },
    { icon: AlertCircle, label: 'Kritik Görev', value: tasks.filter((t) => t.priority === 'critical').length, total: tasks.length, color: 'var(--red)', path:'/workflows' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">Dashboard</h1>
          <p className="ts text-sm mt-1">Şirketinizin AI durumu · Gerçek zamanlı</p>
        </div>
        <div className="flex items-center gap-2 text-xs tm">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background:'var(--green)', boxShadow:'0 0 6px var(--green)' }} />
          Canlı
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="sc cursor-pointer" onClick={() => navigate(k.path)}>
              <div className="flex items-center justify-between mb-3">
                <span className="ts text-sm">{k.label}</span>
                <Icon size={20} style={{ color: k.color }} />
              </div>
              <div className="text-2xl font-bold tp">{k.value}</div>
              <div className="text-xs tm mt-1">/ {k.total} toplam</div>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-s)' }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${k.total ? (k.value / k.total) * 100 : 0}%`, background: `linear-gradient(135deg, var(--cyan), var(--purple))` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Haftalık Aktivite</h2>
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={WEEKLY_ACTIVITY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="day" stroke="var(--tm)" fontSize={12} />
              <YAxis stroke="var(--tm)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 8, fontSize:12 }} />
              <Line type="monotone" dataKey="tasks" stroke="var(--cyan)" name="Görevler" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="leads" stroke="var(--green)" name="Leads" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="decisions" stroke="var(--yellow)" name="Kararlar" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">KPI Hedeflere Göre</h2>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={KPI_DATA.slice(0, 4)} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="name" stroke="var(--tm)" fontSize={11} />
              <YAxis stroke="var(--tm)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 8, fontSize:12 }} />
              <Bar dataKey="value" fill="var(--cyan)" name="Gerçek" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" fill="var(--purple)" name="Hedef" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass p-6 col-span-2">
          <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2">
            <Activity size={18} style={{ color: 'var(--cyan)' }} />
            Canlı Aktivite Feed
            <span className="ml-auto text-xs bdg bdg-g">● Canlı</span>
          </h2>
          <div className="space-y-2" key={tick}>
            {feed.slice(0, 6).map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg fadein"
                style={{ background: i === 0 ? 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(124,58,237,0.06))' : 'var(--bg-s)', border: '1px solid var(--bd)', animationDelay:`${i*0.05}s` }}>
                <span className="text-base flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold tp text-sm">{item.agent}</span>
                  <span className="ts text-sm"> — {item.action}</span>
                </div>
                <span className="text-xs tm flex-shrink-0">{timeAgo(item.time)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Hızlı İşlemler</h2>
          <div className="space-y-2">
            <button onClick={() => navigate('/workflows')} className="btn-p w-full justify-center">+ Görev Oluştur</button>
            <button onClick={() => navigate('/agents')} className="btn-g w-full justify-center">+ Ajan Ekle</button>
            <button onClick={() => navigate('/leads')} className="btn-g w-full justify-center">+ Lead Ekle</button>
            <button onClick={() => navigate('/analytics')} className="btn-g w-full justify-center">Analitik Görüntüle</button>
            <button onClick={() => navigate('/decisions')} className="btn-g w-full justify-center">Karar Ekle</button>
          </div>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--bd)' }}>
            <div className="text-sm font-semibold tp mb-3">Sistem Durumu</div>
            {[
              ['AI Modeller', 'Hazır', 'bdg-g'],
              ['API', 'Online', 'bdg-g'],
              ['Veritabanı', 'Sağlıklı', 'bdg-g'],
              ['Ajanlar', `${activeCount} Aktif`, 'bdg-c'],
            ].map(([k, v, cls]) => (
              <div key={k} className="flex items-center justify-between text-xs mb-2">
                <span className="tm">{k}</span>
                <span className={`bdg ${cls}`}>{v}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--bd)' }}>
            <div className="text-sm font-semibold tp mb-3">Departman Durumu</div>
            {[
              ['⚙️ Mühendislik', agents.filter((a) => a.department === 'engineering' && a.status === 'active').length],
              ['📢 Pazarlama', agents.filter((a) => a.department === 'marketing' && a.status === 'active').length],
              ['🛟 Destek', agents.filter((a) => a.department === 'support' && (a.status === 'active' || a.status === 'running')).length],
              ['💼 Satış', agents.filter((a) => a.department === 'sales' && a.status === 'active').length],
            ].map(([dept, count]) => (
              <div key={dept as string} className="flex items-center justify-between text-xs mb-2">
                <span className="ts">{dept as string}</span>
                <span className="bdg bdg-g">{count as number} aktif</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
