import { useState } from 'react';
import { Bell, Moon, Sun, LogOut, Settings, X } from 'lucide-react';
import { useThemeStore, useNotifStore, useCompanyStore } from '../../stores/index';
import { useAuthStore } from '../../stores/auth';
import { getSupabase } from '../../lib/supabase';
import { clearAllStores } from '../../lib/syncDb';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const { theme, toggle } = useThemeStore();
  const { notifs, read, remove } = useNotifStore();
  const { user } = useAuthStore();
  const { company } = useCompanyStore();
  const unread = notifs.filter((n) => !n.read).length;
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const navigate = useNavigate();

  const avatarLetter = company.name ? company.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'A');

  const handleLogout = async () => {
    const sb = getSupabase();
    if (sb) await sb.auth.signOut();
    clearAllStores();
    setShowUser(false);
  };

  return (
    <div className="fixed top-0 right-0 left-60 h-14 bg-c border-b flex items-center justify-between px-6 z-40" style={{ borderColor: 'var(--bd)' }}>
      <div className="text-sm ts">Solo AI Company OS</div>

      <div className="flex items-center gap-3">
        <button onClick={toggle} className="p-2 rounded-lg ts hover:tp transition-colors" style={{ background: 'transparent' }}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="p-2 rounded-lg ts relative">
            <Bell size={18} />
            {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 glass shadow-lg z-50" style={{ maxHeight: '360px', overflowY: 'auto' }}>
              <div className="p-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--bd)' }}>
                <span className="font-semibold tp text-sm">Bildirimler</span>
                <button onClick={() => setShowNotif(false)}><X size={14} /></button>
              </div>
              {notifs.map((n) => (
                <div key={n.id} className={`p-3 border-b cursor-pointer ${n.read ? 'opacity-60' : ''}`} style={{ borderColor: 'var(--bd)' }} onClick={() => read(n.id)}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-medium tp text-sm">{n.title}</div>
                      <div className="ts text-xs mt-0.5">{n.message}</div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); remove(n.id); }}><X size={12} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowUser(!showUser)}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, var(--cyan), var(--purple))' }}
          >
            {avatarLetter}
          </button>
          {showUser && (
            <div className="absolute right-0 mt-2 w-56 glass shadow-lg z-50 rounded-xl overflow-hidden">
              <div className="p-3 border-b" style={{ borderColor: 'var(--bd)' }}>
                {user ? (
                  <>
                    <div className="font-semibold tp text-sm truncate">{company.name || 'Solo OS'}</div>
                    <div className="text-xs tm truncate mt-0.5">{user.email}</div>
                  </>
                ) : (
                  <div className="font-semibold tp text-sm">Yerel Mod</div>
                )}
              </div>
              <button
                onClick={() => { navigate('/settings'); setShowUser(false); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm ts hover:tp transition-colors text-left"
                style={{ background: 'transparent' }}
              >
                <Settings size={14} />Ayarlar
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm transition-colors text-left"
                  style={{ background: 'transparent', color: 'var(--red)' }}
                >
                  <LogOut size={14} />Çıkış Yap
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
