import { useState } from 'react';
import { Plus, User, Calendar, ChevronDown, ChevronUp, Edit2, Trash2, FileText } from 'lucide-react';
import { useDecisionStore } from '../stores/index';
import { DecisionModal } from '../components/modals/DecisionModal';
import type { DecisionLog as DecisionLogType } from '../types/index';

const IC: Record<string, string> = { low:'bdg-y', medium:'bdg-o', high:'bdg-r', critical:'bdg-r' };
const SC: Record<string, string> = { active:'bdg-g', pending:'bdg-y', implemented:'bdg-c', cancelled:'bdg-gr' };
const II: Record<string, string> = { low:'📍', medium:'⚠️', high:'🔴', critical:'🚨' };
const SI: Record<string, string> = { active:'🟢', pending:'⏳', implemented:'✅', cancelled:'❌' };

export function DecisionLog() {
  const decisions = useDecisionStore((s) => s.decisions);
  const deleteDecision = useDecisionStore((s) => s.deleteDecision);

  const [impact, setImpact] = useState('');
  const [status, setStatus] = useState('');
  const [modal, setModal] = useState<{ open: boolean; decision?: DecisionLogType | null }>({ open: false });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const filtered = decisions.filter((d) =>
    (!impact || d.impact === impact) && (!status || d.status === status)
  );

  const stats = {
    total: decisions.length,
    critical: decisions.filter((d) => d.impact === 'critical' || d.impact === 'high').length,
    implemented: decisions.filter((d) => d.status === 'implemented').length,
    pending: decisions.filter((d) => d.status === 'pending').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">Stratejik Kararlar</h1>
          <p className="ts text-sm mt-1">Kritik kararların kaydı, gerekçesi ve sonuçları</p>
        </div>
        <button onClick={() => setModal({ open: true, decision: null })} className="btn-p">
          <Plus size={16} />Karar Kaydet
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Toplam Karar', value: stats.total, color: 'var(--cyan)' },
          { label: 'Kritik / Yüksek', value: stats.critical, color: 'var(--red)' },
          { label: 'Uygulandı', value: stats.implemented, color: 'var(--green)' },
          { label: 'Beklemede', value: stats.pending, color: 'var(--yellow)' },
        ].map((s) => (
          <div key={s.label} className="glass p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs tm mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="glass p-4 flex flex-wrap gap-2 items-center">
        <span className="text-xs tm">Etki:</span>
        <button onClick={() => setImpact('')} className={`px-3 py-1.5 rounded text-sm font-medium ${!impact ? 'btn-p' : 'bdg bdg-gr'}`}>Tümü</button>
        {(['low','medium','high','critical'] as const).map((v) => (
          <button key={v} onClick={() => setImpact(v === impact ? '' : v)}
            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${impact === v ? 'btn-p' : 'bdg bdg-gr'}`}>
            {II[v]} {v}
          </button>
        ))}
        <span className="text-xs tm ml-4">Durum:</span>
        {(['active','pending','implemented','cancelled'] as const).map((v) => (
          <button key={v} onClick={() => setStatus(v === status ? '' : v)}
            className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${status === v ? 'btn-p' : 'bdg bdg-gr'}`}>
            {SI[v]} {v}
          </button>
        ))}
      </div>

      {/* Empty State */}
      {decisions.length === 0 && (
        <div className="glass p-12 text-center">
          <FileText size={48} className="mx-auto mb-4 tm" />
          <h3 className="text-xl font-bold tp mb-2">Henüz karar yok</h3>
          <p className="ts text-sm mb-6 max-w-md mx-auto">
            Şirkette verdiğin önemli kararları buraya kaydet. Neden bu karar verildi,
            ne oldu, ne öğrenildi — gelecekte referans olur.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6 text-left">
            {[
              { icon: '🎯', title: 'Strateji', desc: 'Yön ve hedef kararları' },
              { icon: '💰', title: 'Yatırım', desc: 'Harcama ve kaynak kararları' },
              { icon: '🤝', title: 'Ortaklık', desc: 'İş birliği ve işe alım' },
            ].map((e) => (
              <div key={e.title} className="glass p-3 text-center">
                <div className="text-2xl mb-1">{e.icon}</div>
                <div className="font-semibold tp text-sm">{e.title}</div>
                <div className="text-xs tm">{e.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setModal({ open: true, decision: null })} className="btn-p">
            <Plus size={16} />İlk Kararı Kaydet
          </button>
        </div>
      )}

      {/* Decision Cards */}
      <div className="space-y-4">
        {filtered.map((d) => (
          <div key={d.id} className="glass overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-lg">{II[d.impact]}</span>
                    <h3 className="text-lg font-bold tp">{d.title}</h3>
                    <span className={`bdg ${IC[d.impact]}`}>{d.impact}</span>
                    <span className={`bdg ${SC[d.status]}`}>{SI[d.status]} {d.status}</span>
                  </div>

                  {d.context && <p className="ts text-sm mb-3 line-clamp-2">{d.context}</p>}

                  <div className="flex items-center gap-4 text-xs tm flex-wrap">
                    {d.owner && <span className="flex items-center gap-1"><User size={11} />{d.owner}</span>}
                    <span className="flex items-center gap-1"><Calendar size={11} />{new Date(d.date).toLocaleDateString('tr-TR')}</span>
                    {d.tags.length > 0 && d.tags.map((t) => <span key={t} className="bdg bdg-p">{t}</span>)}
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => setExpanded(expanded === d.id ? null : d.id)} className="btn-g text-xs py-1.5 px-3">
                    {expanded === d.id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    {expanded === d.id ? 'Daralt' : 'Detay'}
                  </button>
                  <button onClick={() => setModal({ open: true, decision: d })} className="btn-g text-xs py-1.5 px-3">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setConfirm(d.id)} className="btn-d text-xs py-1.5 px-3">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            {expanded === d.id && (
              <div className="px-5 pb-5 space-y-4">
                <div className="h-px" style={{ background: 'var(--bd)' }} />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {d.context && (
                      <div>
                        <div className="text-xs font-bold tm mb-1 uppercase tracking-wider">Bağlam</div>
                        <p className="text-sm ts">{d.context}</p>
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold tm mb-1 uppercase tracking-wider">Karar</div>
                      <p className="text-sm tp font-medium">{d.decision}</p>
                    </div>
                    {d.rationale && (
                      <div>
                        <div className="text-xs font-bold tm mb-1 uppercase tracking-wider">Gerekçe</div>
                        <p className="text-sm ts">{d.rationale}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4">
                    {d.outcome && (
                      <div className="p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <div className="text-xs font-bold mb-1" style={{ color: 'var(--green)' }}>✅ SONUÇ</div>
                        <p className="text-sm ts">{d.outcome}</p>
                      </div>
                    )}
                    {!d.outcome && (
                      <div className="p-3 rounded-lg" style={{ background: 'var(--bg-s)' }}>
                        <div className="text-xs font-bold tm mb-1">SONUÇ</div>
                        <p className="text-sm tm italic">Henüz sonuç eklenmedi</p>
                        <button onClick={() => setModal({ open: true, decision: d })} className="btn-g text-xs mt-2">
                          Sonucu Ekle
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && decisions.length > 0 && (
          <div className="text-center py-10 tm">Filtreye uyan karar bulunamadı.</div>
        )}
      </div>

      {confirm && (
        <div className="modal-ov">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <h3 className="text-lg font-bold tp mb-2">Kararı Sil?</h3>
            <p className="ts text-sm mb-6">Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-g">İptal</button>
              <button onClick={() => { deleteDecision(confirm); setConfirm(null); }} className="btn-d">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <DecisionModal open={modal.open} decision={modal.decision} onClose={() => setModal({ open: false })} />
    </div>
  );
}
