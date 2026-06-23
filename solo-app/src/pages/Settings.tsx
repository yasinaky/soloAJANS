import { useState } from 'react';
import { Moon, Sun, Bell, Shield, Zap, Building2, Trash2, Save, Eye, EyeOff, KeyRound, Database, CheckCircle2, Circle } from 'lucide-react';
import { useThemeStore, useCompanyStore, useAgentStore, useTaskStore, useLeadStore, useDecisionStore, useKnowledgeStore } from '../stores/index';
import { isSupabaseReady, isPublishableKey } from '../lib/supabase';

export function Settings() {
  const { theme, toggle } = useThemeStore();
  const { company, updateCompany } = useCompanyStore();
  const [form, setForm] = useState({ ...company });
  const [saved, setSaved] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [showSbKey, setShowSbKey] = useState(false);
  const sbReady = isSupabaseReady(form.supabase_url, form.supabase_anon_key);
  const sbKeyWrong = isPublishableKey(form.supabase_anon_key || '');

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

      {/* Veritabanı Bağlantısı */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-1 flex items-center gap-2"><Database size={18} />Veritabanı Bağlantısı</h2>
        <p className="text-xs tm mb-4">
          Supabase bağlarsan veriler hesabına kaydolur, cihazlar arası senkronize kalır ve çoklu kullanıcı desteği aktif olur.
          <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)', marginLeft: 4 }}>supabase.com'da ücretsiz hesap aç →</a>
        </p>

        {/* Bağlantı durumu */}
        <div className="mb-4 p-3 rounded-lg flex items-center gap-2 text-sm"
          style={{ background: sbReady ? 'rgba(16,185,129,0.08)' : 'var(--bg-s)', border: `1px solid ${sbReady ? 'rgba(16,185,129,0.3)' : 'var(--bd)'}` }}>
          {sbReady
            ? <><CheckCircle2 size={15} style={{ color: 'var(--green)', flexShrink: 0 }} /><span className="tp">Supabase bağlı — veriler bulutta senkronize ediliyor</span></>
            : <><Circle size={15} style={{ color: 'var(--yellow)', flexShrink: 0 }} /><span className="ts">Bağlı değil — veriler yalnızca bu cihazda saklanıyor (yerel mod)</span></>
          }
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Supabase Project URL</label>
            <input
              value={form.supabase_url || ''}
              onChange={(e) => set('supabase_url', e.target.value)}
              className="inp"
              placeholder="https://xxxxxxxxxxxx.supabase.co"
            />
          </div>
          <div className="form-field">
            <label className="form-label">Supabase Anon Key</label>
            <div className="flex gap-2">
              <input
                type={showSbKey ? 'text' : 'password'}
                value={form.supabase_anon_key || ''}
                onChange={(e) => set('supabase_anon_key', e.target.value)}
                className="inp flex-1"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              />
              <button type="button" onClick={() => setShowSbKey(!showSbKey)} className="btn-g px-3">
                {showSbKey ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {sbKeyWrong && (
              <div className="mt-2 p-2.5 rounded-lg text-xs flex items-start gap-2"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--red)' }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <div>
                  <strong>Yanlış key formatı</strong> — "Publishable key" (<code>sb_publishable_...</code>) bu sürümde çalışmıyor.<br />
                  Supabase Dashboard → Settings → API → <strong>"Legacy API Keys"</strong> bölümündeki <strong>anon</strong> key'i kullan (<code>eyJhbGci...</code> ile başlar).
                </div>
              </div>
            )}
          </div>

          {/* Kurulum adımları */}
          <div className="p-4 rounded-lg space-y-2 text-xs" style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
            <div className="font-semibold tp mb-2">Kurulum adımları:</div>
            <div className="ts">1️⃣ <a href="https://supabase.com" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>supabase.com</a>'a git → Yeni proje oluştur</div>
            <div className="ts">2️⃣ Sol menü → <strong className="tp">SQL Editor</strong> → Aşağıdaki SQL'i çalıştır:</div>
            <div className="font-mono text-xs p-3 rounded overflow-x-auto" style={{ background: 'rgba(0,0,0,0.3)', color: 'var(--cyan)', whiteSpace: 'pre' }}>{`CREATE TABLE IF NOT EXISTS user_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE NOT NULL UNIQUE,
  company jsonb NOT NULL DEFAULT '{}',
  agents jsonb NOT NULL DEFAULT '[]',
  tasks jsonb NOT NULL DEFAULT '[]',
  leads jsonb NOT NULL DEFAULT '[]',
  decisions jsonb NOT NULL DEFAULT '{}',
  knowledge jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own data" ON user_data
  FOR ALL USING (auth.uid() = user_id);`}</div>
            <div className="ts">3️⃣ <strong className="tp">Settings → API</strong> → Project URL ve anon key'i kopyala → buraya yapıştır</div>
            <div className="ts">4️⃣ "Değişiklikleri Kaydet" → Sayfayı yenile → Kayıt Ol / Giriş Yap</div>
          </div>
        </div>
      </div>

      {/* Versiyon Bilgisi */}
      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2">
          <span style={{ fontSize: 18 }}>📦</span>Uygulama Versiyonu
        </h2>
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
          <div>
            <div className="font-mono font-bold tp text-xl">v{__APP_VERSION__}</div>
            <div className="text-xs tm mt-1">Solo AI Company OS — Tek kurucu için AI şirket işletim sistemi</div>
          </div>
          <div className="text-right text-xs ts space-y-0.5">
            <div>✅ Hedeften görev üretme</div>
            <div>✅ AI karar sentezi</div>
            <div>✅ God Mode</div>
            <div>✅ Gerçek Claude API</div>
          </div>
        </div>
        <div className="mt-3 space-y-1">
          {[
            { v: 'v1.1.0', d: 'Bugün', n: 'Guardrail: görev-çıktı uyum doğrulaması, demo mod bloklandı, şablon çıktılar kaldırıldı, Supabase girişi' },
            { v: 'v1.0.0', d: '22 Haz', n: 'AI karar sentezi, ek talep akışı, çıktı genişletme' },
            { v: 'v0.9.0', d: '22 Haz', n: 'Hedeften görev üret, blocked yeniden kuyruğa al, otomatik ajan atama' },
            { v: 'v0.8.0', d: '21 Haz', n: 'God Mode, gerçek Claude API entegrasyonu, Knowledge Hub, Kararlar' },
            { v: 'v0.7.0', d: '20 Haz', n: 'Sıfır mock data, setup modal, auto ekip oluşturma' },
          ].map((c) => (
            <div key={c.v} className="flex items-start gap-3 text-xs py-2 border-b last:border-0" style={{ borderColor: 'var(--bd)' }}>
              <span className="font-mono font-bold tcyan flex-shrink-0 w-14">{c.v}</span>
              <span className="tm flex-shrink-0 w-12">{c.d}</span>
              <span className="ts">{c.n}</span>
            </div>
          ))}
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
