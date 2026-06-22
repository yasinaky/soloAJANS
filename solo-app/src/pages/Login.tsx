import { useState } from 'react';
import { Eye, EyeOff, Rocket, Mail, Lock, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { getSupabase } from '../lib/supabase';

type Mode = 'login' | 'register' | 'reset';

export function Login() {
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const sb = getSupabase();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sb) {
      setError('Supabase yapılandırılmamış. Ayarlar → Veritabanı Bağlantısı\'ndan URL ve Key gir.');
      return;
    }
    setError(''); setInfo(''); setLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await sb.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
      } else if (mode === 'register') {
        const { error } = await sb.auth.signUp({ email, password: pass });
        if (error) throw error;
        setInfo('Hesap oluşturuldu! Email\'ini doğrula, sonra giriş yap.');
        setMode('login');
      } else {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/soloAJANS/`,
        });
        if (error) throw error;
        setInfo('Şifre sıfırlama linki email\'ine gönderildi.');
        setMode('login');
      }
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message || 'Bir hata oluştu';
      setError(
        msg.includes('Invalid login') ? 'Email veya şifre hatalı.' :
        msg.includes('Email not confirmed') ? 'Email adresini doğrula.' :
        msg.includes('already registered') ? 'Bu email zaten kayıtlı.' :
        msg.includes('Password should be') ? 'Şifre en az 6 karakter olmalı.' :
        msg
      );
    } finally {
      setLoading(false);
    }
  };

  const noSupabase = !sb;

  return (
    <div style={{ background: 'var(--bg-p)', minHeight: '100vh' }} className="flex items-center justify-center p-4">
      <div className="glass p-8 w-full" style={{ maxWidth: 420 }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <div className="text-2xl font-bold grad-text">Solo OS</div>
          <div className="ts text-sm mt-1">AI-Powered Company Operating System</div>
        </div>

        {/* Supabase uyarısı */}
        {noSupabase && (
          <div className="mb-5 p-3 rounded-xl text-sm flex items-start gap-2"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <AlertCircle size={15} style={{ color: 'var(--yellow)', flexShrink: 0, marginTop: 1 }} />
            <div className="ts">
              Supabase yapılandırılmamış. Giriş yapmak için önce <strong className="tp">Ayarlar → Veritabanı</strong> bölümüne git ve URL ile Anon Key'ini gir.
              <br /><span className="tm text-xs mt-1 block">Supabase hesabın yoksa supabase.com'dan ücretsiz oluştur.</span>
            </div>
          </div>
        )}

        {/* Tab: Login / Register */}
        {!noSupabase && (
          <div className="flex gap-2 mb-6">
            <button onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'login' ? 'btn-p' : 'btn-g'}`}>
              <LogIn size={14} />Giriş Yap
            </button>
            <button onClick={() => { setMode('register'); setError(''); }}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${mode === 'register' ? 'btn-p' : 'btn-g'}`}>
              <UserPlus size={14} />Kayıt Ol
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handle} className="space-y-4">
          <div className="form-field">
            <label className="form-label flex items-center gap-1.5"><Mail size={12} />Email</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="inp" placeholder="ornek@email.com"
              required disabled={loading || noSupabase}
            />
          </div>

          {mode !== 'reset' && (
            <div className="form-field">
              <label className="form-label flex items-center gap-1.5"><Lock size={12} />Şifre</label>
              <div className="flex gap-2">
                <input
                  type={showPass ? 'text' : 'password'} value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="inp flex-1" placeholder="••••••••"
                  required minLength={6} disabled={loading || noSupabase}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="btn-g px-3">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-sm flex items-center gap-2"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--red)' }}>
              <AlertCircle size={14} />{error}
            </div>
          )}

          {info && (
            <div className="p-3 rounded-lg text-sm"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: 'var(--green)' }}>
              ✅ {info}
            </div>
          )}

          {!noSupabase && (
            <button type="submit" disabled={loading} className="btn-p w-full justify-center py-3">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Giriş yapılıyor...' : mode === 'register' ? 'Kaydediliyor...' : 'Gönderiliyor...'}
                </span>
              ) : (
                <>
                  <Rocket size={16} />
                  {mode === 'login' ? 'Giriş Yap' : mode === 'register' ? 'Hesap Oluştur' : 'Şifre Sıfırla'}
                </>
              )}
            </button>
          )}

          {mode === 'login' && !noSupabase && (
            <button type="button" onClick={() => { setMode('reset'); setError(''); }}
              className="w-full text-center text-xs ts hover:tp transition-colors pt-1">
              Şifremi unuttum
            </button>
          )}

          {mode === 'reset' && (
            <button type="button" onClick={() => setMode('login')}
              className="w-full text-center text-xs ts hover:tp transition-colors pt-1">
              ← Giriş sayfasına dön
            </button>
          )}
        </form>
      </div>
    </div>
  );
}
