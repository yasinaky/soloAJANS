import { useState, useEffect, useRef } from 'react';
import { X, Upload, FileText, Paperclip } from 'lucide-react';
import { useTaskStore, useAgentStore } from '../../stores/index';
import type { Task, TaskStatus, Department, Priority, TaskAttachment, AttachmentMediaType } from '../../types/index';

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

const ALLOWED_TYPES: AttachmentMediaType[] = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf',
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_COUNT = 3;

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskModal({ open, task, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const updateTask = useTaskStore((s) => s.updateTask);
  const agents = useAgentStore((s) => s.agents);
  const fileRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const blank = {
    title: '', description: '', status: 'backlog' as TaskStatus,
    department: 'engineering' as Department, priority: 'medium' as Priority,
    agent_id: '', due_date: '', tags: '', progress: 0,
  };
  const [form, setForm] = useState(blank);
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);

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
      setAttachments(task.attachments || []);
    } else {
      setForm(blank);
      setAttachments([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task, open]);

  if (!open) return null;

  const set = (k: string, v: string | number) => setForm((f) => ({ ...f, [k]: v }));

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type as AttachmentMediaType)) {
        alert(`Desteklenmeyen dosya tipi: ${file.type}. JPG, PNG, GIF, WEBP veya PDF yükle.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        alert(`${file.name} 5 MB'ı aşıyor.`);
        return;
      }
      setAttachments((prev) => {
        if (prev.length >= MAX_COUNT) {
          alert(`En fazla ${MAX_COUNT} dosya eklenebilir.`);
          return prev;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          const data = result.split(',')[1];
          setAttachments((p) => p.length < MAX_COUNT ? [...p, {
            name: file.name,
            media_type: file.type as AttachmentMediaType,
            data,
            size: file.size,
          }] : p);
        };
        reader.readAsDataURL(file);
        return prev;
      });
    });
  };

  const removeAttachment = (i: number) =>
    setAttachments((prev) => prev.filter((_, j) => j !== i));

  const save = () => {
    const agent = agents.find((a) => a.id === form.agent_id);
    const tags = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    const now = new Date().toISOString();
    const atts = attachments.length ? attachments : undefined;
    if (task) {
      updateTask(task.id, {
        ...form, tags,
        agent_name: agent?.name,
        agent_id: form.agent_id || null,
        updated_at: now,
        attachments: atts,
      });
    } else {
      addTask({
        ...form, tags,
        id: `t${Date.now()}`,
        agent_name: agent?.name,
        agent_id: form.agent_id || null,
        created_at: now, updated_at: now,
        attachments: atts,
      });
    }
    onClose();
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
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

          {/* ── Ek dosya / görsel / PDF ── */}
          <div className="form-field">
            <label className="form-label flex items-center gap-1.5">
              <Paperclip size={12} />Ekler
              <span className="tm">(görsel / PDF · maks {MAX_COUNT} dosya · 5 MB)</span>
            </label>

            {/* Drag-drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
              onClick={() => fileRef.current?.click()}
              className="rounded-xl cursor-pointer flex flex-col items-center justify-center gap-2 py-5 transition-all"
              style={{
                border: `2px dashed ${drag ? 'var(--cyan)' : 'var(--bd)'}`,
                background: drag ? 'rgba(0,212,255,0.06)' : 'var(--bg-s)',
              }}
            >
              <Upload size={20} style={{ color: 'var(--cyan)' }} />
              <span className="text-xs ts">Sürükle bırak veya tıkla seç</span>
              <span className="text-xs tm">JPG · PNG · GIF · WEBP · PDF</span>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
            />

            {/* Önizlemeler */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {attachments.map((att, i) => (
                  <div key={i} className="relative group rounded-lg overflow-hidden flex-shrink-0"
                    style={{ width: 80, height: 80, background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
                    {att.media_type === 'application/pdf' ? (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-1 p-1">
                        <FileText size={26} style={{ color: 'var(--cyan)' }} />
                        <span className="text-xs tm text-center leading-tight" style={{ wordBreak: 'break-all', fontSize: 9 }}>
                          {att.name.length > 14 ? att.name.slice(0, 12) + '…' : att.name}
                        </span>
                        {att.size && <span className="text-xs" style={{ fontSize: 9, color: 'var(--tm)' }}>{fmtSize(att.size)}</span>}
                      </div>
                    ) : (
                      <img
                        src={`data:${att.media_type};base64,${att.data}`}
                        alt={att.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    {/* Kaldır butonu */}
                    <button
                      type="button"
                      onClick={() => removeAttachment(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(239,68,68,0.92)' }}
                    >
                      <X size={11} color="white" />
                    </button>
                    {/* Dosya adı tooltip */}
                    <div className="absolute bottom-0 left-0 right-0 px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity text-center"
                      style={{ background: 'rgba(0,0,0,0.65)', fontSize: 9, color: 'white', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                      {att.name}
                    </div>
                  </div>
                ))}
                {attachments.length < MAX_COUNT && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                    style={{ width: 80, height: 80, border: '2px dashed var(--bd)', background: 'var(--bg-s)', color: 'var(--ts)' }}
                  >
                    <Upload size={18} />
                  </button>
                )}
              </div>
            )}
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
