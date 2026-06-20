import { useState } from 'react';
import { Plus, Search, Eye, Tag, Edit2, Trash2, BookOpen } from 'lucide-react';
import { useKnowledgeStore, useAgentStore } from '../stores/index';
import { KnowledgeModal } from '../components/modals/KnowledgeModal';
import type { KnowledgeItem } from '../types/index';

const CATS = ['sop','prompt','doc','template','guide'] as const;
const ICONS: Record<string, string> = { sop:'📋', prompt:'💬', doc:'📄', template:'🎨', guide:'📚' };
const DEPT_ICONS: Record<string, string> = { all:'🌐', engineering:'⚙️', marketing:'📢', support:'🛟', design:'🎨', sales:'💼', analytics:'📊' };

export function KnowledgeHub() {
  const items = useKnowledgeStore((s) => s.items);
  const deleteItem = useKnowledgeStore((s) => s.deleteItem);
  const updateItem = useKnowledgeStore((s) => s.updateItem);
  const agents = useAgentStore((s) => s.agents);

  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');
  const [modal, setModal] = useState<{ open: boolean; item?: KnowledgeItem | null }>({ open: false });
  const [expanded, setExpanded] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<string | null>(null);

  const filtered = items.filter((i) =>
    (!q || i.title.toLowerCase().includes(q.toLowerCase()) || i.content.toLowerCase().includes(q.toLowerCase()) || i.tags.some((t) => t.includes(q.toLowerCase()))) &&
    (!cat || i.category === cat)
  );

  const getAgentName = (id: string) => agents.find((a) => a.id === id)?.name || id;

  const view = (item: KnowledgeItem) => {
    updateItem(item.id, { views: (item.views || 0) + 1 });
    setExpanded(expanded === item.id ? null : item.id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tp">Bilgi Merkezi</h1>
          <p className="ts text-sm mt-1">
            Şirketin iç bilgi tabanı — SOP'lar, şablonlar, rehberler, ajan promptları
          </p>
        </div>
        <button onClick={() => setModal({ open: true, item: null })} className="btn-p">
          <Plus size={16} />Doküman Ekle
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-3">
        {CATS.map((c) => {
          const count = items.filter((i) => i.category === c).length;
          return (
            <div key={c} className="glass p-4 text-center cursor-pointer" onClick={() => setCat(cat === c ? '' : c)}
              style={{ borderColor: cat === c ? 'var(--cyan)' : undefined }}>
              <div className="text-2xl mb-1">{ICONS[c]}</div>
              <div className="font-bold tp">{count}</div>
              <div className="text-xs tm">{c}</div>
            </div>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="glass p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 tm" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doküman veya içerik ara..." className="inp pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat('')} className={`px-3 py-1.5 rounded text-sm font-medium ${!cat ? 'btn-p' : 'bdg bdg-gr'}`}>Tümü ({items.length})</button>
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c === cat ? '' : c)}
              className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${cat === c ? 'btn-p' : 'bdg bdg-gr'}`}>
              {ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 && (
        <div className="glass p-12 text-center">
          <BookOpen size={48} className="mx-auto mb-4 tm" />
          <h3 className="text-xl font-bold tp mb-2">Bilgi tabanın henüz boş</h3>
          <p className="ts text-sm mb-6 max-w-md mx-auto">
            Şirketinin bilgi birikimini buraya topla. Ajanların referans alacağı SOP'lar,
            prompt şablonları, iş rehberleri ve dokümanlar ekle.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mb-6 text-left">
            {[
              { icon: '📋', title: 'SOP', desc: 'Operasyon adımları' },
              { icon: '💬', title: 'Prompt', desc: 'Ajan prompt şablonları' },
              { icon: '📚', title: 'Rehber', desc: 'Süreç ve iş kılavuzları' },
            ].map((e) => (
              <div key={e.title} className="glass p-3 text-center">
                <div className="text-2xl mb-1">{e.icon}</div>
                <div className="font-semibold tp text-sm">{e.title}</div>
                <div className="text-xs tm">{e.desc}</div>
              </div>
            ))}
          </div>
          <button onClick={() => setModal({ open: true, item: null })} className="btn-p">
            <Plus size={16} />İlk Dokümanı Ekle
          </button>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="glass overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-lg font-semibold tp">{item.title}</h3>
                    <span className="bdg bdg-c">{ICONS[item.category]} {item.category}</span>
                    <span className="bdg bdg-gr">{DEPT_ICONS[item.department]} {item.department}</span>
                  </div>
                  <p className={`ts text-sm mb-3 ${expanded === item.id ? '' : 'line-clamp-2'}`}>{item.content}</p>
                  <div className="flex items-center gap-4 text-xs flex-wrap">
                    <div className="flex items-center gap-1 tm"><Eye size={13} />{item.views} görüntüleme</div>
                    {item.author && <span className="tm">✍️ {item.author}</span>}
                    <span className="tm">{new Date(item.updated_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.tags.map((t) => <span key={t} className="bdg bdg-p"><Tag size={9} />{t}</span>)}
                    </div>
                  )}
                  {item.assigned_agents.length > 0 && (
                    <div className="flex items-center gap-2 mt-2 text-xs tm">
                      <span>Ajanlar:</span>
                      {item.assigned_agents.map((id) => (
                        <span key={id} className="bdg bdg-c">{getAgentName(id)}</span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => view(item)} className="btn-g text-xs py-1.5 px-3">
                    <Eye size={12} />{expanded === item.id ? 'Kapat' : 'Görüntüle'}
                  </button>
                  <button onClick={() => setModal({ open: true, item })} className="btn-g text-xs py-1.5 px-3">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => setConfirm(item.id)} className="btn-d text-xs py-1.5 px-3">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>

            {expanded === item.id && (
              <div className="px-5 pb-5">
                <div className="p-4 rounded-xl font-mono text-sm leading-relaxed whitespace-pre-wrap"
                  style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)', color: 'var(--tp)' }}>
                  {item.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && items.length > 0 && (
          <div className="text-center py-10 tm">
            <Search size={32} className="mx-auto mb-2" />
            <p>Arama sonucu bulunamadı.</p>
          </div>
        )}
      </div>

      {confirm && (
        <div className="modal-ov">
          <div className="modal-box" style={{ maxWidth: 380 }}>
            <h3 className="text-lg font-bold tp mb-2">Dokümanı Sil?</h3>
            <p className="ts text-sm mb-6">Bu işlem geri alınamaz.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirm(null)} className="btn-g">İptal</button>
              <button onClick={() => { deleteItem(confirm); setConfirm(null); }} className="btn-d">Evet, Sil</button>
            </div>
          </div>
        </div>
      )}

      <KnowledgeModal open={modal.open} item={modal.item} onClose={() => setModal({ open: false })} />
    </div>
  );
}
