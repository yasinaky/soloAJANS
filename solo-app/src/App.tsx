import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Departments } from './pages/Departments';
import { Agents } from './pages/Agents';
import { Workflows } from './pages/Workflows';
import { Leads } from './pages/Leads';
import { KnowledgeHub } from './pages/KnowledgeHub';
import { Analytics } from './pages/Analytics';
import { DecisionLog } from './pages/DecisionLog';
import { AgentClub } from './pages/AgentClub';
import { Settings } from './pages/Settings';
import { useAutoEngine } from './hooks/useAutoEngine';
import { useCompanyStore, useAgentStore, useTaskStore, useLeadStore, useDecisionStore, useKnowledgeStore } from './stores/index';
import { useAuthStore } from './stores/auth';
import { initSupabase, getSupabase, isSupabaseReady } from './lib/supabase';
import { loadUserData, scheduleSync, clearAllStores } from './lib/syncDb';
import { Building2, Rocket, Sparkles, KeyRound } from 'lucide-react';
import { buildAutoAgents } from './pages/Agents';

/* ─── Şirket kurulum modali ─── */
function SetupModal() {
  const { company, updateCompany } = useCompanyStore();
  const addAgent = useAgentStore((s) => s.addAgent);
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [autoTeam, setAutoTeam] = useState(true);
  const [error, setError] = useState('');

  if (company.setup_complete) return null;

  const handleSave = () => {
    if (!name.trim()) { setError('Şirket adı zorunlu'); return; }
    if (autoTeam) {
      buildAutoAgents().forEach((a) => addAgent({ ...a, id: Math.random().toString(36).slice(2) }));
    }
    updateCompany({ name: name.trim(), tagline: tagline.trim(), anthropic_api_key: apiKey.trim(), setup_complete: true });
  };

  return (
    <div className="modal-ov" style={{ zIndex: 9999 }}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-2xl font-bold tp">Solo OS'e Hoş Geldin</h2>
          <p className="ts text-sm mt-2">AI destekli şirket işletim sistemin hazır.<br />Başlamak için şirket adını gir.</p>
        </div>

        <div className="space-y-4">
          <div className="form-field">
            <label className="form-label">Şirket Adı *</label>
            <input value={name} onChange={(e) => { setName(e.target.value); setError(''); }}
              className="inp" placeholder="örn: Nexus AI, CodeForge..." autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
            {error && <p className="text-xs tred mt-1">{error}</p>}
          </div>
          <div className="form-field">
            <label className="form-label">Slogan <span className="tm">(opsiyonel)</span></label>
            <input value={tagline} onChange={(e) => setTagline(e.target.value)}
              className="inp" placeholder="örn: AI ile büyüyoruz"
              onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
          </div>

          <div className="form-field">
            <label className="form-label flex items-center gap-1.5">
              <KeyRound size={12} />Anthropic API Key <span className="tm">(opsiyonel)</span>
            </label>
            <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)}
              className="inp" placeholder="sk-ant-api03-..." />
            <p className="text-xs tm mt-1">
              Girersen ajanlar gerçekten çalışır. Boş bırakırsan demo mod.{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={{ color: 'var(--cyan)' }}>Key al →</a>
            </p>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl"
            style={{ background: autoTeam ? 'rgba(0,212,255,0.08)' : 'var(--bg-s)', border: `1px solid ${autoTeam ? 'rgba(0,212,255,0.3)' : 'var(--bd)'}`, transition: 'all 0.2s' }}>
            <input type="checkbox" checked={autoTeam} onChange={(e) => setAutoTeam(e.target.checked)} className="w-4 h-4 mt-0.5 cursor-pointer flex-shrink-0" />
            <div>
              <div className="font-semibold tp text-sm flex items-center gap-1.5">
                <Sparkles size={14} style={{ color: 'var(--cyan)' }} />Başlangıç AI ekibini otomatik oluştur
              </div>
              <div className="text-xs tm mt-1">
                6 departman için hazır ajan: Geliştirici, İçerik Yazarı, Destek, Tasarımcı, Satış, Analist.
              </div>
            </div>
          </label>
        </div>

        <div className="mt-5 p-4 rounded-lg" style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
          <div className="font-semibold tp mb-2 text-sm flex items-center gap-2"><Building2 size={14} />Nasıl çalışır?</div>
          <div className="space-y-1 ts text-xs">
            <div>1️⃣ Şirketi kur → AI ekibin hazır</div>
            <div>2️⃣ Workflows'a git → Görev oluştur, ajana ata</div>
            <div>3️⃣ Sistem otomatik çalıştırır → çıktı üretir</div>
            <div>4️⃣ Çıktıyı incele, onayla → karar sentezlenir</div>
          </div>
        </div>

        <button onClick={handleSave} className="btn-p w-full justify-center mt-5">
          <Rocket size={16} />Şirketi Kur & Başla
        </button>
      </div>
    </div>
  );
}

/* ─── Loading ekranı ─── */
function LoadingScreen() {
  return (
    <div style={{ background: 'var(--bg-p)', minHeight: '100vh' }} className="flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🚀</div>
        <div className="grad-text text-xl font-bold mb-2">Solo OS</div>
        <div className="ts text-sm">Yükleniyor...</div>
      </div>
    </div>
  );
}

/* ─── Uygulama içi layout ─── */
function LayoutWrapper({ userId }: { userId?: string }) {
  useAutoEngine();

  // Supabase sync: her store değiştiğinde debounce ile kaydet
  const agents = useAgentStore((s) => s.agents);
  const tasks = useTaskStore((s) => s.tasks);
  const leads = useLeadStore((s) => s.leads);
  const decisions = useDecisionStore((s) => s.decisions);
  const proposed = useDecisionStore((s) => s.proposedDecisions);
  const knowledge = useKnowledgeStore((s) => s.items);
  const company = useCompanyStore((s) => s.company);

  useEffect(() => {
    if (userId) scheduleSync(userId);
  }, [agents, tasks, leads, decisions, proposed, knowledge, company, userId]);

  return (
    <>
      <SetupModal />
      <Layout><Outlet /></Layout>
    </>
  );
}

/* ─── Auth gate ─── */
function AuthGate() {
  const { company } = useCompanyStore();
  const { user, loading, setUser, setLoading } = useAuthStore();

  const sbReady = isSupabaseReady(company.supabase_url, company.supabase_anon_key);

  useEffect(() => {
    if (!sbReady) {
      setLoading(false);
      return;
    }

    initSupabase(company.supabase_url, company.supabase_anon_key);
    const sb = getSupabase();
    if (!sb) { setLoading(false); return; }

    // İlk oturum kontrolü
    sb.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) await loadUserData(session.user.id);
      setLoading(false);
    });

    // Auth değişikliklerini dinle
    const { data: { subscription } } = sb.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_IN' && session?.user) {
        const hadData = await loadUserData(session.user.id);
        if (!hadData) {
          // Yeni kullanıcı: setup modal göster
          useCompanyStore.setState((s) => ({ company: { ...s.company, setup_complete: false } }));
        }
      }
      if (event === 'SIGNED_OUT') clearAllStores();
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [company.supabase_url, company.supabase_anon_key]);

  if (loading) return <LoadingScreen />;

  // Supabase kapalı → direkt local mod
  if (!sbReady) return <LayoutWrapper />;

  // Supabase açık ama giriş yapılmamış
  if (!user) return <Login />;

  // Giriş yapılmış
  return <LayoutWrapper userId={user.id} />;
}

/* ─── Ana uygulama ─── */
export default function App() {
  return (
    <BrowserRouter basename="/soloAJANS">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AuthGate />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/departments/:id" element={<Departments />} />
          <Route path="/agents" element={<Agents />} />
          <Route path="/workflows" element={<Workflows />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/knowledge" element={<KnowledgeHub />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/decisions" element={<DecisionLog />} />
          <Route path="/club" element={<AgentClub />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
