import { useState } from 'react';
import { Moon, Sun, Bell, Shield, Zap, Building2, Trash2, Save, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useThemeStore, useCompanyStore, useAgentStore, useTaskStore, useLeadStore, useDecisionStore, useKnowledgeStore } from '../stores/index';

export function Settings() {
  const { theme, toggle } = useThemeStore();
  const { company, updateCompany } = useCompanyStore();
  const [form, setForm] = useState({ ...company });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const agentStore = useAgentStore();
  const taskStore = useTaskStore();
  const leadStore = useLeadStore();
  const decisionStore = useDecisionStore();
  const knowledgeStore = useKnowledgeStore();

  const set = (k: string, v: string | number | boolean) => setForm((f) => ({ ...f, [k]: v }));

  const save = () => {
    updateCompany(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const resetData = () => {
    if (!window.confirm('Tüm veriler silinecek. Emin misiniz?\n\nBu işlem geri alınamaz — tüm ajanlar, görevler, leadler ve kararlar silinir.')) return;
    agentStore.agents.forEach((a) => agentStore.deleteAgent(a.id));
    taskStore.tasks.forEach((t) => taskStore.deleteTask(t.id));
    leadStore.leads.forEach((l) => leadStore.deleteLead(l.id));
    decisionStore.decisions.forEach((d) => decisionStore.deleteDecision(d.id));
    knowledgeStore.items.forEach((i) => knowledgeStore.deleteItem(i.id));
    alert('Tüm veriler silindi.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tp">Ayarlar</h1><p className="ts text-sm mt-1">Şirket ve sistem ayarlarınızı yönetin</p></div>
        <button onClick={save} className="btn-p">
          <Save size={16} />{saved ? '✅ Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      {/* Company Profile */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Building2 size={18} />Şirket Profili</h2>
        <div className="space-y-4">
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Şirket Adı</label>
              <input value={form.name} onChange={(e) => set('name', e.target.value)} className="inp" placeholder="Acme Corp" />
            </div>
            <div className="form-field">
              <label className="form-label">Slogan</label>
              <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className="inp" placeholder="AI ile geleceği inşa ediyoruz" />
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Misyon</label>
            <textarea value={form.mission} onChange={(e) => set('mission', e.target.value)} className="ta" rows={2} />
          </div>
          <div className="form-row">
            <div className="form-field">
              <label className="form-label">Aylık Gelir Hedefi ($)</label>
              <input type="number" value={form.revenue_target} onChange={(e) => set('revenue_target', Number(e.target.value))} className="inp" />
            </div>
            <div className="form-field">
              <label className="form-label">Ekip Boyutu Hedefi</label>
              <input type="number" value={form.team_size_target} onChange={(e) => set('team_size_target', Number(e.target.value))} className="inp" />
            </div>
          </div>
        </div>
      </div>

      {/* Theme */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2">
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}Görünüm
        </h2>
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-s)' }}>
          <div>
            <div className="font-medium tp">Tema Modu</div>
            <div className="text-sm tm">Şu an: {theme === 'dark' ? 'Karanlık' : 'Açık'} Mod</div>
          </div>
          <button onClick={toggle} className="btn-p">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}Tema Değiştir
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Bell size={18} />Bildirimler</h2>
        <div className="space-y-3">
          {[
            ['Görev Tamamlama', 'Ajanlar görev tamamladığında bildirim', true],
            ['Kritik Uyarılar', 'Sistem sorunları için acil bildirimler', true],
            ['Günlük Özet', 'Tüm aktivitelerin günlük özeti', false],
            ['Lead Güncellemeleri', 'Yeni qualify edilmiş leadlerde bildirim', false],
          ].map(([k, v, checked]) => (
            <div key={k as string} className="flex items-center justify-between p-3 rounded" style={{ background: 'var(--bg-s)' }}>
              <div>
                <div className="font-medium tp text-sm">{k as string}</div>
                <div className="text-xs tm">{v as string}</div>
              </div>
              <input type="checkbox" defaultChecked={checked as boolean} className="w-4 h-4 cursor-pointer" />
            </div>
          ))}
        </div>
      </div>

      {/* AI Safety */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Shield size={18} />Güvenlik & AI Sınırları</h2>
        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Ajan Özerklik Sınırı</label>
            <select value={form.autonomy_limit} onChange={(e) => set('autonomy_limit', e.target.value)} className="sel" style={{ width: '100%' }}>
              <option value="low">Düşük — Tüm işlemler onay gerektirir</option>
              <option value="medium">Orta — Sınırlar içinde özerk</option>
              <option value="high">Yüksek — Tam özerk + guardrails</option>
            </select>
          </div>
          <div className="form-field">
            <label className="form-label">Günlük Harcama Limiti ($)</label>
            <input type="number" value={form.spend_limit} onChange={(e) => set('spend_limit', Number(e.target.value))} className="inp" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer p-3 rounded" style={{ background: 'var(--bg-s)' }}>
            <input type="checkbox" checked={form.require_approval} onChange={(e) => set('require_approval', e.target.checked)} className="w-4 h-4 cursor-pointer" />
            <div>
              <div className="text-sm font-medium tp">Kritik kararlar için insan onayı zorunlu</div>
              <div className="text-xs tm">$5.000+ harcamalar ve prod değişiklikler için onay iste</div>
            </div>
          </label>
        </div>
      </div>

      {/* AI Model + API Key */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Zap size={18} />AI Model & API Bağlantısı</h2>
        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Varsayılan Model</label>
            <select value={form.default_model} onChange={(e) => set('default_model', e.target.value)} className="sel" style={{ width: '100%' }}>
              <option value="claude-opus-4-8">Claude Opus 4.8 (En güçlü)</option>
              <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (Dengeli)</option>
              <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Hızlı)</option>
            </select>
          </div>

          <div className="form-field">
            <label className="form-label flex items-center gap-2">
              <KeyRound size={12} />Anthropic API Key
              <span className="ml-auto" style={{ color: form.anthropic_api_key ? 'var(--green)' : 'var(--yellow)', fontWeight: 700 }}>
                {form.anthropic_api_key ? '✓ Bağlı — Gerçek AI aktif' : '⚠ Yok — Demo mod'}
              </span>
            </label>
            <div className="flex gap-2">
              <input
                type={showKey ? 'text' : 'password'}
                value={form.anthropic_api_key || ''}
                onChange={(e) => set('anthropic_api_key', e.target.value)}
                className="inp flex-1"
                placeholder="sk-ant-api03-..."
              />
              <button type="button" onClick={() => setShowKey(!showKey)} className="btn-g px-3">
                {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <p className="text-xs tm mt-1">
              Key varsa ajanlar Claude API'yi gerçekten çağırır — görevleri gerçekten yapar.
              Yoksa demo şablonlar kullanılır.
              Key'i <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>console.anthropic.com</a>'dan alabilirsin.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass p-6" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
        <h2 className="text-lg font-semibold tred mb-4 flex items-center gap-2"><Trash2 size={18} />Tehlikeli Alan</h2>
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div>
            <div className="font-medium tp">Tüm Verileri Sıfırla</div>
            <div className="text-sm tm">Ajanlar, görevler, leadler — demo veriye dön</div>
          </div>
          <button onClick={resetData} className="btn-d">Sıfırla</button>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={save} className="btn-p">
          <Save size={16} />{saved ? '✅ Kaydedildi!' : 'Değişiklikleri Kaydet'}
        </button>
      </div>
    </div>
  );
}
