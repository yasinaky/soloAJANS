import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useDecisionStore } from '../../stores/index';
import type { DecisionLog, DecisionStatus } from '../../types/index';

interface Props { open: boolean; decision?: DecisionLog | null; onClose: () => void; }

const IMPACTS = [
  { v: 'low',      l: '📍 Düşük',    desc: 'Günlük operasyonel' },
  { v: 'medium',   l: '⚠️ Orta',     desc: 'Departman seviyesi' },
  { v: 'high',     l: '🔴 Yüksek',   desc: 'Şirket geneli etkili' },
  { v: 'critical', l: '🚨 Kritik',   desc: 'Strateji değiştiren' },
];

const STATUSES: { v: DecisionStatus; l: string }[] = [
  { v: 'pending',     l: '⏳ Beklemede' },
  { v: 'active',      l: '🟢 Aktif / Uygulanıyor' },
  { v: 'implemented', l: '✅ Tamamlandı' },
  { v: 'cancelled',   l: '❌ İptal Edildi' },
];

const blank: Omit<DecisionLog, 'id'> = {
  title: '', context: '', decision: '', rationale: '',
  owner: '', impact: 'medium', date: new Date().toISOString().slice(0, 10),
  status: 'active', tags: [], outcome: '',
};

export function DecisionModal({ open, decision, onClose }: Props) {
  const addDecision = useDecisionStore((s) => s.addDecision);
  const updateDecision = useDecisionStore((s) => s.updateDecision);

  const [form, setForm] = useState({ ...blank });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open) setForm(decision ? { ...decision } : { ...blank, date: new Date().toISOString().slice(0, 10) });
    setTagInput('');
  }, [open, decision]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const save = () => {
    if (!form.title.trim() || !form.decision.trim()) return;
    if (decision) {
      updateDecision(decision.id, { ...form });
    } else {
      addDecision({ ...form, id: Math.random().toString(36).slice(2) });
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 640 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tp">{decision ? 'Kararı Düzenle' : 'Karar Kaydet'}</h2>
          <button onClick={onClose} className="btn-g p-2"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Karar Başlığı *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="inp"
              placeholder="örn: Fiyatlandırma modelini değiştir, Yeni market'e gir..." autoFocus />
          </div>

          <div className="form-field">
            <label className="form-label">Bağlam — Bu karar neden gündeme geldi?</label>
            <textarea value={form.context} onChange={(e) => set('context', e.target.value)}
              className="ta" rows={2} placeholder="Hangi sorun veya fırsat bu kararı zorunlu kıldı?" />
          </div>

          <div className="form-field">
            <label className="form-label">Karar *</label>
            <textarea value={form.decision} onChange={(e) => set('decision', e.target.value)}
              className="ta" rows={2} placeholder="Ne yapılmasına karar verildi? Spesifik ve net yaz." />
          </div>

          <div className="form-field">
            <label className="form-label">Gerekçe — Neden bu karar?</label>
            <textarea value={form.rationale} onChange={(e) => set('rationale', e.target.value)}
              className="ta" rows={2} placeholder="Bu kararın arkasındaki mantık, veriler, alternatifler..." />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Etki Seviyesi</label>
              <select value={form.impact} onChange={(e) => set('impact', e.target.value)} className="sel">
                {IMPACTS.map((i) => <option key={i.v} value={i.v}>{i.l} — {i.desc}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Durum</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="sel">
                {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Sorumlu Kişi</label>
              <input value={form.owner} onChange={(e) => set('owner', e.target.value)} className="inp" placeholder="örn: Kurucu, CEO, Satış Müdürü" />
            </div>
            <div className="form-field">
              <label className="form-label">Tarih</label>
              <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} className="inp" />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Sonuç <span className="tm">(opsiyonel — kararın ardından ne oldu?)</span></label>
            <textarea value={form.outcome || ''} onChange={(e) => set('outcome', e.target.value)}
              className="ta" rows={2} placeholder="Uygulandıktan sonra ne oldu? Hedeflere ulaşıldı mı?" />
          </div>

          <div className="form-field">
            <label className="form-label">Etiketler</label>
            <div className="flex gap-2">
              <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="inp flex-1" placeholder="strateji, büyüme, ürün..." />
              <button type="button" onClick={addTag} className="btn-g px-3"><Plus size={14} /></button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {form.tags.map((t) => (
                  <span key={t} className="bdg bdg-p flex items-center gap-1 cursor-pointer"
                    onClick={() => set('tags', form.tags.filter((x) => x !== t))}>
                    {t} <Trash2 size={9} />
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-g flex-1 justify-center">İptal</button>
          <button onClick={save} className="btn-p flex-1 justify-center" disabled={!form.title.trim() || !form.decision.trim()}>
            {decision ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
