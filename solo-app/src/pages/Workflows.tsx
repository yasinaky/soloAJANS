import { Plus, GripVertical } from 'lucide-react';
import { useTaskStore } from '../stores/index';
import type { TaskStatus } from '../types/index';

const COLS: { status: TaskStatus; label: string; icon: string }[] = [
  { status:'backlog', label:'Backlog', icon:'📋' },
  { status:'queued', label:'Kuyruk', icon:'⏳' },
  { status:'running', label:'Çalışıyor', icon:'⚙️' },
  { status:'review', label:'İnceleme', icon:'👀' },
  { status:'done', label:'Tamamlandı', icon:'✓' },
  { status:'blocked', label:'Engellendi', icon:'🚫' },
];

const PC: Record<string, string> = { critical:'bdg-r', high:'bdg-o', medium:'bdg-y', low:'bdg-gr' };

export function Workflows() {
  const tasks = useTaskStore((s) => s.tasks);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tp">Workflows</h1><p className="ts text-sm mt-1">Görev orkestrasyon paneli</p></div>
        <button className="btn-p"><Plus size={16} />Görev Oluştur</button>
      </div>

      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'16px', paddingBottom:'16px', minWidth:'max-content' }}>
          {COLS.map((col) => {
            const ct = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="kcol">
                <div className="p-4 border-b sticky top-0" style={{ borderColor:'var(--bd)', background:'var(--bg-s)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold tp text-sm">{col.icon} {col.label}</h3>
                    <span className="bdg bdg-c text-xs">{ct.length}</span>
                  </div>
                </div>
                <div className="p-3 space-y-3">
                  {ct.map((t) => (
                    <div key={t.id} className="glass p-3 cursor-grab">
                      <div className="flex items-start gap-2">
                        <GripVertical size={13} className="tm mt-1 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium tp text-sm">{t.title}</h4>
                          <p className="text-xs tm mt-1 line-clamp-2">{t.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`bdg ${PC[t.priority]}`}>{t.priority}</span>
                            {t.agent_name && <span className="bdg bdg-p">{t.agent_name}</span>}
                          </div>
                          {t.progress != null && t.progress > 0 && (
                            <div className="mt-2">
                              <div className="text-xs tm">{t.progress}%</div>
                              <div className="h-1 rounded mt-1" style={{ background:'var(--bg-p)' }}>
                                <div className="h-full rounded" style={{ width:`${t.progress}%`, background:'linear-gradient(135deg,var(--cyan),var(--purple))' }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {ct.length === 0 && <div className="text-center py-8 tm text-xs">Görev yok</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
