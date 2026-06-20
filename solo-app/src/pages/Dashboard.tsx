import { useEffect, useState } from 'react';
import { Activity, Zap, Target, TrendingUp, AlertCircle, Plus, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAgentStore, useTaskStore, useLeadStore, useDecisionStore, useNotifStore, useCompanyStore } from '../stores/index';
import { DEPARTMENTS } from '../data/mockData';

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} sn önce`;
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)} sa önce`;
  return `${Math.floor(s / 86400)} gün önce`;
}

const NOTIF_ICONS: Record<string, string> = { success: '✅', info: 'ℹ️', warning: '⚠️', error: '🔴' };

export function Dashboard() {
  const navigate = useNavigate();
  const agents = useAgentStore((s) => s.agents);
  const tasks = useTaskStore((s) => s.tasks);
  const leads = useLeadStore((s) => s.leads);
  const decisions = useDecisionStore((s) => s.decisions);
  const notifs = useNotifStore((s) => s.notifs);
  const company = useCompanyStore((s) => s.company);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 10000);
    return () => clearInterval(t);
  }, []);

  const activeCount = agents.filter((a) => a.status === 'active' || a.status === 'running').length;
  const isEmpty = agents.length === 0 && tasks.length === 0 && leads.length === 0;

  // Last 7 days activity from real data
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    const dayStr = d.toISOString().slice(0, 10);
    return {
      day: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
      Görevler: tasks.filter((t) => t.created_at?.slice(0, 10) === dayStr).length,
      Leadler: leads.filter((l) => l.created_at?.slice(0, 10) === dayStr).length,
      Kararlar: decisions.filter((d) => d.date?.slice(0, 10) === dayStr).length,
    };
  });

  // Tasks by department
  const deptData = DEPARTMENTS.map((d) => ({
    name: d.name_tr,
    Görev: tasks.filter((t) => t.department === d.id).length,
    Tamamlanan: tasks.filter((t) => t.department === d.id && t.status === 'done').length,
  }));

  const kpis = [
    { icon: Zap, label: 'Aktif Ajan', value: activeCount, total: agents.length, color: 'var(--cyan)', path: '/agents' },
    { icon: Target, label: 'Açık Görev', value: tasks.filter((t) => t.status !== 'done' && t.status !== 'blocked').length, total: tasks.length, color: 'var(--purple)', path: '/workflows' },
    { icon: TrendingUp, label: 'Sıcak Lead', value: leads.filter((l) => l.status === 'qualified' || l.status === 'proposal').length, total: leads.length, color: 'var(--green)', path: '/leads' },
    { icon: AlertCircle, label: 'İnceleme Bekleyen', value: tasks.filter((t) => t.status === 'review').length, total: tasks.length, color: 'var(--red)', path: '/workflows' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">
            {company.name ? `${company.name} — Dashboard` : 'Dashboard'}
          </h1>
          <p className="ts text-sm mt-1">Şirketinizin AI durumu · Gerçek zamanlı</p>
        </div>
        <div className="flex items-center gap-2 text-xs tm">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
          Canlı
        </div>
      </div>

      {/* Onboarding Banner */}
      {isEmpty && (
        <div className="glass p-8 text-center" style={{ borderColor: 'rgba(0,212,255,0.3)', background: 'linear-gradient(135deg,rgba(0,212,255,0.05),rgba(124,58,237,0.05))' }}>
          <div className="text-5xl mb-4">🚀</div>
          <h2 className="text-2xl font-bold tp mb-2">Şirketiniz kurulmaya hazır!</h2>
          <p className="ts text-sm mb-6 max-w-md mx-auto">
            Başlamak için önce AI ajanlarınızı oluşturun, sonra görev verin — sistem otomatik çalıştırır ve size sonuç sunar.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button onClick={() => navigate('/agents')} className="btn-p">
              <Users size={16} />İlk Ajanı Oluştur
            </button>
            <button onClick={() => navigate('/workflows')} className="btn-g">
              <Plus size={16} />Görev Oluştur
            </button>
            <button onClick={() => navigate('/settings')} className="btn-g">
              Şirket Bilgilerini Doldur <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8 text-left">
            {[
              { step: '1', icon: '🤖', title: 'Ajan Ekle', desc: 'Engineering, Marketing, Sales gibi departmanlara AI ajan ata', href: '/agents' },
              { step: '2', icon: '📋', title: 'Görev Ver', desc: 'Ajana bir görev ver — sistem otomatik alıp çalıştırır', href: '/workflows' },
              { step: '3', icon: '✅', title: 'Onayla', desc: 'Ajan çıktı üretince sen incele ve onayla', href: '/workflows' },
            ].map((s) => (
              <div key={s.step} onClick={() => navigate(s.href)}
                className="glass p-4 cursor-pointer hover:scale-105 transition-transform">
                <div className="text-2xl mb-2">{s.icon}</div>
                <div className="font-semibold tp text-sm mb-1">{s.step}. {s.title}</div>
                <div className="text-xs tm">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards */}
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
                  style={{ width: `${k.total ? (k.value / k.total) * 100 : 0}%`, background: 'linear-gradient(135deg,var(--cyan),var(--purple))' }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Son 7 Gün — Aktivite</h2>
          {tasks.length === 0 && leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 tm text-sm">
              <span className="text-3xl mb-2">📈</span>
              Görev ve lead ekledikçe grafik burada belirecek
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
                <XAxis dataKey="day" stroke="var(--tm)" fontSize={12} />
                <YAxis stroke="var(--tm)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="Görevler" stroke="var(--cyan)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Leadler" stroke="var(--green)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Kararlar" stroke="var(--yellow)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Departmana Göre Görevler</h2>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 tm text-sm">
              <span className="text-3xl mb-2">📊</span>
              Görev eklendikçe departman dağılımı burada görünecek
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={deptData.filter((d) => d.Görev > 0)} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--bd)" />
                <XAxis dataKey="name" stroke="var(--tm)" fontSize={10} />
                <YAxis stroke="var(--tm)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: 'var(--bg-c)', border: '1px solid var(--bd)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="Görev" fill="var(--cyan)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tamamlanan" fill="var(--green)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Live Activity Feed — from real notifications */}
        <div className="glass p-6 col-span-2" key={tick}>
          <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2">
            <Activity size={18} style={{ color: 'var(--cyan)' }} />
            Aktivite Feed
            <span className="ml-auto text-xs bdg bdg-g">● Canlı</span>
          </h2>
          {notifs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 tm text-sm">
              <span className="text-3xl mb-2">📭</span>
              Henüz aktivite yok. Ajan ekleyip görev verince burada göreceksin.
            </div>
          ) : (
            <div className="space-y-2">
              {notifs.slice(0, 7).map((n, i) => (
                <div key={n.id} className="flex items-center gap-3 p-3 rounded-lg fadein"
                  style={{ background: i === 0 ? 'linear-gradient(135deg,rgba(0,212,255,0.06),rgba(124,58,237,0.06))' : 'var(--bg-s)', border: '1px solid var(--bd)', animationDelay: `${i * 0.05}s` }}>
                  <span className="text-base flex-shrink-0">{NOTIF_ICONS[n.type] || 'ℹ️'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold tp text-sm">{n.title}</span>
                    <span className="ts text-sm"> — {n.message}</span>
                  </div>
                  <span className="text-xs tm flex-shrink-0">{timeAgo(n.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass p-6">
          <h2 className="text-lg font-semibold tp mb-4">Hızlı İşlemler</h2>
          <div className="space-y-2">
            <button onClick={() => navigate('/workflows')} className="btn-p w-full justify-center">+ Görev Oluştur</button>
            <button onClick={() => navigate('/agents')} className="btn-g w-full justify-center">+ Ajan Ekle</button>
            <button onClick={() => navigate('/leads')} className="btn-g w-full justify-center">+ Lead Ekle</button>
            <button onClick={() => navigate('/decisions')} className="btn-g w-full justify-center">+ Karar Ekle</button>
            <button onClick={() => navigate('/settings')} className="btn-g w-full justify-center">Şirket Ayarları</button>
          </div>

          <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--bd)' }}>
            <div className="text-sm font-semibold tp mb-3">Departman Durumu</div>
            {DEPARTMENTS.map((dept) => {
              const active = agents.filter((a) => a.department === dept.id && (a.status === 'active' || a.status === 'running')).length;
              const total = agents.filter((a) => a.department === dept.id).length;
              return (
                <div key={dept.id} className="flex items-center justify-between text-xs mb-2">
                  <span className="ts">{dept.icon} {dept.name_tr}</span>
                  <span className={`bdg ${active > 0 ? 'bdg-g' : 'bdg-c'}`}>{total > 0 ? `${active}/${total} aktif` : 'Ajan yok'}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
