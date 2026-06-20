import { useState } from 'react';
import { Plus, TrendingUp, DollarSign, Target, Edit2, Trash2, Tag } from 'lucide-react';
import { useLeadStore } from '../stores/index';
import { LeadModal } from '../components/modals/LeadModal';
import type { LeadStatus, Lead } from '../types/index';

const PIPELINE: { status: LeadStatus; label: string; color: string }[] = [
  { status:'new',       label:'🆕 Yeni',         color:'var(--ts)' },
  { status:'contacted', label:'📞 İletişim',      color:'var(--cyan)' },
  { status:'qualified', label:'✅ Qualified',     color:'var(--purple)' },
  { status:'proposal',  label:'💼 Teklif',        color:'var(--yellow)' },
  { status:'won',       label:'🎉 Kazanıldı',     color:'var(--green)' },
  { status:'lost',      label:'❌ Kaybedildi',    color:'var(--red)' },
];

function scoreColor(s: number) {
  if (s >= 80) return 'bdg-g';
  if (s >= 60) return 'bdg-c';
  if (s >= 40) return 'bdg-y';
  return 'bdg-r';
}

export function Leads() {
  const leads = useLeadStore((s) => s.leads);
  const moveStatus = useLeadStore((s) => s.moveStatus);
  const deleteLead = useLeadStore((s) => s.deleteLead);

  const total = leads.reduce((s, l) => s + (l.deal_value || 0), 0);
  const wonValue = leads.filter((l) => l.status === 'won').reduce((s, l) => s + (l.deal_value || 0), 0);

  const [modal, setModal] = useState<{ open: boolean; lead?: Lead | null }>({ open: false });
  const [dragOver, setDragOver] = useState<LeadStatus | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('leadId', id);
    setDragging(id);
  };
  const onDragEnd = () => { setDragging(null); setDragOver(null); };
  const onDragOver = (e: React.DragEvent, s: LeadStatus) => { e.preventDefault(); setDragOver(s); };
  const onDrop = (e: React.DragEvent, s: LeadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (id) moveStatus(id, s);
    setDragOver(null);
    setDragging(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">Sales Pipeline</h1>
          <p className="ts text-sm mt-1">{leads.length} lead takip ediliyor</p>
        </div>
        <button onClick={() => setModal({ open: true, lead: null })} className="btn-p">
          <Plus size={16} />Lead Ekle
        </button>
      </div>

      <div className="glass p-6">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 tm text-sm mb-2"><Target size={14} />Toplam Lead</div>
            <div className="text-3xl font-bold tp">{leads.length}</div>
          </div>
          <div>
            <div className="flex items-center gap-2 tm text-sm mb-2"><TrendingUp size={14} />Pipeline Değeri</div>
            <div className="text-3xl font-bold tcyan">${(total / 1000).toFixed(0)}k</div>
          </div>
          <div>
            <div className="flex items-center gap-2 tm text-sm mb-2"><DollarSign size={14} />Kazanılan</div>
            <div className="text-3xl font-bold tgreen">${(wonValue / 1000).toFixed(0)}k</div>
          </div>
          <div>
            <div className="flex items-center gap-2 tm text-sm mb-2">🎯 Dönüşüm</div>
            <div className="text-3xl font-bold tyellow">
              {leads.length ? ((leads.filter((l) => l.status === 'won').length / leads.length) * 100).toFixed(0) : 0}%
            </div>
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', minWidth: 'max-content' }}>
          {PIPELINE.map(({ status, label }) => {
            const sl = leads.filter((l) => l.status === status);
            const sv = sl.reduce((s, l) => s + (l.deal_value || 0), 0);
            const isDragTarget = dragOver === status;
            return (
              <div
                key={status}
                className={`kcol ${isDragTarget ? 'drag-over' : ''}`}
                style={{ transition: 'all 0.15s' }}
                onDragOver={(e) => onDragOver(e, status)}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDrop(e, status)}
              >
                <div className="p-4 border-b" style={{ borderColor: 'var(--bd)', background: 'var(--bg-s)' }}>
                  <h3 className="font-semibold tp text-sm">{label}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {sv > 0 && <div className="text-xs tgreen font-bold">${(sv / 1000).toFixed(0)}k</div>}
                    <span className="bdg bdg-c text-xs">{sl.length}</span>
                  </div>
                </div>

                <div className="p-3 space-y-3" style={{ minHeight: 300 }}>
                  {sl.map((l) => (
                    <div
                      key={l.id}
                      className="glass p-3"
                      style={{ cursor: 'grab', opacity: dragging === l.id ? 0.5 : 1, transition: 'opacity 0.15s' }}
                      draggable
                      onDragStart={(e) => onDragStart(e, l.id)}
                      onDragEnd={onDragEnd}
                    >
                      <h4 className="font-semibold tp text-sm">{l.company}</h4>
                      <p className="text-xs ts mt-0.5">{l.contact_name}</p>
                      <div className="text-xs tm mt-1 truncate">{l.email}</div>

                      <div className="flex items-center justify-between mt-2">
                        <span className={`bdg ${scoreColor(l.score)}`}>⭐ {l.score}</span>
                        {l.deal_value && l.deal_value > 0 && (
                          <span className="text-xs font-bold tgreen">${l.deal_value.toLocaleString()}</span>
                        )}
                      </div>

                      <div className="mt-2 pt-2 border-t text-xs" style={{ borderColor: 'var(--bd)' }}>
                        <p className="tm line-clamp-2">{l.notes}</p>
                        {l.next_action && <div className="mt-1 tcyan font-medium">→ {l.next_action}</div>}
                      </div>

                      {l.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {l.tags.slice(0, 3).map((t) => (
                            <span key={t} className="bdg bdg-gr"><Tag size={8} />{t}</span>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-1 mt-2 pt-2 border-t" style={{ borderColor: 'var(--bd)' }}
                        onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setModal({ open: true, lead: l })}
                          className="btn-g text-xs py-1 px-2 flex-1 justify-center flex items-center gap-1">
                          <Edit2 size={10} />Düzenle
                        </button>
                        <button onClick={() => setConfirm(l.id)} className="btn-d text-xs py-1 px-2">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {sl.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 tm text-xs"
                      style={{ border: `2px dashed ${isDragTarget ? 'var(--cyan)' : 'var(--bd)'}`, borderRadius: 8, transition: 'all 0.15s' }}>
                      <span className="text-2xl mb-1">💧</span>
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
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <h3 className="text-lg font-bold tp mb-2">Lead'i Sil?</h3>
            <p className="ts text-sm mb-6">Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-g">İptal</button>
              <button onClick={() => { deleteLead(confirm); setConfirm(null); }} className="btn-d">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <LeadModal open={modal.open} lead={modal.lead} onClose={() => setModal({ open: false })} />
    </div>
  );
}
