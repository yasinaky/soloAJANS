# soloAJANS

## Bu proje ne
Bir brief alıp **AI Opportunity Map** üreten Python pipeline'ı. Anthropic Claude API'sini kullanıyor.

Akış: `brief` → ICP → Use Cases → ROI tahmini → Risk register → Markdown rapor.

## Ne çözüyor
Bir şirket için "AI ile nereyi otomatize edebiliriz, ne kadar kazanırız, ne risk alırız" sorusunun ilk taslağını dakikalar içinde çıkarıyor. Manuel danışmanlık çıktısının kaba bir prototipi.

Hedef kullanıcı: solo danışman / küçük ajans — müşteri toplantısı öncesi "starter map" çıkarmak için.

## Şu an durumu
- `pipeline.py` çalışıyor: brief verince ICP + 10-12 use case + ROI + risk listesi üretiyor (gerçek API ile test edildi).
- `Plan` ve `Task` şemaları tanımlı ama **planner/critic adımları henüz çalıştırılmıyor** — sadece executor sıralı koşuyor.
- Auth: `ANTHROPIC_AUTH_TOKEN` veya `ANTHROPIC_API_KEY` ile çalışıyor.
- Output **deterministik değil** — aynı brief iki run'da farklı use case sayısı ve farklı ROI üretiyor.
- UI yok, CLI yok, tek dosya.

## Çalıştırma
```bash
pip install anthropic python-dotenv pydantic
# .env dosyasında:
# ANTHROPIC_AUTH_TOKEN=...  (veya ANTHROPIC_API_KEY=...)
# MODEL_EXECUTOR=claude-haiku-4-5-20251001
python pipeline.py
```
