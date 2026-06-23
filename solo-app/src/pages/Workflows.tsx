import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, GripVertical, Edit2, Trash2, X, CheckCircle, Clock, Eye, RotateCcw, Wand2, Brain, MessageSquarePlus, Paperclip } from 'lucide-react';
import { useTaskStore, useDecisionStore } from '../stores/index';
import { TaskModal } from '../components/modals/TaskModal';
import { PlannerModal } from '../components/modals/PlannerModal';
import { FollowUpModal } from '../components/modals/FollowUpModal';
import { ProposedDecisionModal } from '../components/modals/ProposedDecisionModal';
import type { TaskStatus, Task, Department } from '../types/index';

const COLS: { status: TaskStatus; label: string; icon: string; color: string }[] = [
  { status:'backlog',  label:'Backlog',      icon:'📋', color:'var(--ts)' },
  { status:'queued',   label:'Kuyruk',       icon:'⏳', color:'var(--yellow)' },
  { status:'running',  label:'Çalışıyor',    icon:'⚙️', color:'var(--cyan)' },
  { status:'review',   label:'İnceleme',     icon:'👀', color:'var(--purple)' },
  { status:'done',     label:'Tamamlandı',   icon:'✅', color:'var(--green)' },
  { status:'blocked',  label:'Engellendi',   icon:'🚫', color:'var(--red)' },
];

const PC: Record<string, string> = { critical:'bdg-r', high:'bdg-o', medium:'bdg-y', low:'bdg-gr' };

function timeAgo(iso?: string) {
  if (!iso) return '';
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s} sn önce`;
  if (s < 3600) return `${Math.floor(s / 60)} dk önce`;
  return `${Math.floor(s / 3600)} sa önce`;
}

export function Workflows() {
  const tasks = useTaskStore((s) => s.tasks);
  const moveTask = useTaskStore((s) => s.moveTask);
  const deleteTask = useTaskStore((s) => s.deleteTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const proposedDecisions = useDecisionStore((s) => s.proposedDecisions);

  const [modal, setModal] = useState<{ open: boolean; task?: Task | null }>({ open: false });
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);
  const [output, setOutput] = useState<Task | null>(null);
  const [planner, setPlanner] = useState(false);
  const [followUp, setFollowUp] = useState<{ open: boolean; context: string; dept?: Department }>({ open: false, context: '' });
  const [proposalView, setProposalView] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => { e.dataTransfer.setData('taskId', id); setDragging(id); };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };
  const onDragOver = (e: React.DragEvent, s: TaskStatus) => { e.preventDefault(); setDragOver(s); };
  const onDrop = (e: React.DragEvent, s: TaskStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('taskId');
    if (id) moveTask(id, s);
    setDragOver(null); setDragging(null);
  };

  const approve = (task: Task) => {
    updateTask(task.id, { status: 'done', approved: true, updated_at: new Date().toISOString() });
    setOutput(null);
  };

  const requeue = (task: Task) => {
    updateTask(task.id, {
      status: 'queued', output: undefined, output_at: undefined,
      progress: 0, approved: false, updated_at: new Date().toISOString(),
    });
  };

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const reviewTasks = tasks.filter((t) => t.status === 'review').length;
  const activeProposal = proposedDecisions.find((p) => p.id === proposalView) || null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">Workflows</h1>
          <p className="ts text-sm mt-1">
            Görev orkestrasyon paneli · {doneTasks}/{totalTasks} tamamlandı
            {reviewTasks > 0 && <span className="ml-2 bdg bdg-p">👀 {reviewTasks} inceleme bekliyor</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setPlanner(true)} className="btn-g" style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}>
            <Wand2 size={16} />Hedeften Görev Üret
          </button>
          <button onClick={() => setModal({ open: true, task: null })} className="btn-p">
            <Plus size={16} />Görev Oluştur
          </button>
        </div>
      </div>

      {/* Önerilen kararlar bandı */}
      {proposedDecisions.length > 0 && (
        <div className="glass p-4 flex items-center gap-3 flex-wrap"
          style={{ borderColor: 'rgba(139,92,246,0.4)', background: 'rgba(139,92,246,0.06)' }}>
          <Brain size={18} style={{ color: 'var(--purple)' }} />
          <div className="flex-1">
            <span className="font-semibold tp">{proposedDecisions.length} AI karar önerisi</span>
            <span className="ts text-sm ml-2">tamamlanan görevlerin çıktısından sentezlendi — onayın bekleniyor</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            {proposedDecisions.map((p) => (
              <button key={p.id} onClick={() => setProposalView(p.id)}
                className="btn-g text-xs py-1.5 px-3" style={{ borderColor: 'var(--purple)', color: 'var(--purple)' }}>
                <Brain size={11} />{p.title.slice(0, 35)}{p.title.length > 35 ? '…' : ''}
              </button>
            ))}
            <Link to="/decisions" className="btn-g text-xs py-1.5 px-3">Tüm Kararlar →</Link>
          </div>
        </div>
      )}

      <div className="glass p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm ts">Genel İlerleme</span>
          <span className="text-sm font-bold tcyan">{totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0}%</span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-s)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${totalTasks ? (doneTasks / totalTasks) * 100 : 0}%`, background: 'linear-gradient(135deg,var(--cyan),var(--green))' }} />
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

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', minWidth: 'max-content' }}>
          {COLS.map((col) => {
            const ct = tasks.filter((t) => t.status === col.status);
            const isDragTarget = dragOver === col.status;
            return (
              <div key={col.status} className={`kcol ${isDragTarget ? 'drag-over' : ''}`}
                style={{ transition: 'all 0.15s' }}
                onDragOver={(e) => onDragOver(e, col.status)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDrop(e, col.status)}>
                <div className="p-4 border-b sticky top-0 rounded-t-xl" style={{ borderColor: 'var(--bd)', background: 'var(--bg-s)' }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold tp text-sm">{col.icon} {col.label}</h3>
                    <span className="bdg bdg-c text-xs">{ct.length}</span>
                  </div>
                </div>

                <div className="p-3 space-y-3" style={{ minHeight: 300 }}>
                  {ct.map((t) => (
                    <div key={t.id} className="glass p-3"
                      style={{ cursor: 'grab', opacity: dragging === t.id ? 0.5 : 1, transition: 'opacity 0.15s', borderColor: t.status === 'review' && t.output ? 'var(--purple)' : undefined }}
                      draggable onDragStart={(e) => onDragStart(e, t.id)} onDragEnd={onDragEnd}>
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
                            <div className="text-xs tm mt-1.5 flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(t.due_date).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                          {t.progress != null && t.progress > 0 && t.status !== 'done' && (
                            <div className="mt-2">
                              <div className="flex justify-between text-xs mb-1">
                                <span className="tm">İlerleme</span>
                                <span className={t.progress >= 100 ? 'tgreen font-bold' : 'tm'}>{t.progress}%</span>
                              </div>
                              <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-p)' }}>
                                <div className="h-full rounded-full transition-all"
                                  style={{ width: `${t.progress}%`, background: t.progress >= 100 ? 'var(--green)' : 'linear-gradient(135deg,var(--cyan),var(--purple))' }} />
                              </div>
                            </div>
                          )}
                          {t.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {t.tags.map((tag) => <span key={tag} className="bdg bdg-gr">{tag}</span>)}
                            </div>
                          )}

                          {/* Ekler göstergesi */}
                          {t.attachments && t.attachments.length > 0 && (
                            <div className="flex items-center gap-1.5 mt-2">
                              {t.attachments.slice(0, 3).map((att, i) =>
                                att.media_type === 'application/pdf' ? (
                                  <span key={i} className="flex items-center gap-1 text-xs tm px-1.5 py-0.5 rounded"
                                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                                    <Paperclip size={9} style={{ color: 'var(--cyan)' }} />PDF
                                  </span>
                                ) : (
                                  <img key={i} src={`data:${att.media_type};base64,${att.data}`} alt={att.name}
                                    className="rounded object-cover flex-shrink-0"
                                    style={{ width: 28, height: 28, border: '1px solid var(--bd)' }} />
                                )
                              )}
                              {t.attachments.length > 3 && (
                                <span className="text-xs tm">+{t.attachments.length - 3}</span>
                              )}
                            </div>
                          )}

                          {/* Output available — review */}
                          {t.output && t.status === 'review' && (
                            <button onClick={(e) => { e.stopPropagation(); setOutput(t); }}
                              className="btn-p text-xs py-1.5 px-3 mt-2 w-full justify-center flex items-center gap-1">
                              <Eye size={12} />Çıktıyı İncele & Onayla
                            </button>
                          )}
                          {/* Output available — done */}
                          {t.output && t.status === 'done' && (
                            <button onClick={(e) => { e.stopPropagation(); setOutput(t); }}
                              className="btn-g text-xs py-1.5 px-3 mt-2 w-full justify-center flex items-center gap-1">
                              <Eye size={12} />Çıktıyı Gör
                            </button>
                          )}
                          {t.approved && t.status === 'done' && (
                            <div className="text-xs tgreen mt-1 flex items-center gap-1"><CheckCircle size={11} />Onaylandı · {timeAgo(t.output_at)}</div>
                          )}

                          {/* Blocked — neden bloklandığını gör + yeniden dene */}
                          {t.status === 'blocked' && (
                            <div className="space-y-1 mt-2">
                              {t.output && (
                                <button onClick={(e) => { e.stopPropagation(); setOutput(t); }}
                                  className="btn-g text-xs py-1.5 px-3 w-full justify-center flex items-center gap-1"
                                  style={{ borderColor: 'var(--red)', color: 'var(--red)' }}>
                                  <Eye size={12} />Neden Bloklandı?
                                </button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); requeue(t); }}
                                className="btn-g text-xs py-1.5 px-3 w-full justify-center flex items-center gap-1"
                                style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                                <RotateCcw size={12} />Yeniden Kuyruğa Al
                              </button>
                            </div>
                          )}

                          <div className="flex gap-1 mt-2 pt-2 border-t" style={{ borderColor: 'var(--bd)' }}>
                            <button onClick={(e) => { e.stopPropagation(); setModal({ open: true, task: t }); }}
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
                      style={{ border: `2px dashed ${isDragTarget ? 'var(--cyan)' : 'var(--bd)'}`, borderRadius: 8, transition: 'all 0.15s' }}>
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

      {/* Output Review Panel */}
      {output && (
        <div className="modal-ov" onClick={() => setOutput(null)}>
          <div className="modal-box" style={{ maxWidth: 780, width: '90vw', maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold tp">Görev Çıktısı</h2>
                <p className="ts text-sm">{output.title}</p>
              </div>
              <button onClick={() => setOutput(null)} className="btn-g p-2"><X size={16} /></button>
            </div>

            <div className="flex items-center gap-3 mb-4 p-3 rounded-lg" style={{ background: 'var(--bg-s)' }}>
              <span className="bdg bdg-p">{output.agent_name}</span>
              <span className="text-xs tm">{timeAgo(output.output_at)}</span>
              <span className={`bdg ${PC[output.priority]} ml-auto`}>{output.priority}</span>
            </div>

            {/* Eklenen dosyalar / görseller */}
            {output.attachments && output.attachments.length > 0 && (
              <div className="mb-4">
                <div className="text-xs tm mb-2 flex items-center gap-1">
                  <Paperclip size={11} />Eklenen dosyalar ({output.attachments.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {output.attachments.map((att, i) => (
                    att.media_type === 'application/pdf' ? (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs ts"
                        style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
                        <Paperclip size={14} style={{ color: 'var(--cyan)' }} />
                        {att.name}
                      </div>
                    ) : (
                      <img key={i}
                        src={`data:${att.media_type};base64,${att.data}`}
                        alt={att.name}
                        title={att.name}
                        className="rounded-lg object-cover"
                        style={{ maxHeight: 120, maxWidth: 200, border: '1px solid var(--bd)' }}
                      />
                    )
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl mb-4 font-mono text-sm leading-relaxed whitespace-pre-wrap"
              style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)', color: 'var(--tp)' }}>
              {output.output}
            </div>

            {output.status === 'done' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm tgreen">
                  <CheckCircle size={15} />Onaylandı — {timeAgo(output.output_at)}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setOutput(null)} className="btn-g flex-1 justify-center">Kapat</button>
                  <button onClick={() => {
                    setOutput(null);
                    setFollowUp({ open: true, context: output.title, dept: output.department as Department });
                  }} className="btn-g flex-1 justify-center" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                    <MessageSquarePlus size={14} />Ek Talep / Düzeltme
                  </button>
                </div>
              </div>
            ) : output.status === 'blocked' ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm tred">
                  🚫 Bu görev bloklandı (guardrail / API hatası — yukarıdaki nedene bak)
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setOutput(null)} className="btn-g flex-1 justify-center">Kapat</button>
                  <button onClick={() => { requeue(output); setOutput(null); }} className="btn-g flex-1 justify-center"
                    style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                    <RotateCcw size={15} />Yeniden Kuyruğa Al
                  </button>
                  <button onClick={() => approve(output)} className="btn-p flex-1 justify-center">
                    <CheckCircle size={16} />Yine de Onayla
                  </button>
                </div>
                <button onClick={() => {
                  setOutput(null);
                  setFollowUp({ open: true, context: output.title, dept: output.department as Department });
                }} className="btn-g w-full justify-center" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                  <MessageSquarePlus size={14} />Ek Talep / Düzeltme Ekle
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button onClick={() => setOutput(null)} className="btn-g flex-1 justify-center">Kapat</button>
                  <button onClick={() => { moveTask(output.id, 'blocked'); setOutput(null); }} className="btn-d flex-1 justify-center">
                    🚫 Reddet
                  </button>
                  <button onClick={() => approve(output)} className="btn-p flex-1 justify-center">
                    <CheckCircle size={16} />Onayla & Tamamla
                  </button>
                </div>
                <button onClick={() => {
                  setOutput(null);
                  setFollowUp({ open: true, context: output.title, dept: output.department as Department });
                }} className="btn-g w-full justify-center" style={{ borderColor: 'var(--cyan)', color: 'var(--cyan)' }}>
                  <MessageSquarePlus size={14} />Ek Talep / Düzeltme Ekle
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {confirm && (
        <div className="modal-ov">
          <div className="modal-box" style={{ maxWidth: 380 }}>
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
      <PlannerModal open={planner} onClose={() => setPlanner(false)} />
      <FollowUpModal
        open={followUp.open}
        context={followUp.context}
        contextType="task"
        defaultDept={followUp.dept}
        onClose={() => setFollowUp({ open: false, context: '' })}
      />
      <ProposedDecisionModal
        proposal={activeProposal}
        onClose={() => setProposalView(null)}
        onFollowUp={(ctx) => setFollowUp({ open: true, context: ctx })}
      />
    </div>
  );
}
