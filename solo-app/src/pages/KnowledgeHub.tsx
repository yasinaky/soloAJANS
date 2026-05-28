import { useState } from 'react';
import { Plus, Search, Eye, Tag } from 'lucide-react';
import { useKnowledgeStore } from '../stores/index';

const CATS = ['sop','prompt','doc','template','guide'] as const;
const ICONS: Record<string,string> = { sop:'📋', prompt:'💬', doc:'📄', template:'🎨', guide:'📚' };

export function KnowledgeHub() {
  const items = useKnowledgeStore((s) => s.items);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('');

  const filtered = items.filter((i) =>
    (!q || i.title.toLowerCase().includes(q.toLowerCase()) || i.tags.some((t) => t.includes(q))) &&
    (!cat || i.category === cat)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tp">Bilgi Merkezi</h1><p className="ts text-sm mt-1">Tüm ajan dokümanları merkezi</p></div>
        <button className="btn-p"><Plus size={16} />Doküman Ekle</button>
      </div>

      <div className="glass p-4 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 tm" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doküman ara..." className="inp pl-9" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setCat('')} className={`px-3 py-1.5 rounded text-sm font-medium transition-all ${!cat ? 'btn-p' : 'bdg bdg-gr'}`}>Tümü</button>
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c === cat ? '' : c)} className={`px-3 py-1.5 rounded text-sm font-medium transition-all flex items-center gap-1 ${cat===c ? 'btn-p' : 'bdg bdg-gr'}`}>
              {ICONS[c]} {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => (
          <div key={item.id} className="glass p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold tp">{item.title}</h3>
                  <span className="bdg bdg-c">{ICONS[item.category]} {item.category}</span>
                </div>
                <p className="ts text-sm mb-3 line-clamp-2">{item.content}</p>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1 tm"><Eye size={13}/>{item.views}</div>
                  <span className="tm">{item.author}</span>
                  <span className="tm">{new Date(item.updated_at).toLocaleDateString()}</span>
                </div>
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {item.tags.map((t) => <span key={t} className="bdg bdg-p"><Tag size={9}/>{t}</span>)}
                  </div>
                )}
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-xs tm mb-2">Kullanıcılar</div>
                <div className="flex gap-1">
                  {item.assigned_agents.slice(0,3).map((id) => (
                    <div key={id} className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background:'linear-gradient(135deg,var(--cyan),var(--purple))' }}>{id.slice(-1)}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
