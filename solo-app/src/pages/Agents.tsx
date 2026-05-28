import { useState } from 'react';
import { Plus, Filter, Zap, Trash2, X, Star, Clock, ChevronRight } from 'lucide-react';
import { useAgentStore } from '../stores/index';
import { DEPARTMENTS } from '../data/mockData';
import { AgentModal } from '../components/modals/AgentModal';
import type { Agent } from '../types/index';

const SC: Record<string, string> = { active:'bdg-g', running:'bdg-c', idle:'bdg-y', paused:'bdg-gr', error:'bdg-r' };
const SC_DOT: Record<string, string> = { active:'var(--green)', running:'var(--cyan)', idle:'var(--yellow)', paused:'#6b7280', error:'var(--red)' };

export function Agents() {
  const agents = useAgentStore((s) => s.agents);
  const deleteAgent = useAgentStore((s) => s.deleteAgent);
  const setStatus = useAgentStore((s) => s.setStatus);

  const [dept, setDept] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<{ open: boolean; agent?: Agent | null }>({ open: false });
  const [detail, setDetail] = useState<Agent | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const filtered = agents.filter((a) =>
    (!dept || a.department === dept) && (!statusFilter || a.status === statusFilter)
  );

  const openEdit = (a: Agent) => { setModal({ open: true, agent: a }); };
  const onDelete = (id: string) => { deleteAgent(id); setConfirm(null); if (detail?.id === id) setDetail(null); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">AI Ajanlar</h1>
          <p className="ts text-sm mt-1">{agents.length} ajan yönetiliyor · {agents.filter(a=>a.status==='active'||a.status==='running').length} aktif</p>
        </div>
        <button onClick={() => setModal({ open: true, agent: null })} className="btn-p">
          <Plus size={16} />Ajan Ekle
        </button>
      </div>

      <div className="glass p-4 flex items-center gap-3 flex-wrap">
        <Filter size={16} className="tm" />
        <select value={dept} onChange={(e) => setDept(e.target.value)} className="sel text-sm">
          <option value="">Tüm Departmanlar</option>
          {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name_tr}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="sel text-sm">
          <option value="">Tüm Durumlar</option>
          {['active','running','idle','paused','error'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="ts text-sm ml-auto">{filtered.length} ajan gösteriliyor</span>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map((a) => (
          <div key={a.id} className="glass p-4 cursor-pointer" onClick={() => setDetail(a)}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ background: `linear-gradient(135deg, ${a.avatar_color||'var(--cyan)'}, var(--purple))`, fontSize:16 }}>
                    {a.name[0]}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2" style={{ borderColor:'var(--bg-c)', background: SC_DOT[a.status] }} />
                </div>
                <div>
                  <h3 className="font-bold tp text-sm">{a.name}</h3>
                  <p className="text-xs tm">{a.role}</p>
                </div>
              </div>
              <ChevronRight size={14} className="tm" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="tm">Başarı</span>
                <span className="font-bold tgreen">{a.success_rate}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-s)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${a.success_rate}%`, background: 'var(--green)' }} />
              </div>
              <div className="flex justify-between">
                <span className="tm">Görevler</span>
                <span className="font-medium tcyan">{a.tasks_completed}</span>
              </div>
              <div className="flex justify-between">
                <span className="tm">Kuyruk</span>
                <span className="font-medium tpurple">{a.queue_length}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--bd)' }}>
                <div className="flex items-center gap-1 tm"><Clock size={10} />{a.last_run}</div>
                <div className="flex items-center gap-1"><Zap size={11} style={{ color: 'var(--yellow)' }} /><span className="font-bold tyellow">{a.xp} XP</span></div>
              </div>
            </div>

            <div className="flex gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => openEdit(a)} className="btn-g text-xs flex-1 justify-center">Düzenle</button>
              <button onClick={() => setConfirm(a.id)} className="btn-d text-xs px-3"><Trash2 size={12} /></button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-3 text-center py-16 ts">
            <div className="text-4xl mb-3">🤖</div>
            <p>Hiç ajan bulunamadı. Filtrelerinizi değiştirin ya da yeni ajan ekleyin.</p>
          </div>
        )}
      </div>

      {/* Agent Detail Slide Panel */}
      {detail && (
        <div className="slide-panel">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold tp">Ajan Detayı</h2>
            <button onClick={() => setDetail(null)} className="btn-g p-2"><X size={16} /></button>
          </div>

          <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ background:'var(--bg-s)', border:'1px solid var(--bd)' }}>
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl"
                style={{ background: `linear-gradient(135deg, ${detail.avatar_color||'var(--cyan)'}, var(--purple))` }}>
                {detail.name[0]}
              </div>
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full border-2" style={{ borderColor:'var(--bg-s)', background: SC_DOT[detail.status] }} />
            </div>
            <div>
              <div className="font-bold tp text-xl">{detail.name}</div>
              <div className="ts text-sm">{detail.role}</div>
              <span className={`bdg ${SC[detail.status]} mt-1.5 inline-block`}>{detail.status}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="glass p-4">
              <div className="form-label mb-3">Performans</div>
              <div className="space-y-2">
                {[
                  ['Başarı Oranı', `${detail.success_rate}%`, 'tgreen'],
                  ['Tamamlanan Görev', `${detail.tasks_completed}`, 'tcyan'],
                  ['Kuyruk', `${detail.queue_length}`, 'tpurple'],
                  ['Son Çalışma', detail.last_run, 'ts'],
                  ['AI Modeli', detail.model, 'tp'],
                  ['Program', detail.schedule, 'tp'],
                ].map(([k, v, c]) => (
                  <div key={k} className="flex justify-between py-1.5 border-b last:border-0" style={{ borderColor:'var(--bd)' }}>
                    <span className="text-xs tm">{k}</span>
                    <span className={`text-xs font-semibold ${c}`}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass p-4">
              <div className="form-label mb-3">XP & Seviye</div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star size={16} style={{ color:'var(--yellow)' }} />
                  <span className="font-bold tyellow text-xl">{detail.xp}</span>
                  <span className="ts text-sm">XP</span>
                </div>
                <span className="bdg bdg-y text-sm px-3 py-1">Seviye {detail.level}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background:'var(--bg-s)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width:`${((detail.xp||0)%1000)/10}%`, background:'linear-gradient(135deg,var(--yellow),var(--orange))' }} />
              </div>
              <div className="text-xs tm mt-1">{(detail.xp||0)%1000} / 1000 XP — sonraki seviye</div>
            </div>

            {detail.tools.length > 0 && (
              <div className="glass p-4">
                <div className="form-label mb-3">Araçlar</div>
                <div className="flex flex-wrap gap-2">
                  {detail.tools.map((t) => <span key={t} className="bdg bdg-c">{t}</span>)}
                </div>
              </div>
            )}

            <div className="glass p-4">
              <div className="form-label mb-2">Hedef</div>
              <p className="text-sm ts leading-relaxed">{detail.objective || '—'}</p>
            </div>

            {detail.guardrails.length > 0 && (
              <div className="glass p-4">
                <div className="form-label mb-2">Guardrails</div>
                {detail.guardrails.map((g, i) => (
                  <div key={i} className="text-xs ts py-1.5 border-b last:border-0 flex items-start gap-2" style={{ borderColor:'var(--bd)' }}>
                    <span className="tred flex-shrink-0">⚠</span>{g}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-5">
            <button onClick={() => { openEdit(detail); setDetail(null); }} className="btn-p flex-1 justify-center">Düzenle</button>
            <button onClick={() => setConfirm(detail.id)} className="btn-d flex-1 justify-center"><Trash2 size={14} />Sil</button>
          </div>

          <div className="mt-3">
            <div className="form-label mb-2">Durumu Değiştir</div>
            <div className="flex flex-wrap gap-2">
              {['active','idle','paused'].map((s) => (
                <button key={s} onClick={() => { setStatus(detail.id, s as any); setDetail({ ...detail, status: s as any }); }}
                  className={`btn-g text-xs ${detail.status===s ? 'border-cyan-400' : ''}`}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirm && (
        <div className="modal-ov">
          <div className="modal-box" style={{ maxWidth:380 }}>
            <h3 className="text-lg font-bold tp mb-2">Ajanı Sil?</h3>
            <p className="ts text-sm mb-6">Bu işlem geri alınamaz. Ajan ve tüm verileri silinecek.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-g">İptal</button>
              <button onClick={() => onDelete(confirm)} className="btn-d">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <AgentModal open={modal.open} agent={modal.agent} onClose={() => setModal({ open: false })} />
    </div>
  );
}
