import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTaskStore, useAgentStore } from '../../stores/index';
import type { Task, TaskStatus, Department, Priority } from '../../types/index';

interface Props { open: boolean; task?: Task | null; onClose: () => void; }

const STATUSES: { v: TaskStatus; l: string }[] = [
  { v:'backlog', l:'📋 Backlog' }, { v:'queued', l:'⏳ Kuyruk' },
  { v:'running', l:'⚙️ Çalışıyor' }, { v:'review', l:'👀 İnceleme' },
  { v:'done', l:'✅ Tamamlandı' }, { v:'blocked', l:'🚫 Engellendi' },
];
const DEPTS: { v: Department; l: string }[] = [
  { v:'engineering', l:'⚙️ Mühendislik' }, { v:'marketing', l:'📢 Pazarlama' },
  { v:'support', l:'🛟 Destek' }, { v:'design', l:'🎨 Tasarım' },
  { v:'sales', l:'💼 Satış' }, { v:'analytics', l:'📊 Analitik' },
];
const PRIORITIES: { v: Priority; l: string }[] = [
  { v:'low', l:'🟢 Düşük' }, { v:'medium', l:'🟡 Orta' },
  { v:'high', l:'🟠 Yüksek' }, { v:'critical', l:'🔴 Kritik' },
];

export function TaskModal({ open, task, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const agents = useAgentStore((s) => s.agents);

  const blank = {
    title: '', description: '', status: 'backlog' as TaskStatus,
    department: 'engineering' as Department, priority: 'medium' as Priority,
    agent_id: '', due_date: '', tags: '', progress: 0,
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (task) {
      setForm({
        ...blank, ...task,
        tags: task.tags.join(', '),
        agent_id: task.agent_id || '',
        due_date: task.due_date || '',
        progress: task.progress ?? 0,
      });
    } else setForm(blank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, open]);

  if (!open) return null;

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const agent = agents.find((a) => a.id === form.agent_id);
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const now = new Date().toISOString();
    if (task) {
      updateTask(task.id, {
        ...form, tags,
        agent_name: agent?.name,
        agent_id: form.agent_id || null,
        updated_at: now,
      });
    } else {
      addTask({
        ...form, tags,
        id: `t${Date.now()}`,
        agent_name: agent?.name,
        agent_id: form.agent_id || null,
        created_at: now, updated_at: now,
      });
    }
    onClose();
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tp">{task ? 'Görevi Düzenle' : 'Yeni Görev Oluştur'}</h2>
          <button onClick={onClose} className="btn-g p-2"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Başlık</label>
            <input value={form.title} onChange={(e) => set('title', e.target.value)} className="inp" placeholder="Görev başlığı" />
          </div>

          <div className="form-field">
            <label className="form-label">Açıklama</label>
            <textarea value={form.description} onChange={(e) => set('description', e.target.value)} className="ta" placeholder="Görevi detaylı anlat..." />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Durum</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="sel" style={{ width:'100%' }}>
                {STATUSES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Öncelik</label>
              <select value={form.priority} onChange={(e) => set('priority', e.target.value)} className="sel" style={{ width:'100%' }}>
                {PRIORITIES.map((p) => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Departman</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)} className="sel" style={{ width:'100%' }}>
                {DEPTS.map((d) => <option key={d.v} value={d.v}>{d.l}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Atanan Ajan</label>
              <select value={form.agent_id} onChange={(e) => set('agent_id', e.target.value)} className="sel" style={{ width:'100%' }}>
                <option value="">— Atanmamış —</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Son Tarih</label>
              <input type="date" value={form.due_date} onChange={(e) => set('due_date', e.target.value)} className="inp" />
            </div>
            <div className="form-field">
              <label className="form-label">İlerleme: {form.progress}%</label>
              <input type="range" min={0} max={100} value={form.progress} onChange={(e) => set('progress', Number(e.target.value))} className="w-full" style={{ marginTop:10 }} />
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Etiketler (virgülle ayır)</label>
            <input value={form.tags} onChange={(e) => set('tags', e.target.value)} className="inp" placeholder="api, backend, urgent, design" />
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-g">İptal</button>
          <button onClick={save} disabled={!form.title.trim()} className="btn-p" style={{ opacity: form.title.trim() ? 1 : 0.5 }}>
            {task ? 'Değişiklikleri Kaydet' : 'Görev Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
