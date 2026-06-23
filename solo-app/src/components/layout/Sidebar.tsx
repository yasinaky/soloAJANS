import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Building2, Users, Grid3X3, Target, BookOpen, BarChart3, FileText, Wine, Settings } from 'lucide-react';
import { useAgentStore, useCompanyStore } from '../../stores/index';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Building2, label: 'Departmanlar', href: '/departments' },
  { icon: Users, label: 'Ajanlar', href: '/agents' },
  { icon: Grid3X3, label: 'Workflows', href: '/workflows' },
  { icon: Target, label: 'Leads', href: '/leads' },
  { icon: BookOpen, label: 'Bilgi Merkezi', href: '/knowledge' },
  { icon: BarChart3, label: 'Analitik', href: '/analytics' },
  { icon: FileText, label: 'Kararlar', href: '/decisions' },
  { icon: Wine, label: 'Ajan Kulübü', href: '/club' },
  { icon: Settings, label: 'Ayarlar', href: '/settings' },
];

export function Sidebar() {
  const agents = useAgentStore((s) => s.agents);
  const active = agents.filter((a) => a.status === 'active' || a.status === 'running').length;
  const company = useCompanyStore((s) => s.company);

  return (
    <div className="fixed left-0 top-0 h-screen w-60 bg-s border-r" style={{ borderColor: 'var(--bd)' }}>
      <div className="px-4 py-5 border-b" style={{ borderColor: 'var(--bd)' }}>
        <div className="text-xl font-bold grad-text truncate">{company.name}</div>
        <div className="text-xs ts mt-1 truncate">{company.tagline}</div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1" style={{ height: 'calc(100vh - 140px)', overflowY: 'auto' }}>
        {NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.href} to={item.href} end={item.href === '/'} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Icon size={17} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t" style={{ borderColor: 'var(--bd)' }}>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="ts">Aktif Ajanlar</span>
          <span className="font-bold tcyan">{active}/{agents.length || 0}</span>
        </div>
        <div className="h-1.5 rounded-full mb-3" style={{ background: 'var(--bg-c)' }}>
          <div className="h-full rounded-full" style={{ width: `${agents.length ? (active/agents.length)*100 : 0}%`, background: 'linear-gradient(135deg, var(--cyan), var(--purple))' }} />
        </div>
        <div className="flex items-center justify-between" style={{ opacity: 0.45 }}>
          <span className="text-xs ts">Solo OS</span>
          <span className="text-xs ts font-mono">v{__APP_VERSION__}</span>
        </div>
      </div>
    </div>
  );
}
