import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let _client: SupabaseClient | null = null;
let _url = '';

export function initSupabase(url: string, key: string) {
  if (!url || !key) { _client = null; return; }
  if (_client && _url === url) return;
  _url = url;
  _client = createClient(url, key, {
    auth: { persistSession: true, storageKey: 'solo-auth' },
  });
}

export function getSupabase(): SupabaseClient | null {
  return _client;
}

export function isSupabaseReady(url: string, key: string): boolean {
  return !!(url?.startsWith('https://') && key?.length > 20);
}
