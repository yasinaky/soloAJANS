# LOG

## 2026-04-26
Bugün projeyi tekrar inceledim.

**Anladığım:**
- Tek bir `pipeline.py` dosyası var. ICP → Use Case → ROI → Risk akışı sıralı çalışıyor.
- Pydantic şemaları ile structured output zorlanıyor; model markdown sarsa bile soyuluyor.
- Anthropic SDK çağrısı `auth_token` ile de çalışıyor (session token ile test edildi).
- 6 bug bulup kapattım: JSON komutu eksikliği, paylaşımlı retry sayacı, ölü Planner config, prompt büyümesi, ölü import, sahte test.
- 3 runtime sorunu çözüldü: auth, markdown stripping, max_tokens 2000→4096.

**Eksik kalan:**
- `Plan` ve `Task` şemaları tanımlı ama hiç kullanılmıyor — Planner adımı yok.
- `MODEL_CRITIC` env var var ama Critic pass çalışmıyor — kalite kontrol yok.
- Output deterministik değil: Run #1 → ~$2.4M ROI, Run #2 → ~$14M ROI. Aynı brief, çok farklı sonuç.
- Brief CLI argümanından alınmıyor, hardcoded.
- Sonuç dosyaya yazılmıyor, sadece stdout'a basılıyor.
- Test yok denecek kadar az: sadece schema construction testi.
- UI/web arayüzü yok.
- Cost tracking yok — token harcaması görünmüyor.
