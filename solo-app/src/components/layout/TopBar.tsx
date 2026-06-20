import { useState } from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { useThemeStore, useNotifStore } from '../../stores/index';
import { X } from 'lucide-react';

export function TopBar() {
  const { theme, toggle } = useThemeStore();
  const { notifs, read, remove } = useNotifStore();
  const unread = notifs.filter((n) => !n.read).length;
  const [showNotif, setShowNotif] = useState(false);

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

        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: 'linear-gradient(135deg, var(--cyan), var(--purple))' }}>
          A
        </div>
      </div>
    </div>
  );
}
