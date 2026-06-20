import { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useKnowledgeStore, useAgentStore } from '../../stores/index';
import type { KnowledgeItem, KnowledgeCategory } from '../../types/index';
import { DEPARTMENTS } from '../../data/mockData';

interface Props { open: boolean; item?: KnowledgeItem | null; onClose: () => void; }

const CATS: { v: KnowledgeCategory; l: string; icon: string; desc: string }[] = [
  { v: 'sop',      l: 'SOP',      icon: '📋', desc: 'Standart operasyon prosedürü' },
  { v: 'prompt',   l: 'Prompt',   icon: '💬', desc: 'Ajan için hazır prompt şablonu' },
  { v: 'doc',      l: 'Doküman',  icon: '📄', desc: 'Teknik veya ürün dökümanı' },
  { v: 'template', l: 'Şablon',   icon: '🎨', desc: 'Yeniden kullanılabilir içerik şablonu' },
  { v: 'guide',    l: 'Rehber',   icon: '📚', desc: 'Adım adım kılavuz' },
];

const blank: Omit<KnowledgeItem, 'id'> = {
  title: '', content: '', category: 'doc', department: 'all',
  tags: [], assigned_agents: [], created_at: '', updated_at: '', views: 0, author: '',
};

export function KnowledgeModal({ open, item, onClose }: Props) {
  const addItem = useKnowledgeStore((s) => s.addItem);
  const updateItem = useKnowledgeStore((s) => s.updateItem);
  const agents = useAgentStore((s) => s.agents);

  const [form, setForm] = useState({ ...blank });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (open) setForm(item ? { ...item } : { ...blank });
    setTagInput('');
  }, [open, item]);

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const toggleAgent = (id: string) => {
    const arr = form.assigned_agents.includes(id)
      ? form.assigned_agents.filter((a) => a !== id)
      : [...form.assigned_agents, id];
    set('assigned_agents', arr);
  };

  const save = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const now = new Date().toISOString();
    if (item) {
      updateItem(item.id, { ...form, updated_at: now });
    } else {
      addItem({ ...form, id: Math.random().toString(36).slice(2), created_at: now, updated_at: now, views: 0 });
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 620 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold tp">{item ? 'Dokümanı Düzenle' : 'Yeni Doküman'}</h2>
          <button onClick={onClose} className="btn-g p-2"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Başlık *</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="inp" placeholder="örn: Müşteri onboarding SOP'u" autoFocus />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Kategori</label>
              <select value={form.category} onChange={(e) => set('category', e.target.value)} className="sel">
                {CATS.map((c) => <option key={c.v} value={c.v}>{c.icon} {c.l} — {c.desc}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Departman</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)} className="sel">
                <option value="all">🌐 Tüm departmanlar</option>
                {DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.icon} {d.name_tr}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">İçerik *</label>
            <textarea
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
              className="ta" rows={6}
              placeholder="Doküman içeriğini buraya yaz... SOP adımları, prompt şablonu, rehber içeriği vs."
            />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Yazar</label>
              <input value={form.author} onChange={(e) => set('author', e.target.value)} className="inp" placeholder="örn: Kurucu, CEO" />
            </div>
            <div className="form-field">
              <label className="form-label">Etiketler</label>
              <div className="flex gap-2">
                <input value={tagInput} onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="inp flex-1" placeholder="Etiket ekle..." />
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

          {agents.length > 0 && (
            <div className="form-field">
              <label className="form-label">Bu dokümanı kullanacak ajanlar</label>
              <div className="flex flex-wrap gap-2">
                {agents.map((a) => (
                  <button key={a.id} type="button"
                    onClick={() => toggleAgent(a.id)}
                    className={`bdg cursor-pointer transition-all ${form.assigned_agents.includes(a.id) ? 'bdg-c' : 'bdg-gr'}`}>
                    {a.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-g flex-1 justify-center">İptal</button>
          <button onClick={save} className="btn-p flex-1 justify-center" disabled={!form.title.trim() || !form.content.trim()}>
            {item ? 'Güncelle' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}
