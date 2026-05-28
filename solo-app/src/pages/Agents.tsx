import { useState } from 'react';
import { Plus, Filter, Zap } from 'lucide-react';
import { useAgentStore } from '../stores/index';
import { DEPARTMENTS } from '../data/mockData';

export function Agents() {
  const agents = useAgentStore((s) => s.agents);
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');

  const filtered = agents.filter((a) =>
    (!dept || a.department === dept) && (!status || a.status === status)
  );

  const sc: Record<string, string> = { active:'bdg-g', running:'bdg-c', idle:'bdg-y', paused:'bdg-gr', error:'bdg-r' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tp">AI Ajanlar</h1><p className="ts text-sm mt-1">{agents.length} ajan yönetiliyor</p></div>
        <button className="btn-p"><Plus size={16} />Ajan Ekle</button>
      </div>

      <div className="glass p-4 flex items-center gap-3">
        <Filter size={16} className="tm" />
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="sel text-sm">
          <option value="">Tüm Departmanlar</option>
          {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name_tr}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="sel text-sm">
          <option value="">Tüm Durumlar</option>
          {['active','running','idle','paused','error'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="glass p-4">
            <div className="flex items-start justify-between mb-3">
              <div><h3 className="font-bold tp">{a.name}</h3><p className="text-xs tm">{a.role}</p></div>
              <span className={`bdg ${sc[a.status]}`}>{a.status}</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="tm">Başarı Oranı</span><span className="font-bold tgreen">{a.success_rate}%</span></div>
              <div className="h-1 rounded" style={{ background: 'var(--bg-s)' }}><div className="h-full rounded" style={{ width: `${a.success_rate}%`, background: 'var(--green)' }} /></div>
              <div className="flex justify-between"><span className="tm">Tamamlanan</span><span className="font-bold tcyan">{a.tasks_completed}</span></div>
              <div className="flex justify-between"><span className="tm">Kuyruk</span><span className="font-bold tpurple">{a.queue_length}</span></div>
              <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--bd)' }}>
                <span className="tm">Seviye {a.level}</span>
                <div className="flex items-center gap-1"><Zap size={11} style={{ color: 'var(--yellow)' }} /><span className="font-bold tyellow">{a.xp}</span></div>
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <button className="btn-g text-xs flex-1">Görüntüle</button>
              <button className="btn-g text-xs flex-1">Düzenle</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
