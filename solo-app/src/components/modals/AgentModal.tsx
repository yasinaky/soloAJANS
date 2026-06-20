import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAgentStore } from '../../stores/index';
import type { Agent, Department, AgentStatus, AutonomyLevel } from '../../types/index';

interface Props { open: boolean; agent?: Agent | null; onClose: () => void; }

const DEPTS: Department[] = ['engineering','marketing','support','design','sales','analytics'];
const DEPT_TR: Record<string,string> = { engineering:'Mühendislik', marketing:'Pazarlama', support:'Destek', design:'Tasarım', sales:'Satış', analytics:'Analitik' };
const MODELS = ['Claude 3','Claude 3 Opus','GPT-4','GPT-4 Turbo','GPT-3.5','Gemini Pro','Llama 3'];
const AUTONOMY: AutonomyLevel[] = ['low','medium','high','full'];
const AUTONOMY_TR: Record<string,string> = { low:'Düşük', medium:'Orta', high:'Yüksek', full:'Tam Özerk' };
const STATUSES: AgentStatus[] = ['active','idle','paused','error','running'];
const STATUS_TR: Record<string,string> = { active:'Aktif', idle:'Bekliyor', paused:'Durduruldu', error:'Hata', running:'Çalışıyor' };
const COLORS = ['#00d4ff','#7c3aed','#10b981','#f59e0b','#ef4444','#ec4899'];

export function AgentModal({ open, agent, onClose }: Props) {
  const addAgent = useAgentStore((s) => s.addAgent);
  const updateAgent = useAgentStore((s) => s.updateAgent);

  const blank = {
    name: '', role: '', department: 'engineering' as Department,
    objective: '', model: 'Claude 3', tools: '',
    autonomy_level: 'medium' as AutonomyLevel, status: 'idle' as AgentStatus,
    schedule: 'Mon-Fri 9-17', avatar_color: '#00d4ff',
  };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (agent) setForm({ ...blank, ...agent, tools: agent.tools.join(', '), avatar_color: agent.avatar_color || '#00d4ff' });
    else setForm(blank);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent, open]);

  if (!open) return null;

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    const tools = form.tools.split(',').map((t) => t.trim()).filter(Boolean);
    if (agent) {
      updateAgent(agent.id, { ...form, tools });
    } else {
      addAgent({
        ...form, tools,
        id: `a${Date.now()}`,
        success_rate: 80, tasks_completed: 0,
        last_run: 'Hiç', queue_length: 0,
        created_at: new Date().toISOString(),
        guardrails: [], xp: 0, level: 1,
      });
    }
    onClose();
  };

  return (
    <div className="modal-ov" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold tp">{agent ? 'Ajan Düzenle' : 'Yeni Ajan Oluştur'}</h2>
          <button onClick={onClose} className="btn-g p-2"><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">İsim</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="inp" placeholder="Ajan adı" />
            </div>
            <div className="form-field">
              <label className="form-label">Rol</label>
              <input value={form.role} onChange={(e) => set('role', e.target.value)} className="inp" placeholder="Full Stack Dev, SEO Uzmanı..." />
            </div>
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Departman</label>
              <select value={form.department} onChange={(e) => set('department', e.target.value)} className="sel" style={{ width:'100%' }}>
                {DEPTS.map((d) => <option key={d} value={d}>{DEPT_TR[d]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">AI Modeli</label>
              <select value={form.model} onChange={(e) => set('model', e.target.value)} className="sel" style={{ width:'100%' }}>
                {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Hedef / Objective</label>
            <input value={form.objective} onChange={(e) => set('objective', e.target.value)} className="inp" placeholder="Bu ajanın ana amacı nedir?" />
          </div>

          <div className="form-field">
            <label className="form-label">Araçlar (virgülle ayır)</label>
            <input value={form.tools} onChange={(e) => set('tools', e.target.value)} className="inp" placeholder="GitHub, Slack, Notion, Figma" />
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Özerklik Seviyesi</label>
              <select value={form.autonomy_level} onChange={(e) => set('autonomy_level', e.target.value)} className="sel" style={{ width:'100%' }}>
                {AUTONOMY.map((a) => <option key={a} value={a}>{AUTONOMY_TR[a]}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Başlangıç Durumu</label>
              <select value={form.status} onChange={(e) => set('status', e.target.value)} className="sel" style={{ width:'100%' }}>
                {STATUSES.map((s) => <option key={s} value={s}>{STATUS_TR[s]}</option>)}
              </select>
            </div>
          </div>

          <div className="form-field">
            <label className="form-label">Çalışma Programı</label>
            <input value={form.schedule} onChange={(e) => set('schedule', e.target.value)} className="inp" placeholder="Mon-Fri 9-17, 7/24, Cuma günleri" />
          </div>

          <div className="form-field">
            <label className="form-label">Avatar Rengi</label>
            <div className="flex gap-2 mt-1">
              {COLORS.map((c) => (
                <button key={c} onClick={() => set('avatar_color', c)}
                  style={{ width:28, height:28, borderRadius:'50%', background:c, border: form.avatar_color===c ? '3px solid white' : '2px solid transparent', cursor:'pointer' }} />
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="btn-g">İptal</button>
          <button onClick={save} disabled={!form.name.trim()} className="btn-p" style={{ opacity: form.name.trim() ? 1 : 0.5 }}>
            {agent ? 'Değişiklikleri Kaydet' : 'Ajan Oluştur'}
          </button>
        </div>
      </div>
    </div>
  );
}
