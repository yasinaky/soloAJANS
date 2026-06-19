import { useEffect, useRef } from 'react';
import { useTaskStore, useAgentStore, useNotifStore } from '../stores/index';
import type { Task } from '../types';

const OUTPUTS: Record<string, string[]> = {
  engineering: [
    `✅ Implementasyon tamamlandı\n\n📁 Değiştirilen dosyalar:\n• src/api/auth.ts (+127 satır)\n• src/middleware/jwt.ts (+45 satır)\n• tests/auth.test.ts (+89 satır)\n\n📊 Test sonuçları: 24/24 ✓\n🔍 Lint: Temiz\n🔒 Güvenlik taraması: Sorun yok\n\n→ PR incelemeye hazır`,
    `✅ Feature geliştirme tamamlandı\n\n🛠️ Yapılan değişiklikler:\n• Yeni endpoint eklendi: /api/v2/users\n• Rate limiting güncellendi\n• Cache layer optimize edildi\n\n⚡ Performans: %34 iyileşme\n📦 Bundle size: 12kb azaldı\n\n→ Staging'e deploy edilmeye hazır`,
    `✅ Bug fix tamamlandı\n\n🐛 Root cause: Race condition in async handler\n🔧 Çözüm: Mutex lock implementasyonu\n\n• 3 test senaryosu eklendi\n• Edge case'ler kapsandı\n• Regression testi geçti ✓\n\n→ Production'a alınabilir`,
  ],
  marketing: [
    `✅ İçerik hazırlandı\n\n📝 Blog yazısı: 2.340 kelime\n🎯 SEO skoru: 87/100\n🔑 Hedef keyword density: %2.3\n\n📌 Öne çıkan noktalar:\n• H1-H3 yapısı optimize\n• Meta description: 158 karakter\n• 12 internal link eklendi\n• 3 görsel ALT tag'leri yazıldı\n\n→ Yayına alınmaya hazır: Salı 09:00`,
    `✅ Kampanya analizi tamamlandı\n\n📊 Bu haftaki performans:\n• Email open rate: %34.2 (sektör ort: %21)\n• Click rate: %8.7 (+2.1% geçen haftaya göre)\n• Conversion: %3.4\n\n🎯 Öneriler:\n• Konu satırı A/B testi başlatılsın\n• Gönderim saati 10:00 → 14:00'a alınsın\n\n→ Sonraki kampanya brief'i hazırlandı`,
    `✅ Sosyal medya içerikleri hazırlandı\n\n📅 Bu haftaki takvim (7 gönderi):\n• 2x LinkedIn (Pazartesi, Perşembe)\n• 3x Twitter/X (Salı, Çarşamba, Cuma)\n• 2x Instagram reel scripti\n\n🖼️ 4 görsel asset talep edildi\n#Hashtag araştırması tamamlandı\n\n→ Onay bekleniyor`,
  ],
  support: [
    `✅ Destek talepleri işlendi\n\n📊 Günlük özet:\n• Toplam talep: 47\n• Çözülen: 43 (%91.5)\n• Ortalama yanıt süresi: 4.2 dk\n• CSAT skoru: 4.8/5\n\n🔴 Açık kalan kritik (4):\n• #2847 - Ödeme hatası → Escalate edildi\n• #2851 - Veri senkron → Teknik ekipe iletildi\n\n→ Kritik talepler takipte`,
    `✅ Müşteri şikayeti çözüldü\n\n🔍 Analiz:\n• Problem: Login sonrası session kaybı\n• Etkilenen kullanıcı: 23 hesap\n• Root cause: Cookie domain mismatch\n\n🛠️ Yapılan:\n• Etkilenen kullanıcılara bilgilendirme emaili gönderildi\n• Geçici workaround kılavuzu hazırlandı\n• Teknik ticket açıldı: ENG-2847\n\n→ Kalıcı fix teknik ekipten bekleniyor`,
  ],
  design: [
    `✅ Tasarım tamamlandı\n\n🎨 Teslim edilen assets:\n• 1x Ana ekran (Desktop + Mobile)\n• 3x Komponent varyasyonu\n• 1x Animasyon spec (Figma)\n\n📐 Kontrol listesi:\n✓ Design system uyumu\n✓ WCAG 2.1 AA erişilebilirlik\n✓ Dark/Light mode\n✓ 375px / 768px / 1280px breakpoint\n\n→ Dev handoff: Figma linki güncel`,
    `✅ Brand asset'leri hazırlandı\n\n📦 Paket içeriği:\n• Logo (SVG, PNG, WebP)\n• Color palette (Figma variables)\n• Typography scale güncellendi\n• Icon set: 12 yeni ikon eklendi\n\n📋 Brand guideline v2.3 güncellendi\n\n→ Marketing ekibine teslim edildi`,
  ],
  sales: [
    `✅ Lead qualification tamamlandı\n\n📊 Bu haftaki sonuçlar:\n• İncelenen lead: 38\n• Qualify edilen: 15 (%39.5)\n• Ortalama skor: 72/100\n\n🔥 Sıcak leadler (score >80):\n• TechCorp Ltd — $45.000 potansiyel\n• InnoSoft — $28.000 potansiyel\n• DataPrime — $92.000 potansiyel\n\n→ Sıcak leadler için outreach başlatıldı`,
    `✅ Outreach kampanyası gönderildi\n\n📧 Gönderim özeti:\n• Kişiselleştirilmiş email: 24 adet\n• LinkedIn mesajı: 18 adet\n• Follow-up reminder set: 12 adet (3 gün sonra)\n\n📈 İlk saatteki yanıt:\n• 4 olumlu yanıt (%16.6)\n• 2 demo talebi\n\n→ Demo slotları takvime eklendi`,
  ],
  analytics: [
    `✅ Analiz raporu hazırlandı\n\n📊 Bu haftaki KPI özeti:\n• Gelir: $124.500 (+8.2% geçen haftaya göre)\n• MAU: 4.847 (+12.3%)\n• Churn rate: %2.1 (hedef: <%3)\n• LTV/CAC oranı: 4.2x\n\n🔍 Dikkat çeken trendler:\n• Pazar_X segmentinde %34 büyüme\n• Mobil kullanım masaüstünü geçti (%52)\n\n→ Executive dashboard güncellendi`,
    `✅ Kullanıcı segmentasyonu tamamlandı\n\n👥 Yeni segment tanımları:\n• Power Users (Günlük aktif, >10 işlem): 892 kullanıcı\n• Churn Riski (14 gün inaktif): 234 kullanıcı\n• Growth Potential (Upgrade candidate): 1.205 kullanıcı\n\n📧 Hedefli kampanya brief'leri hazırlandı\nRetention playbook güncellendi\n\n→ Pazarlama ekibine iletildi`,
  ],
};

function generateOutput(task: Task): string {
  const pool = OUTPUTS[task.department] || OUTPUTS.engineering;
  const base = pool[Math.floor(Math.random() * pool.length)];
  return `🤖 ${task.agent_name || 'Ajan'} tarafından tamamlandı\n📅 ${new Date().toLocaleString('tr-TR')}\n\n${base}`;
}

export function useAutoEngine() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const addNotif = useNotifStore((s) => s.add);
  const addXP = useAgentStore((s) => s.addXP);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  useEffect(() => {
    const interval = setInterval(() => {
      const current = tasksRef.current;

      // Pick up ONE queued task per tick → running
      const queued = current.filter((t) => t.status === 'queued' && t.agent_id && !t.output);
      if (queued.length > 0) {
        const t = queued[0];
        updateTask(t.id, { status: 'running', progress: Math.floor(Math.random() * 15) + 5, updated_at: new Date().toISOString() });
        addNotif({ title: '⚙️ Görev Başladı', message: `${t.agent_name || 'Ajan'}: ${t.title}`, type: 'info' });
      }

      // Advance running tasks
      const running = current.filter((t) => t.status === 'running' && t.agent_id);
      running.forEach((t) => {
        const current_progress = t.progress || 0;
        const increment = Math.floor(Math.random() * 18) + 7;
        const newProgress = Math.min(100, current_progress + increment);

        if (newProgress >= 100) {
          const output = generateOutput(t);
          updateTask(t.id, {
            progress: 100,
            status: 'review',
            output,
            output_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          addNotif({ title: '✅ Görev Tamamlandı', message: `${t.agent_name || 'Ajan'}: ${t.title} — inceleme bekliyor`, type: 'success' });
          if (t.agent_id) addXP(t.agent_id, 250 + Math.floor(Math.random() * 250));
        } else {
          updateTask(t.id, { progress: newProgress, updated_at: new Date().toISOString() });
        }
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [updateTask, addNotif, addXP]);
}
