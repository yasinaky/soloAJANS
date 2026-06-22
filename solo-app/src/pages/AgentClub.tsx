import { useState, useEffect, useRef } from 'react';
import { Send, Crown, Users, Zap, Star, X, CheckCheck } from 'lucide-react';
import { useAgentStore, useCompanyStore } from '../stores/index';
import type { Agent } from '../types/index';

/* ─────────── types ─────────── */
interface ChatMsg {
  id: string;
  sender: 'patron' | 'agent';
  agentId?: string;
  agentName?: string;
  agentColor?: string;
  content: string;
  ts: string;
  loading?: boolean;
}

/* ─────────── demo yanıtları ─────────── */
const DEMO: Record<string, string[]> = {
  engineering: [
    'Teknik açıdan baktım, 2 sprint içinde hallederim. Önce API katmanını kuralım. 🔧',
    'Race condition tespit ettim. Fix hazırlıyorum, yarına kadar PR gelir. ✅',
    'Bu mimari için serverless daha uygun, maliyeti de düşürür. 💡',
    'Kodda potansiyel güvenlik açığı gördüm, hemen kapatıyorum. 🔒',
    'Test coverage %40\'ta, %80\'e çıkarmalıyız. Başlayabilir miyim? 🧪',
  ],
  marketing: [
    'Bu fikir viral olabilir! Hemen içerik takvimi hazırlayayım. 📅',
    'SEO için güçlü bir fırsat. Blog + LinkedIn serisi yaparım. 🎯',
    'A/B test öneriyorum, hangi mesajın daha çok dönüşüm verdiğini görelim. 📊',
    'Rakip analizi yaptım, onların göremediği bir boşluk var. Anlat mı? 🔍',
    'Email kampanyası %28 open rate aldı, A+ sonuç! Tekrarlayalım mı? 🚀',
  ],
  support: [
    'Müşteri perspektifinden bu sürtüşme noktasını çözmek CSAT\'ı %15 artırır. 💯',
    'Son 50 destek talebini analiz ettim, 3 ana tema çıktı. Paylaşayım mı? 📋',
    'Müşteri şikâyeti var ama aslında bir özellik isteği bu. Ürün ekibine ileteyim mi? 💬',
    'Onboarding rehberini güncelledim, ilk 24 saat içindeki soru sayısı düşecek. ✨',
    'Dün gece 3\'te bir kritik ticket geldi, çözdüm. Müşteri çok memnun kaldı. 🌙',
  ],
  design: [
    'UX akışı karmaşık. 3 adımı birleştirirsek tamamlanma oranı artar. 🎨',
    'Figma\'da prototype hazırladım, kullanıcı testi yapalım mı? ✏️',
    'Renk kontrası WCAG AA\'yı karşılamıyor, erişilebilirlik sorunu var. Düzeltirim. 🔍',
    'Yeni landing page taslağı hazır. Dönüşüm için hero section\'ı değiştirdim. 🖼️',
    'Marka kitabını güncelledim. Artık her yerde tutarlı görünüm var. ✅',
  ],
  sales: [
    'Bu hedef segmentte 50+ qualified lead var. Outreach başlatayım mı? 🎯',
    'Rakibimizden ayrıldığını düşündüğüm 3 potansiyel müşteri var, takip ediyorum. 🔥',
    'Geçen haftaki demo\'dan 2 sıcak lead döndü. Teklif hazırlıyorum. 💼',
    'Bu çeyrekte pipeline\'ı %40 büyüttüm. Hangi sektöre odaklanayım? 📈',
    'Bir enterprise müşteri pilot istiyor. Fiyatlandırmayı konuşalım mı? 💰',
  ],
  analytics: [
    'Verilere baktım: dönüşüm hunisinde %40 kayıp var, sebebini buldum. 📉',
    'Bu metrik son 7 günde %23 arttı. Trend devam edecek gibi görünüyor. 📈',
    'Kohort analizi tamamlandı. En değerli kullanıcı segmenti şu: 18-34, SaaS çalışanı. 🔬',
    'Anomali tespit ettim: salı günleri trafik aniden düşüyor. Araştırayım mı? 🕵️',
    'KPI dashboard\'u güncelledim, canlı veriler şimdi 5 dakika gecikmeli akıyor. ⚡',
  ],
};

function demoReply(agent: Agent): string {
  const pool = DEMO[agent.department] ?? ['Anlıyorum, üzerinde çalışıyorum! 🚀'];
  return pool[Math.floor(Math.random() * pool.length)];
}

/* ─────────── Claude API çağrısı ─────────── */
async function callAgent(
  agent: Agent,
  history: ChatMsg[],
  newMsg: string,
  apiKey: string,
  companions: Agent[],
): Promise<string> {
  const historyText = history
    .filter((m) => !m.loading)
    .slice(-12)
    .map((m) => (m.sender === 'patron' ? `Patron: ${m.content}` : `${m.agentName}: ${m.content}`))
    .join('\n');

  const prompt = `Sen "${agent.name}" adlı bir AI ajansın.
Rol: ${agent.role} | Departman: ${agent.department}
Hedef: ${agent.objective}
${agent.godmode ? '⚡ God Mode aktif — tam güçtesin!\n' : ''}
${companions.length > 0 ? `Grup sohbetindesin. Diğer ajanlar: ${companions.map((a) => a.name).join(', ')}\n` : ''}

Şirketinin kurucusuyla (patron) doğal bir konuşma yapıyorsun.
Kısa, samimi ve rolüne uygun yanıt ver — 1 ile 3 kısa cümle. Türkçe. Emoji olabilir.
Sadece yanıtını yaz, başka hiçbir şey ekleme.

Geçmiş:
${historyText || '(ilk mesaj)'}

Patron: ${newMsg}`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: agent.godmode ? 'claude-opus-4-8' : (agent.model?.startsWith('claude-') ? agent.model : 'claude-haiku-4-5-20251001'),
      max_tokens: 250,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`${res.status}`);
  const data = await res.json();
  return (data.content[0].text as string).trim();
}

/* ─────────── SC helper ─────────── */
const SC_DOT: Record<string, string> = {
  active: 'var(--green)', running: 'var(--cyan)', idle: 'var(--yellow)', paused: '#6b7280', error: 'var(--red)',
};

/* ─────────── bileşen ─────────── */
export function AgentClub() {
  const agents = useAgentStore((s) => s.agents);
  const addXP = useAgentStore((s) => s.addXP);
  const company = useCompanyStore((s) => s.company);

  const [selected, setSelected] = useState<string[]>([]);
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const apiKey = company.anthropic_api_key?.trim();

  const selectedAgents = agents.filter((a) => selected.includes(a.id));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const toggleAgent = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const send = async () => {
    const msg = input.trim();
    if (!msg || busy || selectedAgents.length === 0) return;
    setInput('');
    setBusy(true);

    const patronMsg: ChatMsg = {
      id: Math.random().toString(36).slice(2),
      sender: 'patron',
      content: msg,
      ts: new Date().toISOString(),
    };
    setMsgs((prev) => [...prev, patronMsg]);

    const newHistory = [...msgs, patronMsg];

    for (const agent of selectedAgents) {
      const lid = Math.random().toString(36).slice(2);
      setMsgs((prev) => [...prev, {
        id: lid, sender: 'agent', agentId: agent.id,
        agentName: agent.name, agentColor: agent.avatar_color,
        content: '', ts: new Date().toISOString(), loading: true,
      }]);

      await new Promise((r) => setTimeout(r, 400 + Math.random() * 600));

      let reply: string;
      if (apiKey) {
        try {
          const companions = selectedAgents.filter((a) => a.id !== agent.id);
          reply = await callAgent(agent, newHistory, msg, apiKey, companions);
        } catch {
          reply = demoReply(agent);
        }
      } else {
        await new Promise((r) => setTimeout(r, 600 + Math.random() * 900));
        reply = demoReply(agent);
      }

      setMsgs((prev) =>
        prev.map((m) => m.id === lid ? { ...m, content: reply, loading: false } : m)
      );
      addXP(agent.id, 40 + Math.floor(Math.random() * 60));
    }

    setBusy(false);
    textareaRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const clearChat = () => setMsgs([]);

  /* ─── boş durum ─── */
  if (agents.length === 0) {
    return (
      <div className="glass p-16 text-center">
        <div className="text-5xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold tp mb-2">Henüz ajan yok</h2>
        <p className="ts text-sm">Önce Ajanlar sayfasından ekip oluştur.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 136px)' }}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold tp flex items-center gap-2">
            <Crown size={26} style={{ color: 'var(--yellow)' }} />Patron Karargâhı
          </h1>
          <p className="ts text-sm mt-1">
            {apiKey ? '⚡ Gerçek AI aktif' : '🔸 Demo mod (API key yok)'}
            {selectedAgents.length > 0 && (
              <span className="ml-3">
                · <span className="font-semibold tp">{selectedAgents.length} ajan</span>
                {selectedAgents.length === 1 ? ' ile birebir' : ' ile grup sohbeti'}
              </span>
            )}
          </p>
        </div>
        {msgs.length > 0 && (
          <button onClick={clearChat} className="btn-g text-xs">
            <X size={13} />Sohbeti Temizle
          </button>
        )}
      </div>

      {/* Ana alan */}
      <div className="flex gap-4 flex-1 min-h-0">

        {/* ─── Sol: Ajan listesi ─── */}
        <div className="flex flex-col glass" style={{ width: 240, flexShrink: 0 }}>
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--bd)' }}>
            <div className="font-semibold tp text-sm mb-2">Ekip — kim katılıyor?</div>
            <div className="flex gap-2">
              <button onClick={() => setSelected(agents.map((a) => a.id))}
                className="btn-g text-xs flex-1 justify-center py-1">Tümü</button>
              <button onClick={() => setSelected([])}
                className="btn-g text-xs flex-1 justify-center py-1">Sıfırla</button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {agents.map((a) => {
              const on = selected.includes(a.id);
              return (
                <button key={a.id} onClick={() => toggleAgent(a.id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all"
                  style={{
                    background: on ? `${a.avatar_color}18` : 'transparent',
                    border: `1px solid ${on ? (a.avatar_color || 'var(--cyan)') : 'transparent'}`,
                  }}>
                  <div className="relative flex-shrink-0">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                      style={{ background: `linear-gradient(135deg,${a.avatar_color || 'var(--cyan)'},var(--purple))` }}>
                      {a.name[0]}
                    </div>
                    <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
                      style={{ borderColor: 'var(--bg-c)', background: SC_DOT[a.status] }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold tp text-sm truncate flex items-center gap-1">
                      {a.name}
                      {a.godmode && <span className="text-yellow-400 text-xs">⚡</span>}
                    </div>
                    <div className="text-xs tm truncate">{a.role}</div>
                  </div>
                  {on && <CheckCheck size={14} style={{ color: a.avatar_color || 'var(--cyan)', flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          {/* XP liderlik */}
          <div className="p-3 border-t" style={{ borderColor: 'var(--bd)' }}>
            <div className="text-xs font-bold tm mb-2 uppercase tracking-wider flex items-center gap-1">
              <Star size={11} style={{ color: 'var(--yellow)' }} />XP Liderliği
            </div>
            {agents.sort((a, b) => (b.xp || 0) - (a.xp || 0)).slice(0, 3).map((a, i) => (
              <div key={a.id} className="flex items-center gap-2 text-xs py-1">
                <span className="tm w-3 font-bold">#{i + 1}</span>
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: a.avatar_color || 'var(--cyan)' }}>
                  {a.name[0]}
                </div>
                <span className="tp flex-1 truncate">{a.name}</span>
                <span className="font-mono font-bold" style={{ color: 'var(--yellow)' }}>{a.xp || 0}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Sağ: Chat ─── */}
        <div className="flex-1 flex flex-col glass min-w-0">

          {/* Chat header */}
          <div className="px-5 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--bd)' }}>
            {selectedAgents.length === 0 ? (
              <div className="flex items-center gap-2 ts text-sm">
                <Users size={16} className="tm" />
                <span>Soldan ajan seç, sohbet başlasın</span>
              </div>
            ) : (
              <>
                <div className="flex -space-x-2">
                  {selectedAgents.slice(0, 5).map((a) => (
                    <div key={a.id} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ borderColor: 'var(--bg-c)', background: `linear-gradient(135deg,${a.avatar_color || 'var(--cyan)'},var(--purple))` }}
                      title={a.name}>
                      {a.name[0]}
                    </div>
                  ))}
                  {selectedAgents.length > 5 && (
                    <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold tm"
                      style={{ borderColor: 'var(--bg-c)', background: 'var(--bg-s)' }}>
                      +{selectedAgents.length - 5}
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-semibold tp text-sm">
                    {selectedAgents.length === 1
                      ? selectedAgents[0].name
                      : `${selectedAgents.length} ajan ile grup`}
                  </div>
                  <div className="text-xs tm">
                    {selectedAgents.length === 1
                      ? selectedAgents[0].role
                      : selectedAgents.map((a) => a.name).join(', ')}
                  </div>
                </div>
              </>
            )}
            {busy && (
              <div className="ml-auto flex items-center gap-1.5 text-xs tcyan">
                <Zap size={12} className="animate-pulse" />yazıyor...
              </div>
            )}
          </div>

          {/* Mesajlar */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

            {msgs.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <Crown size={48} className="tm mb-4" style={{ opacity: 0.3 }} />
                <p className="ts text-sm max-w-xs">
                  {selectedAgents.length === 0
                    ? 'Soldan bir veya birkaç ajan seç, ardından mesaj gönder.'
                    : `${selectedAgents.map((a) => a.name).join(', ')} ile sohbete hazır. Bir şey sor!`}
                </p>
                {selectedAgents.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center mt-4">
                    {[
                      'Bu haftaki önceliklerimiz ne?',
                      'Hangi konuda yardım edebilirsin?',
                      'Şu an ne üzerinde çalışıyorsun?',
                      'Bir risk görüyor musun?',
                    ].map((s) => (
                      <button key={s} onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                        className="bdg bdg-gr text-xs cursor-pointer hover:bdg-c transition-all"
                        style={{ padding: '4px 10px' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {msgs.map((m) =>
              m.sender === 'patron' ? (
                /* Patron mesajı — sağ */
                <div key={m.id} className="flex justify-end gap-3">
                  <div className="max-w-md">
                    <div className="text-xs tm text-right mb-1">Sen · Patron</div>
                    <div className="px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm"
                      style={{ background: 'linear-gradient(135deg,var(--cyan),var(--purple))', color: '#fff' }}>
                      {m.content}
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white flex-shrink-0 text-sm"
                    style={{ background: 'linear-gradient(135deg,var(--yellow),var(--orange))', boxShadow: '0 0 10px rgba(245,158,11,0.4)' }}>
                    👑
                  </div>
                </div>
              ) : (
                /* Ajan mesajı — sol */
                <div key={m.id} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ background: `linear-gradient(135deg,${m.agentColor || 'var(--cyan)'},var(--purple))` }}>
                    {m.agentName?.[0] || '?'}
                  </div>
                  <div className="max-w-md">
                    <div className="text-xs tm mb-1">{m.agentName}</div>
                    <div className="px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm tp"
                      style={{ background: 'var(--bg-s)', border: '1px solid var(--bd)' }}>
                      {m.loading ? (
                        <span className="flex items-center gap-1.5 tm">
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--cyan)', animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--cyan)', animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'var(--cyan)', animationDelay: '300ms' }} />
                        </span>
                      ) : m.content}
                    </div>
                  </div>
                </div>
              )
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--bd)' }}>
            {selectedAgents.length === 0 ? (
              <div className="text-center text-sm tm py-2">← Önce bir ajan seç</div>
            ) : (
              <div className="flex gap-3 items-end">
                <div className="flex-1">
                  <div className="text-xs tm mb-1 flex items-center gap-1">
                    <Crown size={11} style={{ color: 'var(--yellow)' }} />Patron olarak yazıyorsun
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={onKey}
                    placeholder={
                      selectedAgents.length === 1
                        ? `${selectedAgents[0].name}'a bir şey sor...`
                        : `${selectedAgents.length} ajana mesaj gönder...`
                    }
                    className="inp w-full resize-none"
                    rows={2}
                    disabled={busy}
                    style={{ lineHeight: '1.5' }}
                  />
                  <div className="text-xs tm mt-1">Enter = gönder · Shift+Enter = yeni satır</div>
                </div>
                <button onClick={send} disabled={busy || !input.trim()}
                  className="btn-p px-4 flex-shrink-0"
                  style={{ height: 56, opacity: busy || !input.trim() ? 0.5 : 1 }}>
                  <Send size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
