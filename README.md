# soloAJANS — Jarvis Sesli Asistan İskeleti

SesliCB mimarisi: **Kulak → Beyin → Eller → Ağız**

## Kurulum

```bash
pip install -r requirements.txt
```

> `pyaudio` kurulumunda sorun yaşarsan:
> ```bash
> sudo apt-get install portaudio19-dev  # Linux
> brew install portaudio               # macOS
> ```

## Kullanım

```bash
GEMINI_API_KEY=xxx python jarvis.py
```

Mikrofona **"Jarvis, ..."** diye hitap et. Örnek:

| Komut | Sonuç |
|---|---|
| "Jarvis, saat kaç?" | Saati söyler |
| "Jarvis, bugün hangi gün?" | Tarihi söyler |
| "Jarvis, kuantum fiziğini açıkla" | Gemini'dan yanıt alır |
| "Jarvis, kapat" | Sistemi kapatır |

## Mimari

```
Kulak  (SpeechRecognition + Google STT)
  ↓
Beyin  (Gemini 1.5 Flash)
  ↓  ← Eller (yerel plugin'ler: saat, tarih, …)
Ağız   (pyttsx3 TTS)
```

## Yeni Plugin Eklemek

`Jarvis` sınıfına `plugin_xyz(self, komut) -> str | None` metodunu ekle,
ardından `plugin_sistem` içindeki listeye dahil et.
