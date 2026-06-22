import { useState, useEffect } from 'react';
import { X, CheckCircle, Trash2, Edit2, Brain, Plus } from 'lucide-react';
import { useDecisionStore, useTaskStore } from '../../stores/index';
import type { ProposedDecision, DecisionLog } from '../../types/index';

const IMPACTS = ['low','medium','high','critical'] as const;
const II: Record<string,string> = { low:'📍',medium:'⚠️',high:'🔴',critical:'🚨' };

interface Props {
  proposal: ProposedDecision | null;
  onClose: () => void;
  onFollowUp?: (context: string) => void;
}

export function ProposedDecisionModal({ proposal, onClose, onFollowUp }: Props) {
  const approveProposed = useDecisionStore((s) => s.approveProposed);
  const removeProposed = useDecisionStore((s) => s.removeProposed);
  const tasks = useTaskStore((s) => s.tasks);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title:'', decision:'', rationale:'', impact:'medium' as ProposedDecision['impact'], tags: [] as string[] });

  useEffect(() => {
    if (proposal) {
      setForm({ title: proposal.title, decision: proposal.decision, rationale: proposal.rationale, impact: proposal.impact, tags: proposal.tags });
      setEditing(false);
    }
  }, [proposal]);

  if (!proposal) return null;

  const sourceTasks = tasks.filter((t) => proposal.source_task_ids.includes(t.id));
  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const approve = () => {
    const decision: DecisionLog = {
      id: Math.random().toString(36).slice(2),
      title: form.title,
      decision: form.decision,
      rationale: form.rationale,
      impact: form.impact,
      status: 'active',
      date: new Date().toISOString().slice(0, 10),
      owner: sourceTasks.map((t) => t.agent_name).filter(Boolean).join(', ') || 'AI Ekip',
      tags: form.tags,
      context: `${sourceTasks.length} görev çıktısından AI sentezi: ${sourceTasks.map((t) => t.title).join(', ')}`,
      outcome: '',
    };
    approveProposed(proposal.id, decision);
    onClose();
  };

  const reject = () => { removeProposed(proposal.id); onClose(); };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold tp flex items-center gap-2">
            <Brain size={20} style={{ color: 'var(--purple)' }} />AI Karar Önerisi
          </h2>
          <button onClick={onClose} className="btn-g p-2"><X size={16} /></button>
        </div>

        {/* Kaynak görevler */}
        <div className="mb-4 p-3 rounded-xl text-xs" style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.25)' }}>
          <div className="font-semibold mb-2" style={{ color: 'var(--purple)' }}>
            🧠 {sourceTasks.length} görev çıktısından sentezlendi
          </div>
          <div className="space-y-1">
            {sourceTasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2 tm">
                <span className="tgreen">✓</span>
                <span className="font-medium tp">{t.title}</span>
                {t.agent_name && <span className="bdg bdg-c">{t.agent_name}</span>}
              </div>
            ))}
          </div>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <div className="glass p-4">
              <div className="text-xs font-bold tm mb-1 uppercase tracking-wider">Önerilen Karar Başlığı</div>
              <div className="font-bold tp">{form.title}</div>
            </div>
            <div className="glass p-4">
              <div className="text-xs font-bold tm mb-1 uppercase tracking-wider">Karar</div>
              <p className="text-sm tp">{form.decision}</p>
            </div>
            <div className="glass p-4">
              <div className="text-xs font-bold tm mb-1 uppercase tracking-wider">Gerekçe</div>
              <p className="text-sm ts">{form.rationale}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs tm">Etki:</span>
              <span className="bdg bdg-r">{II[form.impact]} {form.impact}</span>
              {form.tags.map((t) => <span key={t} className="bdg bdg-p">{t}</span>)}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="form-field">
              <label className="form-label">Karar Başlığı</label>
              <input value={form.title} onChange={(e) => set('title', e.target.value)} className="inp" />
            </div>
            <div className="form-field">
              <label className="form-label">Karar</label>
              <textarea value={form.decision} onChange={(e) => set('decision', e.target.value)} className="ta" rows={3} />
            </div>
            <div className="form-field">
              <label className="form-label">Gerekçe</label>
              <textarea value={form.rationale} onChange={(e) => set('rationale', e.target.value)} className="ta" rows={2} />
            </div>
            <div className="form-field">
              <label className="form-label">Etki</label>
              <select value={form.impact} onChange={(e) => set('impact', e.target.value)} className="sel">
                {IMPACTS.map((i) => <option key={i} value={i}>{II[i]} {i}</option>)}
              </select>
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-5">
          <button onClick={reject} className="btn-d flex-shrink-0">
            <Trash2 size={14} />Reddet
          </button>
          <button onClick={() => setEditing(!editing)} className="btn-g flex-shrink-0">
            <Edit2 size={14} />{editing ? 'Önizle' : 'Düzenle'}
          </button>
          {onFollowUp && (
            <button onClick={() => { onClose(); onFollowUp(form.title); }} className="btn-g flex-shrink-0">
              <Plus size={14} />Ek Talep
            </button>
          )}
          <button onClick={approve} className="btn-p flex-1 justify-center"
            disabled={!form.title.trim() || !form.decision.trim()}>
            <CheckCircle size={16} />Onayla & Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}
