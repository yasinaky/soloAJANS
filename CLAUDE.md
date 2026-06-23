# soloAJANS — Claude Bağlamı

## Proje Ne
Brief alıp **AI Opportunity Map** üreten Python pipeline'ı.
Akış: `brief` → ICP → Use Cases → ROI → Risk Register → Markdown rapor.

Hedef kullanıcı: solo danışman / küçük ajans — müşteri için "AI nerede fırsat var" raporu üretir.

## Tek Dosya
`pipeline.py` — tüm mantık burada.

## Çalıştırma
```bash
pip install anthropic python-dotenv pydantic

# .env dosyası (git'e commit etme):
ANTHROPIC_AUTH_TOKEN=...   # veya ANTHROPIC_API_KEY=...
MODEL_EXECUTOR=claude-haiku-4-5-20251001

python pipeline.py
```

## Branch
`claude/run-workflow-metrics-gSQBJ` — tüm geliştirme buraya.

## Bilinen Eksikler (öncelik sırasıyla)
1. Brief hardcoded — CLI argümanı olmalı (`--brief`, `--client`, `--out`)
2. Çıktı sadece stdout — dosyaya yazmalı (markdown → PDF)
3. Müşteri adı raporda yok
4. Output deterministik değil — `temperature=0` eklenmeli
5. Planner ve Critic adımları tanımlı ama çalışmıyor

## Yapılanlar
- 6 bug fix: JSON schema injection, ayrı retry loop, ölü env var, prompt büyümesi, ölü import, sahte test
- 3 runtime fix: auth token, markdown stripping, max_tokens 2000→4096
- Güvenlik: .env git'e commit edilmemiş, geçmişte token yok

## Dokümanlar
- `README.md` — proje özeti ve çalıştırma
- `LOG.md` — günlük notlar, ne anlaşıldı, ne eksik
- `DECISIONS.md` — teknoloji kararları (bilinmeyenler "bilinmiyor" olarak işaretli)
- `NEXT.md` — tek sıradaki adım

## İş Bağlamı
Bu araç "keşif raporu" ürünü olarak satılabilir:
- Tarama raporu: €1,500-3,000 (pipeline + düzenleme)
- Workshop: €4,000-7,000 (rapor + 1 günlük oturum)
- Roadmap danışmanlığı: €10,000+

Hedef müşteri: AI yapması gerektiğini bilen ama nereden başlayacağını bilmeyen orta ölçekli firmalar.
