import { useState } from 'react';
import { X, Plus, ArrowRight } from 'lucide-react';
import { useTaskStore, useAgentStore, useNotifStore } from '../../stores/index';
import { DEPARTMENTS } from '../../data/mockData';
import type { Department, Priority } from '../../types/index';

interface Props {
  open: boolean;
  context: string;
  contextType: 'task' | 'decision';
  defaultDept?: Department;
  onClose: () => void;
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'critical'];

export function FollowUpModal({ open, context, contextType, defaultDept, onClose }: Props) {
  const addTask = useTaskStore((s) => s.addTask);
  const agents = useAgentStore((s) => s.agents);
  const addNotif = useNotifStore((s) => s.add);

  const [request, setRequest] = useState('');
  const [dept, setDept] = useState<Department>(defaultDept || 'engineering');
  const [priority, setPriority] = useState<Priority>('medium');
  const [error, setError] = useState('');

  const close = () => { setRequest(''); setError(''); onClose(); };

  const submit = () => {
    if (!request.trim()) { setError('Talebini yaz'); return; }

    const agent = agents.find((a) => a.department === dept) || agents[0];
    const now = new Date().toISOString();
    addTask({
      id: Math.random().toString(36).slice(2),
      title: request.trim().slice(0, 100),
      description: `${contextType === 'task' ? '📌 Kaynak görev' : '📌 Kaynak karar'}: ${context}\n\n🔄 Kullanıcı talebi: ${request.trim()}`,
      status: 'queued',
      department: dept,
      agent_id: agent ? agent.id : null,
      agent_name: agent ? agent.name : undefined,
      priority,
      created_at: now,
      updated_at: now,
      tags: ['follow-up'],
      progress: 0,
    });
    addNotif({ title: '➕ Ek Talep Eklendi', message: `"${request.trim().slice(0, 60)}" kuyruğa alındı`, type: 'info' });
    close();
  };

  if (!open) return null;

  return (
    <div className="modal-ov" onClick={close}>
      <div className="modal-box" style={{ maxWidth: 520 }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tp flex items-center gap-2">
            <Plus size={18} style={{ color: 'var(--cyan)' }} />Ek Talep / Düzeltme
          </h2>
          <button onClick={close} className="btn-g p-2"><X size={16} /></button>
        </div>

        <div className="mb-4 p-3 rounded-lg text-xs ts" style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
          <span className="tm">Kaynak: </span>
          <span className="font-medium tp">{context}</span>
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Ne yapılsın? *</label>
            <textarea
              value={request}
              onChange={(e) => { setRequest(e.target.value); setError(''); }}
              className="ta" rows={4}
              placeholder="Düzeltilmesini istediğin şeyi ya da ek talebi yaz...&#10;örn: 'Fiyatlandırma kısmını tekrar çalış', 'Mobil uyumluluk ekle'"
              autoFocus
            />
            {error && <p className="text-xs tred mt-1">{error}</p>}
          </div>

          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Departman</label>
              <select value={dept} onChange={(e) => setDept(e.target.value as Department)} className="sel">
                {DEPARTMENTS.map((d) => (
                  <option key={d.id} value={d.id}>{d.icon} {d.name_tr}</option>
                ))}
              </select>
            </div>
            <div className="form-field">
              <label className="form-label">Öncelik</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className="sel">
                {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={close} className="btn-g flex-1 justify-center">İptal</button>
          <button onClick={submit} className="btn-p flex-1 justify-center">
            <ArrowRight size={16} />Kuyruğa Ekle
          </button>
        </div>
      </div>
    </div>
  );
}
