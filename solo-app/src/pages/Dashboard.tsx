import { useState, useEffect } from 'react';
import { Activity, Zap, Target, TrendingUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAgentStore } from '../stores/index';
import { useTaskStore } from '../stores/index';
import { useLeadStore } from '../stores/index';
import { WEEKLY_ACTIVITY, KPI_DATA } from '../data/mockData';

export function Dashboard() {
  const agents = useAgentStore((s) => s.agents);
  const tasks = useTaskStore((s) => s.tasks);
  const leads = useLeadStore((s) => s.leads);
  const [count, setCount] = useState(0);

  const activeCount = agents.filter((a) => a.status === 'active' || a.status === 'running').length;
  useEffect(() => {
    let c = 0;
    const t = setInterval(() => { c++; setCount(c); if (c >= activeCount) clearInterval(t); }, 80);
    return () => clearInterval(t);
  }, [activeCount]);

  const kpis = [
    { icon: Zap, label: 'Aktif Ajan', value: count, total: agents.length, color: 'var(--cyan)' },
    { icon: Target, label: 'Açık Görev', value: tasks.filter((t) => t.status !== 'done').length, total: tasks.length, color: 'var(--purple)' },
    { icon: TrendingUp, label: 'Sıcak Lead', value: leads.filter((l) => l.status === 'qualified' || l.status === 'proposal').length, total: leads.length, color: 'var(--green)' },
    { icon: AlertCircle, label: 'Kritik Uyarı', value: 1, total: 3, color: 'var(--red)' },
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tp">Dashboard</h1><p className="ts text-sm mt-1">Şirketinizin günlük AI durumu</p></div>

      <div className="grid grid-cols-4 gap-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="sc">
              <div className="flex items-center justify-between mb-3">
                <span className="ts text-sm">{k.label}</span>
                <Icon size={20} style={{ color: k.color }} />
              </div>
              <div className="text-2xl font-bold tp">{k.value}</div>
              <div className="text-xs tm mt-1">/ {k.total} toplam</div>
              <div className="mt-3 h-1.5 rounded-full" style={{ background: 'var(--bg-s)' }}>
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(k.value/k.total)*100}%`, background: `linear-gradient(135deg, var(--cyan), var(--purple))` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Haftalık Aktivite</h2>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={WEEKLY_ACTIVITY}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="day" stroke="var(--tm)" fontSize={12} />
              <YAxis stroke="var(--tm)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 8 }} />
              <Legend />
              <Line type="monotone" dataKey="tasks" stroke="var(--cyan)" name="Görevler" strokeWidth={2} />
              <Line type="monotone" dataKey="leads" stroke="var(--green)" name="Leads" strokeWidth={2} />
              <Line type="monotone" dataKey="decisions" stroke="var(--yellow)" name="Kararlar" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">KPI Hedeflere Göre</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={KPI_DATA.slice(0,4)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
              <XAxis dataKey="name" stroke="var(--tm)" fontSize={11} />
              <YAxis stroke="var(--tm)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 8 }} />
              <Legend />
              <Bar dataKey="value" fill="var(--cyan)" name="Gerçek" radius={[4,4,0,0]} />
              <Bar dataKey="target" fill="var(--purple)" name="Hedef" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="glass p-6 col-span-2">
          <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Activity size={18} style={{ color: 'var(--cyan)' }} />Canlı Aktivite</h2>
          <div className="space-y-3">
            {[
              { agent:'Coder', action:'Auth sistemini push etti', time:'2 dk önce', icon:'✓' },
              { agent:'Lead Qualifier', action:'5 yeni lead qualify etti', time:'5 dk önce', icon:'🎯' },
              { agent:'Content Writer', action:'Blog yazısı yayınladı', time:'12 dk önce', icon:'✍️' },
              { agent:'Data Researcher', action:'Haftalık rapor oluşturdu', time:'18 dk önce', icon:'📊' },
              { agent:'Ticket Triage', action:'3 destek talebi çözdü', time:'25 dk önce', icon:'✓' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
                <span className="text-lg">{item.icon}</span>
                <div className="flex-1">
                  <span className="font-medium tp text-sm">{item.agent}</span>
                  <span className="ts text-sm"> — {item.action}</span>
                </div>
                <span className="text-xs tm">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Hızlı İşlemler</h2>
          <div className="space-y-2">
            <button className="btn-p w-full justify-center">+ Görev Oluştur</button>
            <button className="btn-g w-full justify-center">+ Ajan Ekle</button>
            <button className="btn-g w-full justify-center">+ Lead Ekle</button>
            <button className="btn-g w-full justify-center">Rapor Görüntüle</button>
          </div>
          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--bd)' }}>
            <div className="text-sm font-semibold tp mb-3">Sistem Durumu</div>
            {[['API','Online'],['Veritabanı','Sağlıklı'],['AI Modeller','Hazır']].map(([k,v]) => (
              <div key={k} className="flex items-center justify-between text-xs mb-2">
                <span className="tm">{k}</span>
                <span className="bdg bdg-g">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
