import { getSupabase } from './supabase';
import {
  useAgentStore, useTaskStore, useLeadStore,
  useDecisionStore, useKnowledgeStore, useCompanyStore, useNotifStore,
} from '../stores/index';

let _timer: ReturnType<typeof setTimeout> | null = null;

// ─── Supabase'den veriyi yükle ───
export async function loadUserData(userId: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;

  const { data, error } = await sb
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) { console.error('loadUserData:', error.message); return false; }
  if (!data) return false; // ilk kez — boş başlar

  const s = data as Record<string, unknown>;

  if (Array.isArray(s.agents))   useAgentStore.setState({ agents: s.agents as never[] });
  if (Array.isArray(s.tasks))    useTaskStore.setState({ tasks: s.tasks as never[] });
  if (Array.isArray(s.leads))    useLeadStore.setState({ leads: s.leads as never[] });
  if (s.decisions && (s.decisions as Record<string, unknown>).decisions)
    useDecisionStore.setState(s.decisions as never);
  if (Array.isArray(s.knowledge)) useKnowledgeStore.setState({ items: s.knowledge as never[] });
  if (s.company && typeof s.company === 'object') {
    const co = s.company as Record<string, unknown>;
    // API key ve supabase bilgilerini localStorage'dan koru
    const local = useCompanyStore.getState().company;
    useCompanyStore.setState({
      company: {
        ...local,
        ...co,
        anthropic_api_key: local.anthropic_api_key || (co.anthropic_api_key as string) || '',
        supabase_url: local.supabase_url || (co.supabase_url as string) || '',
        supabase_anon_key: local.supabase_anon_key || (co.supabase_anon_key as string) || '',
      },
    });
  }
  return true;
}

// ─── Veriyi Supabase'e kaydet (debounced) ───
export function scheduleSync(userId: string) {
  if (_timer) clearTimeout(_timer);
  _timer = setTimeout(() => syncNow(userId), 2000);
}

export async function syncNow(userId: string) {
  const sb = getSupabase();
  if (!sb || !userId) return;

  const { company } = useCompanyStore.getState();
  // hassas alanları çıkar
  const { anthropic_api_key: _ak, supabase_url: _su, supabase_anon_key: _sk, ...safeCompany } = company;
  void _ak; void _su; void _sk;

  const payload = {
    user_id: userId,
    company: safeCompany,
    agents: useAgentStore.getState().agents,
    tasks: useTaskStore.getState().tasks,
    leads: useLeadStore.getState().leads,
    decisions: {
      decisions: useDecisionStore.getState().decisions,
      proposedDecisions: useDecisionStore.getState().proposedDecisions,
    },
    knowledge: useKnowledgeStore.getState().items,
    updated_at: new Date().toISOString(),
  };

  const { error } = await sb.from('user_data').upsert(payload, { onConflict: 'user_id' });
  if (error) console.error('syncNow:', error.message);
}

// ─── Tüm store'ları sıfırla (çıkış) ───
export function clearAllStores() {
  useAgentStore.setState({ agents: [] });
  useTaskStore.setState({ tasks: [] });
  useLeadStore.setState({ leads: [] });
  useDecisionStore.setState({ decisions: [], proposedDecisions: [] });
  useKnowledgeStore.setState({ items: [] });
  useNotifStore.setState({ notifs: [] });
  useCompanyStore.setState((s) => ({
    company: {
      ...s.company,
      setup_complete: false,
    },
  }));
}
