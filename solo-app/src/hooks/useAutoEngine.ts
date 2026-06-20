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
    `✅ İçerik hazırlandı\n\n📝 Blog yazısı: 2.340 kelime\n🎯 SEO skoru: 87/100\n🔑 Hedef keyword density: %2.3\n\n📌 Öne çıkan noktalar:\n• H1-H3 yapısı optimize\n• Meta description: 158 karakter\n• 12 internal link eklendi\n• 3 görsel ALT tag'leri yazıldı\n\n→ Yayına alınmaya hazır`,
    `✅ Kampanya analizi tamamlandı\n\n📊 Bu haftaki performans:\n• Email open rate: %34.2 (sektör ort: %21)\n• Click rate: %8.7 (+2.1% geçen haftaya göre)\n• Conversion: %3.4\n\n🎯 Öneriler:\n• Konu satırı A/B testi başlatılsın\n• Gönderim saati 10:00 → 14:00'a alınsın\n\n→ Sonraki kampanya brief'i hazırlandı`,
  ],
  support: [
    `✅ Destek talepleri işlendi\n\n📊 Günlük özet:\n• Toplam talep: 47\n• Çözülen: 43 (%91.5)\n• Ortalama yanıt süresi: 4.2 dk\n• CSAT skoru: 4.8/5\n\n→ Kritik talepler takipte`,
  ],
  design: [
    `✅ Tasarım tamamlandı\n\n🎨 Teslim edilen assets:\n• 1x Ana ekran (Desktop + Mobile)\n• 3x Komponent varyasyonu\n\n📐 Kontrol listesi:\n✓ Design system uyumu\n✓ WCAG 2.1 AA erişilebilirlik\n✓ Dark/Light mode\n\n→ Dev handoff hazır`,
  ],
  sales: [
    `✅ Lead qualification tamamlandı\n\n📊 Bu haftaki sonuçlar:\n• İncelenen lead: 38\n• Qualify edilen: 15 (%39.5)\n• Ortalama skor: 72/100\n\n🔥 Sıcak leadler için outreach başlatıldı`,
  ],
  analytics: [
    `✅ Analiz raporu hazırlandı\n\n📊 Bu haftaki KPI özeti:\n• Gelir: $124.500 (+8.2%)\n• MAU: 4.847 (+12.3%)\n• Churn rate: %2.1\n• LTV/CAC oranı: 4.2x\n\n→ Executive dashboard güncellendi`,
  ],
};

const GOD_OUTPUTS: Record<string, string[]> = {
  engineering: [
    `⚡ GOD MODE — MÜHENDİSLİK ULTRA PERFORMANS\n${'─'.repeat(44)}\n\n🧠 Claude Opus 4.8 ile tam otonom analiz tamamlandı\n⏱️ Toplam süre: 4.2 saniye\n\n📁 YAPILAN DEĞİŞİKLİKLER:\n• src/core/engine.ts — tamamen yeniden yazıldı (+847 satır)\n• src/api/v3/ — yeni versiyonlu API katmanı\n• src/cache/redis.ts — önbellek katmanı 10x hızlandırıldı\n• tests/ — 127 yeni test senaryosu eklendi\n• docker-compose.yml — multi-stage build optimize edildi\n• .github/workflows/ci.yml — paralel test pipeline\n\n📊 PERFORMANS METRİKLERİ:\n• API yanıt süresi: 240ms → 18ms (13.3x iyileşme)\n• Bellek kullanımı: 512MB → 128MB (%75 azaldı)\n• Throughput: 1.200 → 48.000 req/s\n• Error rate: %0.8 → %0.001\n\n🧪 TEST SONUÇLARI:\n• Unit tests: 247/247 ✓\n• Integration tests: 89/89 ✓\n• E2E tests: 34/34 ✓\n• Load test: 50.000 concurrent user ✓\n• Security scan: 0 kritik, 0 yüksek zafiyet ✓\n\n🔒 GÜVENLİK:\n• OWASP Top 10 taraması: temiz\n• Dependency audit: 0 CVE\n• Rate limiting: adaptive throttling aktif\n• JWT refresh rotation: implementasyon tamamlandı\n\n💡 EK İYİLEŞTİRMELER (proaktif):\n• Eski kullanılmayan 23 endpoint kaldırıldı\n• OpenAPI 3.1 spec otomatik üretildi\n• Database index optimizasyonu: 3 yavaş query 95% hızlandı\n• CDN cache stratejisi güncellendi\n\n→ Production deploy onayı bekleniyor`,

    `⚡ GOD MODE — MİMARİ YENİDEN TASARIM\n${'─'.repeat(38)}\n\n🧠 Tam özerk mimari analiz & implementasyon\n\n🏗️ YAPILAN DEĞİŞİKLİKLER:\n• Monolitik yapı → Microservices migration tamamlandı\n• Auth Service: ayrı servis olarak extract edildi\n• Payment Service: PCI-DSS uyumlu izolasyon\n• Notification Service: event-driven, Kafka entegrasyonu\n• API Gateway: rate limiting + circuit breaker eklendi\n\n📈 SONUÇLAR:\n• Deploy süresi: 45 dk → 3 dk\n• Hotfix deploy: sıfır downtime\n• Bağımsız scale: her servis ayrı ayrı ölçekleniyor\n• Fault isolation: bir servis çöktüğünde diğerleri etkilenmiyor\n\n📦 INFRASTRUCTURE AS CODE:\n• Terraform modules yazıldı (AWS EKS)\n• Helm charts hazırlandı\n• ArgoCD GitOps pipeline kuruldu\n• Datadog monitoring & alerting yapılandırıldı\n\n→ Staging ortamında 72 saat test hazır`,
  ],
  marketing: [
    `⚡ GOD MODE — PAZARLAMA ULTRA PERFORMANS\n${'─'.repeat(42)}\n\n🧠 Claude Opus 4.8 tam otonom pazarlama analizi\n\n📝 İÇERİK ÜRETİMİ:\n• 5x uzun form blog yazısı (3.500-5.000 kelime her biri)\n• 30x sosyal medya gönderisi (platform optimize)\n• 12x email sequence (nurture funnel)\n• 4x case study (müşteri başarı hikayesi)\n• 2x whitepaper (B2B lead generation)\n• 8x video script (YouTube & TikTok)\n• Landing page copy: 6 varyasyon (A/B test hazır)\n\n📊 SEO ANALİZİ:\n• 847 anahtar kelime analiz edildi\n• 156 yüksek potansiyel kelime seçildi\n• Rakip boşluk analizi: 23 fırsat tespit edildi\n• Content cluster stratejisi: 8 ana topic\n• Backlink fırsatı: 47 domain belirlendi\n\n📧 EMAIL PAZARLAMA:\n• Welcome sequence: 7 email (open rate hedef: %45)\n• Abandon cart: 3 email trigger\n• Re-engagement: 5 email kampanyası\n• Monthly newsletter: şablon + otomasyon\n• Segmentasyon: 12 farklı kullanıcı segmenti\n\n📱 SOSYAL MEDYA STRATEJİSİ:\n• LinkedIn: haftalık 5 gönderi + 2 makale\n• Twitter/X: günlük 3 tweet + thread\n• Instagram: 4 reels + 3 carousel\n• Hashtag araştırması: 89 relevant tag\n\n💰 TAHMİNİ ROI:\n• Organik trafik artışı: +340% (6 ay)\n• Lead generation: +180%\n• CAC azalması: -%35\n\n→ Tüm içerikler yayın takvimine eklendi`,
  ],
  support: [
    `⚡ GOD MODE — MÜŞTERİ DESTEK ULTRA PERFORMANS\n${'─'.repeat(46)}\n\n🧠 Claude Opus 4.8 tam özerk destek operasyonu\n\n📊 GÜNLÜK ÖZET — GOD MODE:\n• Toplam talep işlendi: 2.847\n• Çözüm oranı: %99.8 (sektör ort: %87)\n• Ortalama yanıt süresi: 28 saniye\n• CSAT skoru: 4.97/5 ⭐\n• NPS: 82 (world-class)\n\n🤖 OTOMASYON BAŞARILARI:\n• Self-service deflection: %67 (müşteri kendi çözdü)\n• Proaktif outreach: 234 müşteri sorun oluşmadan çözüldü\n• Churn riski tespit: 47 hesap kurtarıldı\n• Upsell fırsatı: 23 müşteri premium'a geçti\n\n📚 KNOWLEDGE BASE GÜNCELLEMELERİ:\n• 34 yeni makale oluşturuldu\n• 89 mevcut makale güncellendi\n• Video tutorial: 12 yeni\n• FAQ: 156 yeni soru-cevap\n\n🔍 ROOT CAUSE ANALİZİ:\n• Top 5 şikayet kategorisi belirlendi\n• Ürün ekibine 8 kritik feedback iletildi\n• 3 sistemik sorun tespit & çözüldü\n• Recurring issues: %91 azaldı\n\n→ Tüm açık talepler kapatıldı, sistem sağlıklı`,
  ],
  design: [
    `⚡ GOD MODE — TASARIM ULTRA PERFORMANS\n${'─'.repeat(38)}\n\n🧠 Claude Opus 4.8 + Vision — tam özerk tasarım sistemi\n\n🎨 TESLİM EDİLEN ASSETS:\n• Complete Design System v3.0 (1.200+ komponent)\n• Ana uygulama: 47 ekran (Desktop + Tablet + Mobile)\n• Dark Mode: tüm ekranlar ✓\n• Animation library: 89 micro-interaction\n• Icon set: 340 özel ikon\n• Illustration pack: 24 SVG illüstrasyon\n• Empty states: 34 farklı senaryo\n• Error states: 18 farklı durum\n• Loading states: skeleton + shimmer\n\n♿ ERİŞİLEBİLİRLİK:\n• WCAG 2.1 AAA uyumu (en yüksek seviye)\n• Color contrast ratio: 7:1+\n• Screen reader uyumu: test edildi\n• Keyboard navigation: %100\n• Cognitive load analizi: optimize edildi\n\n📐 DESIGN TOKENS:\n• Typography scale: 8 boyut, 3 ağırlık\n• Color system: 180 token\n• Spacing: 8px grid system\n• Border radius: 5 varyasyon\n• Shadow: 6 derinlik seviyesi\n\n📊 KULLANICI ARAŞTIRMASI:\n• 34 kullanıcı testi yapıldı\n• Task completion rate: %97\n• SUS skoru: 94/100\n• Heatmap analizi: 12 kritik iyileştirme\n\n→ Figma dosyaları & dev tokens aktarıldı`,
  ],
  sales: [
    `⚡ GOD MODE — SATIŞ ULTRA PERFORMANS\n${'─'.repeat(38)}\n\n🧠 Claude Opus 4.8 tam özerk satış motoru\n\n💰 HAFTALIK SONUÇLAR — GOD MODE:\n• Pipeline değeri: $2.847.000\n• Qualify edilen lead: 127/180 (%70.5 — sektör ort: %23)\n• Demo rezervasyon: 34 adet\n• Teklife giden: 28 adet\n• Kapatılan deal: 9 adet\n• Ortalama deal büyüklüğü: $67.400\n• Win rate: %38 (sektör ort: %22)\n\n📧 OUTREACH KAMPANYASI:\n• Kişiselleştirilmiş email: 847 adet\n• LinkedIn mesajı: 234 adet\n• Cold call script: 12 varyasyon hazırlandı\n• Video prospecting: 45 kısa video script\n• Response rate: %28 (sektör ort: %8)\n\n🔥 SICAK LEADLER (bu hafta):\n• Enterprise Corp — $450.000 potansiyel — demo Çarşamba\n• TechGiant Ltd — $280.000 — teklifte\n• ScaleUp Inc — $125.000 — imza aşamasında\n• GlobalVentures — $890.000 — RFP hazırlandı\n\n📊 CRM & PIPELINE:\n• Tüm aktiviteler otomatik loglandı\n• Forecast accuracy: %94\n• Pipeline hygiene skoru: 98/100\n• At-risk deals: 3 tespit, aksiyon alındı\n\n💡 REKABET ANALİZİ:\n• 5 rakip SWOT analizi güncellendi\n• Battlecard: 12 senaryo hazırlandı\n• Objection handling: 47 senaryo cevabı\n\n→ CRM güncellendi, takım briefingi hazır`,
  ],
  analytics: [
    `⚡ GOD MODE — VERİ ANALİTİK ULTRA PERFORMANS\n${'─'.repeat(46)}\n\n🧠 Claude Opus 4.8 — tam özerk veri zekası\n\n📊 KAPSAMLI ANALİZ RAPORU:\n\n💹 GELİR METRİKLERİ:\n• MRR: $487.230 (+23.4% MoM)\n• ARR: $5.846.760 (run rate)\n• Yeni MRR: $89.400\n• Expansion MRR: $34.200\n• Churn MRR: $12.300 (net churn: -%4.5)\n• Net Revenue Retention: %134 🚀\n\n👥 KULLANICI METRİKLERİ:\n• MAU: 48.234 (+18.7%)\n• DAU/MAU: %42 (sticky product)\n• Cohort retention D30: %67\n• Cohort retention D90: %51\n• LTV: $4.280 (ortalama)\n• CAC: $340 → LTV/CAC: 12.6x 🔥\n\n🎯 SEGMENT ANALİZİ:\n• Enterprise (%8 kullanıcı, %67 gelir) — büyüme odağı\n• Mid-market (%22, %28) — upsell fırsatı\n• SMB (%70, %5) — self-serve optimize\n\n🔮 TAHMİNİ MODEL (6 ay):\n• MRR tahmini: $1.2M (ML model, R²=0.97)\n• Churn riski: 234 hesap tespit, playbook aktive edildi\n• Büyüme fırsatı: 3 yeni segment, $2.3M ek ARR potansiyeli\n\n📈 A/B TEST SONUÇLARI:\n• Onboarding flow: Varyant B +34% activation\n• Pricing page: Varyant C +18% conversion\n• Email subject: Test D +28% open rate\n\n→ Executive dashboard canlı, Slack'e otomatik rapor gönderildi`,
  ],
};

function generateOutput(task: Task, isGodMode: boolean): string {
  const pool = isGodMode
    ? (GOD_OUTPUTS[task.department] || GOD_OUTPUTS.engineering)
    : (OUTPUTS[task.department] || OUTPUTS.engineering);
  const base = pool[Math.floor(Math.random() * pool.length)];
  const prefix = isGodMode
    ? `⚡ GOD MODE AKTİF — ${task.agent_name || 'Ajan'}\n📅 ${new Date().toLocaleString('tr-TR')}\n\n`
    : `🤖 ${task.agent_name || 'Ajan'} tarafından tamamlandı\n📅 ${new Date().toLocaleString('tr-TR')}\n\n`;
  return prefix + base;
}

export function useAutoEngine() {
  const tasks = useTaskStore((s) => s.tasks);
  const updateTask = useTaskStore((s) => s.updateTask);
  const addNotif = useNotifStore((s) => s.add);
  const agents = useAgentStore((s) => s.agents);
  const addXP = useAgentStore((s) => s.addXP);
  const tasksRef = useRef(tasks);
  const agentsRef = useRef(agents);
  tasksRef.current = tasks;
  agentsRef.current = agents;

  useEffect(() => {
    const interval = setInterval(() => {
      const current = tasksRef.current;
      const agentMap = Object.fromEntries(agentsRef.current.map((a) => [a.id, a]));

      // Pick up queued tasks → running (god mode: pick up to 3 at once)
      const queued = current.filter((t) => t.status === 'queued' && t.agent_id && !t.output);
      const pickCount = queued.some((t) => agentMap[t.agent_id!]?.godmode) ? 3 : 1;
      queued.slice(0, pickCount).forEach((t) => {
        updateTask(t.id, { status: 'running', progress: Math.floor(Math.random() * 15) + 5, updated_at: new Date().toISOString() });
        const isGod = agentMap[t.agent_id!]?.godmode;
        addNotif({ title: isGod ? '⚡ God Mode Görevi Başladı' : '⚙️ Görev Başladı', message: `${t.agent_name || 'Ajan'}: ${t.title}`, type: isGod ? 'success' : 'info' });
      });

      // Advance running tasks
      const running = current.filter((t) => t.status === 'running' && t.agent_id);
      running.forEach((t) => {
        const agent = agentMap[t.agent_id!];
        const isGodMode = !!agent?.godmode;
        const current_progress = t.progress || 0;
        // God mode: 2-3x faster progress
        const increment = isGodMode
          ? Math.floor(Math.random() * 40) + 25
          : Math.floor(Math.random() * 18) + 7;
        const newProgress = Math.min(100, current_progress + increment);

        if (newProgress >= 100) {
          const output = generateOutput(t, isGodMode);
          updateTask(t.id, {
            progress: 100, status: 'review', output,
            output_at: new Date().toISOString(), updated_at: new Date().toISOString(),
          });
          addNotif({
            title: isGodMode ? '⚡ God Mode Görev Tamamlandı' : '✅ Görev Tamamlandı',
            message: `${t.agent_name || 'Ajan'}: ${t.title} — inceleme bekliyor`,
            type: 'success',
          });
          // God mode agents earn 3x XP
          if (t.agent_id) addXP(t.agent_id, isGodMode ? (1500 + Math.floor(Math.random() * 1000)) : (250 + Math.floor(Math.random() * 250)));
        } else {
          updateTask(t.id, { progress: newProgress, updated_at: new Date().toISOString() });
        }
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [updateTask, addNotif, addXP]);
}
