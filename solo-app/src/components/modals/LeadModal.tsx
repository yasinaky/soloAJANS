import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useLeadStore } from '../../stores/index';
import type { Lead, LeadStatus } from '../../types/index';

interface Props { open: boolean; lead?: Lead | null; onClose: () => void; }

const STATUSES: { v: LeadStatus; l: string }[] = [
  { v:'new', l:'🆕 Yeni' }, { v:'contacted', l:'📞 İletişim Kuruldu' },
  { v:'qualified', l:'✅ Qualified' }, { v:'proposal', l:'💼 Teklif Gönderildi' },
  { v:'won', l:'🎉 Kazanıldı' }, { v:'lost', l:'❌ Kaybedildi' },
];
const SOURCES = ['Website Form','LinkedIn','Partner Referral','Google Ads','Event','Cold Outreach','Organic Search','Referral'];

export function LeadModal({ open, lead, onClose }: Props) {
  const addLead = useLeadStore((s) => s.addLead);
  const updateLead = useLeadStore((s) => s.updateLead);

  const blank = {
    company: '', contact_name: '', email: '', phone: '',
    source: 'Website Form', status: 'new' as LeadStatus,
    score: 50, notes: '', next_action: '', deal_value: 0, tags: '',
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (lead) {
      setForm({
        ...blank, ...lead,
        tags: lead.tags.join(', '),
        deal_value: lead.deal_value ?? 0,
        phone: lead.phone || '',
      });
    } else setForm(blank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead, open]);

  if (!open) return null;

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const now = new Date().toISOString();
    if (lead) {
      updateLead(lead.id, { ...form, tags, updated_at: now });
    } else {
      addLead({ ...form, tags, id: `l${Date.now()}`, created_at: now, updated_at: now });
    }
    onClose();
  };

  const scoreColor = form.score >= 80 ? 'var(--green)' : form.score >= 50 ? 'var(--yellow)' : 'var(--red)';

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tp">{lead ? 'Lead Düzenle' : 'Yeni Lead Ekle'}</h2>
          <button onClick={onClose} className="btn-g p-2"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Şirket Adı</label>
              <input value={form.company} onChange={(e) => set('company', e.target.value)} className="inp" placeholder="TechCorp Inc" />
            </div>
            <div className="form-field">
              <label className="form-label">İletişim Kişisi</label>
              <input value={form.contact_name} onChange={(e) => set('contact_name', e.target.value)} className="inp" placeholder="John Smith" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className="inp" placeholder="john@company.com" />
            </div>
            <div className="form-field">
              <label className="form-label">Telefon</label>
              <input value={form.phone} onChange={(e) => set('phone', e.target.value)} className="inp" placeholder="+90 555 000 0000" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Kaynak</label>
              <select value={form.source} onChange={(e) => set('source', e.target.value)} className="sel" style={{ width:'100%' }}>
                {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Pipeline Durumu</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="sel" style={{ width:'100%' }}>
                {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label" style={{ color: scoreColor }}>Lead Skoru: {form.score}</label>
              <input type="range" min={0} max={100} value={form.score} onChange={(e) => set('score', Number(e.target.value))} className="w-full" style={{ marginTop:10, accentColor: scoreColor }} />
            </div>
            <div className="form-field">
              <label className="form-label">Deal Değeri ($)</label>
              <input type="number" min={0} value={form.deal_value} onChange={(e) => set('deal_value', Number(e.target.value))} className="inp" placeholder="50000" />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Notlar</label>
            <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} className="ta" placeholder="Lead hakkında önemli bilgiler, toplantı notları..." />
          </div>

          <div className="form-field">
            <label className="form-label">Sonraki Aksiyon</label>
            <input value={form.next_action} onChange={(e) => set('next_action', e.target.value)} className="inp" placeholder="Demo planla, fiyat teklifi gönder..." />
          </div>

          <div className="form-field">
            <label className="form-label">Etiketler (virgülle ayır)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="inp" placeholder="enterprise, hot-lead, q2, startup" />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-g">İptal</button>
          <button onClick={save} disabled={!form.company.trim()} className="btn-p" style={{ opacity: form.company.trim() ? 1 : 0.5 }}>
            {lead ? 'Değişiklikleri Kaydet' : 'Lead Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
