import { useState } from 'react';
import { Plus, GripVertical, Edit2, Trash2 } from 'lucide-react';
import { useTaskStore } from '../stores/index';
import { TaskModal } from '../components/modals/TaskModal';
import type { TaskStatus, Task } from '../types/index';

const COLS: { status: TaskStatus; label: string; icon: string; color: string }[] = [
  { status:'backlog',  label:'Backlog',      icon:'📋', color:'var(--ts)' },
  { status:'queued',   label:'Kuyruk',       icon:'⏳', color:'var(--yellow)' },
  { status:'running',  label:'Çalışıyor',    icon:'⚙️', color:'var(--cyan)' },
  { status:'review',   label:'İnceleme',     icon:'👀', color:'var(--purple)' },
  { status:'done',     label:'Tamamlandı',   icon:'✅', color:'var(--green)' },
  { status:'blocked',  label:'Engellendi',   icon:'🚫', color:'var(--red)' },
];

const PC: Record<string, string> = { critical:'bdg-r', high:'bdg-o', medium:'bdg-y', low:'bdg-gr' };

export function Workflows() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);

  const [modal, setModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('taskId', id);
    setDragging(id);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };
  const onDragOver = (e: React.DragEvent, s: TaskStatus) => { e.preventDefault(); setDragOver(s); };
  const onDrop = (e: React.DragEvent, s: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (id) moveTask(id, s);
    setDragOver(null);
    setDragging(null);
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">Workflows</h1>
          <p className="ts text-sm mt-1">Görev orkestrasyon paneli · {doneTasks}/{totalTasks} tamamlandı</p>
        </div>
        <button onClick={() => setModal({ open: true, task: null })} className="btn-p">
          <Plus size={16} />Görev Oluştur
        </button>
      </div>

      <div className="glass p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm ts">Genel İlerleme</span>
          <span className="text-sm font-bold tcyan">{totalTasks ? Math.round((doneTasks/totalTasks)*100) : 0}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--bg-s)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width:`${totalTasks ? (doneTasks/totalTasks)*100 : 0}%`, background:'linear-gradient(135deg,var(--cyan),var(--green))' }} />
        </div>
        <div className="flex gap-4 mt-3 flex-wrap">
          {COLS.map((col) => {
            const count = tasks.filter((t) => t.status === col.status).length;
            return (
              <div key={col.status} className="flex items-center gap-1 text-xs">
                <span>{col.icon}</span>
                <span className="tm">{col.label}:</span>
                <span className="font-bold tp">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'16px', paddingBottom:'16px', minWidth:'max-content' }}>
          {COLS.map((col) => {
            const ct = tasks.filter((t) => t.status === col.status);
            const isDragTarget = dragOver === col.status;
            return (
              <div
                key={col.status}
                className={`kcol ${isDragTarget ? 'drag-over' : ''}`}
                style={{ transition:'all 0.15s' }}
                onDragOver={(e) => onDragOver(e, col.status)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDrop(e, col.status)}
              >
                <div className="p-4 border-b sticky top-0 rounded-t-xl" style={{ borderColor:'var(--bd)', background:'var(--bg-s)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold tp text-sm flex items-center gap-2">
                      <span>{col.icon}</span> {col.label}
                    </h3>
                    <span className="bdg bdg-c text-xs">{ct.length}</span>
                  </div>
                </div>

                <div className="p-3 space-y-3" style={{ minHeight:300 }}>
                  {ct.map((t) => (
                    <div
                      key={t.id}
                      className="glass p-3"
                      style={{ cursor:'grab', opacity: dragging===t.id ? 0.5 : 1, transition:'opacity 0.15s' }}
                      draggable
                      onDragStart={(e) => onDragStart(e, t.id)}
                      onDragEnd={onDragEnd}
                    >
                      <div className="flex items-start gap-2">
                        <GripVertical size={13} className="tm mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium tp text-sm leading-snug">{t.title}</h4>
                          <p className="text-xs tm mt-1 line-clamp-2">{t.description}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className={`bdg ${PC[t.priority]}`}>{t.priority}</span>
                            {t.agent_name && <span className="bdg bdg-p">{t.agent_name}</span>}
                          </div>
                          {t.due_date && (
                            <div className="text-xs tm mt-1.5">📅 {new Date(t.due_date).toLocaleDateString('tr-TR')}</div>
                          )}
                          {t.progress != null && t.progress > 0 && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs tm mb-1"><span>İlerleme</span><span>{t.progress}%</span></div>
                              <div className="h-1.5 rounded-full" style={{ background:'var(--bg-p)' }}>
                                <div className="h-full rounded-full transition-all"
                                  style={{ width:`${t.progress}%`, background:'linear-gradient(135deg,var(--cyan),var(--purple))' }} />
                              </div>
                            </div>
                          )}
                          {t.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {t.tags.map((tag) => <span key={tag} className="bdg bdg-gr">{tag}</span>)}
                            </div>
                          )}
                          <div className="flex gap-1 mt-2 pt-2 border-t" style={{ borderColor:'var(--bd)' }}>
                            <button onClick={(e) => { e.stopPropagation(); setModal({ open:true, task:t }); }}
                              className="btn-g text-xs py-1 px-2 flex items-center gap-1">
                              <Edit2 size={10} />Düzenle
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setConfirm(t.id); }}
                              className="btn-d text-xs py-1 px-2">
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {ct.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 tm text-xs"
                      style={{ border:`2px dashed ${isDragTarget ? 'var(--cyan)' : 'var(--bd)'}`, borderRadius:8, transition:'all 0.15s' }}>
                      <span className="text-2xl mb-1">{col.icon}</span>
                      Buraya sürükle
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {confirm && (
        <div className="modal-ov">
          <div className="modal-box" style={{ maxWidth:380 }}>
            <h3 className="text-lg font-bold tp mb-2">Görevi Sil?</h3>
            <p className="ts text-sm mb-6">Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-g">İptal</button>
              <button onClick={() => { deleteTask(confirm); setConfirm(null); }} className="btn-d">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <TaskModal open={modal.open} task={modal.task} onClose={() => setModal({ open: false })} />
    </div>
  );
}
