import { useState } from 'react';
import { X, Wand2, Sparkles, Loader2, Check, Trash2 } from 'lucide-react';
import { useTaskStore, useAgentStore, useCompanyStore, useNotifStore } from '../../stores/index';
import { DEPARTMENTS } from '../../data/mockData';
import type { Task, Department, Priority } from '../../types/index';

interface Props { open: boolean; onClose: () => void; }

interface DraftTask {
  title: string;
  description: string;
  department: Department;
  priority: Priority;
}

const DEPT_LIST = DEPARTMENTS.map((d) => d.id) as Department[];

// --- Template fallback (no API key) ---
function templatePlan(goal: string, depts: Department[]): DraftTask[] {
  const verbs: Record<Department, { title: string; description: string; priority: Priority }> = {
    engineering: { title: 'Teknik altyapıyı kur', description: `"${goal}" için gerekli teknik temeli ve mimariyi oluştur.`, priority: 'high' },
    design:      { title: 'Arayüz/tasarımı hazırla', description: `"${goal}" için kullanıcı deneyimi ve görsel tasarımı çıkar.`, priority: 'medium' },
    marketing:   { title: 'Pazarlama içeriği üret', description: `"${goal}" için tanıtım metni, blog ve sosyal medya planı hazırla.`, priority: 'medium' },
    sales:       { title: 'Satış stratejisi oluştur', description: `"${goal}" için hedef müşteri ve outreach planı çıkar.`, priority: 'medium' },
    support:     { title: 'Destek süreçlerini tanımla', description: `"${goal}" için SSS ve müşteri destek akışı hazırla.`, priority: 'low' },
    analytics:   { title: 'Başarı metriklerini belirle', description: `"${goal}" için KPI'ları ve ölçüm planını tanımla.`, priority: 'low' },
  };
  return depts.map((dep) => ({ department: dep, ...verbs[dep] }));
}

async function aiPlan(goal: string, depts: Department[], apiKey: string, model: string): Promise<DraftTask[]> {
  const prompt = `Sen bir solo AI şirketinin operasyon planlayıcısısın.
Kullanıcının hedefi: "${goal}"

Bu hedefi gerçekleştirmek için somut, uygulanabilir görevlere böl.
Sadece şu departmanları kullan: ${depts.join(', ')}.
Her görev tek bir departmana ait olmalı.

SADECE geçerli bir JSON dizisi döndür, başka hiçbir şey yazma. Format:
[{"title":"kısa görev başlığı","description":"1-2 cümle ne yapılacağı","department":"departman_id","priority":"low|medium|high|critical"}]

4 ile 7 arası görev üret. department değeri tam olarak şunlardan biri olmalı: ${depts.join(', ')}.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model?.startsWith('claude-') ? model : 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text: string = data.content[0].text;
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('AI geçerli plan döndürmedi');
  const parsed = JSON.parse(match[0]) as DraftTask[];
  return parsed
    .filter((t) => t.title && depts.includes(t.department))
    .map((t) => ({
      title: String(t.title).slice(0, 120),
      description: String(t.description || ''),
      department: t.department,
      priority: (['low', 'medium', 'high', 'critical'].includes(t.priority) ? t.priority : 'medium') as Priority,
    }));
}

export function PlannerModal({ open, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const agents = useAgentStore((s) => s.agents);
  const company = useCompanyStore((s) => s.company);
  const addNotif = useNotifStore((s) => s.add);

  const [goal, setGoal] = useState('');
  const [selectedDepts, setSelectedDepts] = useState<Department[]>(DEPT_LIST);
  const [drafts, setDrafts] = useState<DraftTask[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = company.anthropic_api_key?.trim();

  const reset = () => { setGoal(''); setDrafts(null); setError(''); setLoading(false); setSelectedDepts(DEPT_LIST); };
  const close = () => { reset(); onClose(); };

  const toggleDept = (d: Department) => {
    setSelectedDepts((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);
  };

  const generate = async () => {
    if (!goal.trim()) { setError('Bir hedef yaz'); return; }
    if (selectedDepts.length === 0) { setError('En az bir departman seç'); return; }
    setError(''); setLoading(true);
    try {
      const plan = apiKey
        ? await aiPlan(goal.trim(), selectedDepts, apiKey, company.default_model)
        : templatePlan(goal.trim(), selectedDepts);
      setDrafts(plan.length ? plan : templatePlan(goal.trim(), selectedDepts));
    } catch (e) {
      setError(`AI planı başarısız: ${(e as Error).message}. Şablon plan kullanılıyor.`);
      setDrafts(templatePlan(goal.trim(), selectedDepts));
    } finally {
      setLoading(false);
    }
  };

  const removeDraft = (i: number) => setDrafts((d) => d ? d.filter((_, idx) => idx !== i) : d);

  const confirmAll = () => {
    if (!drafts || drafts.length === 0) return;
    const now = new Date().toISOString();
    drafts.forEach((d) => {
      // try to find an agent in that department to assign
      const agent = agents.find((a) => a.department === d.department);
      const task: Task = {
        id: Math.random().toString(36).slice(2),
        title: d.title,
        description: d.description,
        status: 'queued',
        department: d.department,
        agent_id: agent ? agent.id : null,
        agent_name: agent ? agent.name : undefined,
        priority: d.priority,
        created_at: now,
        updated_at: now,
        tags: ['ai-plan'],
        progress: 0,
      };
      addTask(task);
    });
    addNotif({
      title: '🎯 Plan Oluşturuldu',
      message: `"${goal.trim()}" için ${drafts.length} görev kuyruğa eklendi`,
      type: 'success',
    });
    close();
  };

  if (!open) return null;

  return (
    <div className="modal-ov" onClick={close}>
      <div className="modal-box" style={{ maxWidth: 680 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-bold tp flex items-center gap-2">
            <Wand2 size={20} style={{ color: 'var(--purple)' }} />Hedeften Görev Üret
          </h2>
          <button onClick={close} className="btn-g p-2"><X size={16} /></button>
        </div>
        <p className="ts text-sm mb-5">
          Bir hedef yaz — {apiKey ? 'AI bunu' : 'sistem bunu'} departmanlara dağıtılmış görevlere böler ve kuyruğa ekler.
          {!apiKey && <span className="tyellow"> (API key yok — şablon plan kullanılır)</span>}
        </p>

        {!drafts && (
          <div className="space-y-4">
            <div className="form-field">
              <label className="form-label">Hedefin ne? *</label>
              <textarea
                value={goal}
                onChange={(e) => { setGoal(e.target.value); setError(''); }}
                className="ta" rows={3}
                placeholder="örn: Chrome extension ürünü lanse et, ilk 100 kullanıcıya ulaş..."
                autoFocus
              />
            </div>

            <div className="form-field">
              <label className="form-label">Hangi departmanlar çalışsın?</label>
              <div className="flex flex-wrap gap-2">
                {DEPARTMENTS.map((d) => (
                  <button key={d.id} type="button" onClick={() => toggleDept(d.id)}
                    className={`bdg cursor-pointer transition-all ${selectedDepts.includes(d.id) ? 'bdg-c' : 'bdg-gr'}`}>
                    {d.icon} {d.name_tr}
                  </button>
                ))}
              </div>
            </div>

            {error && <p className="text-xs tred">{error}</p>}

            <button onClick={generate} disabled={loading} className="btn-p w-full justify-center">
              {loading ? <><Loader2 size={16} className="animate-spin" />Plan üretiliyor...</> : <><Sparkles size={16} />Plan Üret</>}
            </button>
          </div>
        )}

        {drafts && (
          <div className="space-y-4">
            {error && <p className="text-xs tyellow">{error}</p>}
            <div className="text-sm ts">
              <span className="font-semibold tp">{drafts.length} görev</span> önerildi.
              İstemediğini sil, sonra kuyruğa ekle.
            </div>
            <div className="space-y-2" style={{ maxHeight: 360, overflowY: 'auto' }}>
              {drafts.map((d, i) => {
                const dep = DEPARTMENTS.find((x) => x.id === d.department);
                const agent = agents.find((a) => a.department === d.department);
                return (
                  <div key={i} className="glass p-3 flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-semibold tp text-sm">{d.title}</span>
                        <span className="bdg bdg-c">{dep?.icon} {dep?.name_tr}</span>
                        <span className="bdg bdg-y">{d.priority}</span>
                      </div>
                      <p className="text-xs tm">{d.description}</p>
                      <p className="text-xs mt-1" style={{ color: agent ? 'var(--green)' : 'var(--yellow)' }}>
                        {agent ? `→ ${agent.name}'e atanacak` : '→ Ajan yok, otomatik atanacak'}
                      </p>
                    </div>
                    <button onClick={() => removeDraft(i)} className="btn-d text-xs px-2 py-1 flex-shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}
              {drafts.length === 0 && <div className="text-center py-6 tm text-sm">Tüm görevler silindi.</div>}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setDrafts(null)} className="btn-g flex-1 justify-center">← Geri</button>
              <button onClick={confirmAll} disabled={drafts.length === 0} className="btn-p flex-1 justify-center">
                <Check size={16} />{drafts.length} Görevi Kuyruğa Ekle
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
