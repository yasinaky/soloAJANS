# DECISIONS

## Python
**Neden:** Bilinmiyor — proje öyle başlatılmış. Anthropic SDK Python'da en olgun, Pydantic ile şema validation kolay; ama bu post-hoc rasyonalizasyon. Orijinal seçim sebebi belge yok.

## Anthropic Claude (OpenAI / başka değil)
**Neden:** Bilinmiyor. Branch adı `soloAJANS` ve session ortamı Claude Code; muhtemelen sahibinin Claude'a aşinalığı sebep, ama yazılı gerekçe yok.

## `claude-haiku-4-5-20251001` model
**Neden:** Bu run'da hız/maliyet için ben seçtim. Asıl tercih env var ile dışarıdan veriliyor — kod model-agnostic. Sahibinin tercihi bilinmiyor.

## Pydantic v2
**Neden:** Structured LLM output için en yaygın yol. Ama tool use / function calling yerine prompt'a JSON schema enjekte edilmiş — bu seçim **şüpheli**, neden tool use kullanılmadığı bilinmiyor.

## `dotenv` ile env loading
**Neden:** Standart pratik. Belirgin bir özel sebep yok.

## Sıralı pipeline (paralel değil)
**Neden:** ICP → Use Case → ROI / Risk zinciri veri bağımlılığı içeriyor (sonraki adım öncekine ihtiyaç duyuyor). ROI ve Risk paralel olabilir ama paralel çalışmıyor — **sebebi bilinmiyor**, muhtemelen henüz optimize edilmemiş.

## `Plan`/`Task` şemalarının var olması ama kullanılmaması
**Neden:** Bilinmiyor. Planner-driven mimariye geçiş niyeti var gibi görünüyor ama yarım kalmış. Sahibinin kararı belgelenmemiş.

## Critic adımının olmaması
**Neden:** Bilinmiyor. `MODEL_CRITIC` env var olarak duruyor ama hiç kullanılmıyor. Kalite/hallucination kontrolü yok.

## Markdown output (JSON değil)
**Neden:** İnsan okuyacağı için markdown render edilmiş. Bilinçli seçim olabilir, ama programatik tüketim imkânı kapatılmış.

## Retry stratejisi: 3 transient + 3 validation
**Neden:** Bilinmiyor. Sayılar makul ama bir gerekçe belgesi yok.

---

**Genel not:** Bu projede mimari kararların **çoğu belgesiz**. Pipeline çalışıyor ama "neden böyle" sorusunun cevabı yazılı değil. Bu da bir veri: sahibi muhtemelen hızlı prototipleme modunda gitmiş, kararlaştırmadan kodlamış.
