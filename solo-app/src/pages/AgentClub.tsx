import { useState, useEffect } from 'react';
import { Users, Zap, Smile } from 'lucide-react';
import { useAgentStore } from '../stores/index';
import { CLUB_ROOMS } from '../data/mockData';

export function AgentClub() {
  const agents = useAgentStore((s) => s.agents);
  const addXP = useAgentStore((s) => s.addXP);
  const [room, setRoom] = useState('lounge');
  const [selected, setSelected] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      const a = agents[Math.floor(Math.random() * agents.length)];
      const lines = [`${a.name}: Harika bir iş çıkardım! 🎉`, `${a.name}: Herkese merhaba! 👋`, `${a.name}: Bugün çok üretkenim 💪`, `${a.name}: Birlikte çalışalım ✨`, `${a.name}: Nasılsınız? 😊`];
      setMsgs((p) => [...p.slice(-12), lines[Math.floor(Math.random() * lines.length)]]);
      addXP(a.id, Math.floor(Math.random() * 50 + 10));
    }, 2000);
    return () => clearInterval(interval);
  }, [running, agents, addXP]);

  const handleIntro = () => {
    if (selected.length !== 2) return;
    const [id1, id2] = selected;
    const a1 = agents.find((a) => a.id === id1);
    const a2 = agents.find((a) => a.id === id2);
    if (a1 && a2) {
      setMsgs((p) => [...p, `${a1.name}: Merhaba ${a2.name}! Tanışmak harika! 👋`, `${a2.name}: Seninle çalışmayı sabırsızlıkla bekliyorum ${a1.name}! 🤝`]);
      addXP(id1, 30); addXP(id2, 30);
      setSelected([]);
    }
  };

  const cr = CLUB_ROOMS.find((r) => r.id === room);

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tp">🍷 Ajan Kulübü</h1><p className="ts text-sm mt-1">Ajanların sosyal etkileşim ve işbirliği ortamı</p></div>

      <div className="grid grid-cols-5 gap-4">
        {CLUB_ROOMS.map((r) => (
          <button key={r.id} onClick={() => setRoom(r.id)} className={`glass p-4 text-center cursor-pointer transition-all ${room===r.id ? 'border-cyan' : ''}`} style={room===r.id ? { borderColor:'var(--cyan)', background:'var(--cyan-d)' } : {}}>
            <div className="text-3xl mb-2">{r.icon}</div>
            <h3 className="font-semibold tp text-sm">{r.name}</h3>
            <p className="text-xs tm mt-1">{r.description}</p>
            <div className="text-xs tcyan font-bold mt-2">{r.max_agents} max</div>
          </button>
        ))}
      </div>

      <div className="glass p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-bold tp">{cr?.icon} {cr?.name}</h2>
          <button onClick={() => setRunning(!running)} className={running ? 'btn-d' : 'btn-p'}>{running ? 'Sansı Kapat' : 'Sansı Aç & Başlat'}</button>
        </div>

        <div className="rounded-lg p-4 mb-4 border" style={{ height:'220px', overflowY:'auto', background:'var(--bg-s)', borderColor:'var(--bd)' }}>
          {msgs.length === 0
            ? <div className="h-full flex items-center justify-center tm text-sm">Henüz mesaj yok. Sansı başlatın!</div>
            : msgs.map((m, i) => <div key={i} className="text-sm tp mb-2 p-2 rounded" style={{ background:'var(--bg-c)' }}>{m}</div>)
          }
        </div>
        {running && <div className="text-center text-xs tcyan">⟳ Seans devam ediyor...</div>}

        <div className="grid grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-lg border" style={{ background:'var(--bg-s)', borderColor:'var(--bd)' }}>
            <h3 className="font-semibold tp mb-3 flex items-center gap-2"><Users size={15}/>Ajan Tanıştır</h3>
            <p className="text-xs tm mb-3">2 ajan seçin ve tanıştırın</p>
            <div className="grid grid-cols-2 gap-1.5 mb-3 max-h-40 overflow-y-auto">
              {agents.map((a) => (
                <button key={a.id} onClick={() => setSelected((p) => p.includes(a.id) ? p.filter(id=>id!==a.id) : [...p,a.id].slice(-2))}
                  className="p-2 rounded text-xs font-medium text-left transition-all"
                  style={{ background: selected.includes(a.id) ? 'var(--cyan)' : 'var(--bg-c)', color: selected.includes(a.id) ? 'white' : 'var(--ts)', border:'1px solid var(--bd)' }}>
                  {a.name}
                </button>
              ))}
            </div>
            <button onClick={handleIntro} disabled={selected.length!==2} className="btn-p w-full justify-center" style={{ opacity: selected.length!==2 ? 0.5 : 1 }}>
              {selected.length===2 ? `${agents.find(a=>a.id===selected[0])?.name} & ${agents.find(a=>a.id===selected[1])?.name}` : 'Tanıştır'}
            </button>
          </div>

          <div className="p-4 rounded-lg border" style={{ background:'var(--bg-s)', borderColor:'var(--bd)' }}>
            <h3 className="font-semibold tp mb-3 flex items-center gap-2"><Smile size={15}/>Hızlı Reaksiyonlar</h3>
            <div className="flex flex-wrap gap-2">
              {['🎉','💪','✨','🔥','🚀','👏','💡','🎯'].map((e) => (
                <button key={e} onClick={() => setMsgs((p) => [...p, `Kulüp: ${e}`])} className="text-2xl p-2 rounded hover:bg-c transition-all">{e}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {agents.sort((a,b)=>(b.xp||0)-(a.xp||0)).slice(0,3).map((a,i) => (
          <div key={a.id} className="sc">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-bold tcyan">#{i+1}</span>
              <span className="bdg bdg-p">Seviye {a.level}</span>
            </div>
            <h3 className="font-bold tp">{a.name}</h3>
            <p className="text-xs tm mt-1 mb-3">{a.department}</p>
            <div className="flex items-center gap-2"><Zap size={13} style={{color:'var(--yellow)'}}/><span className="font-bold tyellow">{a.xp} XP</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}
