import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS } from '../data/mockData';
import { useAgentStore } from '../stores/index';

export function Departments() {
  const agents = useAgentStore((s) => s.agents);
  const nav = useNavigate();

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tp">Departmanlar</h1><p className="ts text-sm mt-1">6 AI destekli departmanınızı yönetin</p></div>
      <div className="grid grid-cols-3 gap-6">
        {DEPARTMENTS.map((d) => {
          const dAgents = agents.filter((a) => a.department === d.id);
          const active = dAgents.filter((a) => a.status === 'active' || a.status === 'running').length;
          return (
            <div key={d.id} className="glass p-6 cursor-pointer" style={{ borderLeft: `4px solid ${d.color}` }} onClick={() => nav(`/departments/${d.id}`)}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{d.icon}</div>
                <span className="bdg bdg-c">{dAgents.length} ajan</span>
              </div>
              <h2 className="text-xl font-bold tp">{d.name_tr}</h2>
              <p className="ts text-sm mt-1 mb-4">{d.description}</p>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="tm">Aktif</span>
                <span className="font-bold" style={{ color: d.color }}>{active}/{dAgents.length}</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-p)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${dAgents.length ? (active/dAgents.length)*100 : 0}%`, background: d.color }} />
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {dAgents.slice(0,3).map((a) => <span key={a.id} className="bdg bdg-p text-xs">{a.name}</span>)}
                {dAgents.length > 3 && <span className="bdg bdg-gr text-xs">+{dAgents.length-3}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
