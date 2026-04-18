import speech_recognition as sr
import pyttsx3
import google.generativeai as genai
import datetime


class Jarvis:
    def __init__(self, api_key: str):
        # AGIZ: Text-to-Speech motoru
        self.motor = pyttsx3.init()
        self.motor.setProperty('rate', 170)
        voices = self.motor.getProperty('voices')
        if voices:
            self.motor.setProperty('voice', voices[0].id)

        # BEYIN: Gemini LLM
        genai.configure(api_key=api_key)
        self.beyin = genai.GenerativeModel('gemini-1.5-flash')

        # KULAK: Speech-to-Text alıcısı
        self.kulak = sr.Recognizer()
        self.kulak.energy_threshold = 300
        self.kulak.dynamic_energy_threshold = True

        # Sistem durumu
        self.aktif = True

    # ------------------------------------------------------------------ #
    # AGIZ
    # ------------------------------------------------------------------ #
    def konus(self, metin: str) -> None:
        print(f"Jarvis: {metin}")
        self.motor.say(metin)
        self.motor.runAndWait()

    # ------------------------------------------------------------------ #
    # KULAK
    # ------------------------------------------------------------------ #
    def dinle(self) -> str:
        with sr.Microphone() as kaynak:
            print("[SİSTEM] Dinleniyor...")
            self.kulak.adjust_for_ambient_noise(kaynak, duration=0.5)
            try:
                ses = self.kulak.listen(kaynak, timeout=8, phrase_time_limit=10)
                komut = self.kulak.recognize_google(ses, language="tr-TR")
                print(f"Sen: {komut}")
                return komut.lower()
            except sr.WaitTimeoutError:
                return ""
            except sr.UnknownValueError:
                return ""
            except sr.RequestError:
                self.konus("Ağ bağlantımda bir sorun var efendim.")
                return ""

    # ------------------------------------------------------------------ #
    # ELLER: yerel eklentiler / plugin'ler
    # ------------------------------------------------------------------ #
    def plugin_saat(self, komut: str) -> str | None:
        if any(k in komut for k in ("saat kaç", "saat nedir", "kaç oldu")):
            zaman = datetime.datetime.now().strftime("%H:%M")
            return f"Saat şu an {zaman} efendim."
        return None

    def plugin_tarih(self, komut: str) -> str | None:
        if any(k in komut for k in ("bugün ne", "tarih ne", "hangi gün")):
            tarih = datetime.datetime.now().strftime("%d %B %Y, %A")
            return f"Bugün {tarih} efendim."
        return None

    def plugin_sistem(self, komut: str) -> str | None:
        for plugin in (self.plugin_saat, self.plugin_tarih):
            sonuc = plugin(komut)
            if sonuc:
                return sonuc
        return None

    # ------------------------------------------------------------------ #
    # BEYIN: karar + LLM fallback
    # ------------------------------------------------------------------ #
    def dusun_ve_uygula(self, komut: str) -> None:
        # 1. Önce yerel eklentileri dene
        yerel = self.plugin_sistem(komut)
        if yerel:
            self.konus(yerel)
            return

        # 2. Yerel karşılık yoksa Gemini'a gönder
        try:
            prompt = (
                "Sen Jarvis adında zeki, saygılı ve soğukkanlı bir yapay zeka asistanısın. "
                "Kullanıcıya çok kısa ve net Türkçe yanıt ver. "
                f"Kullanıcı komutu: {komut}"
            )
            cevap = self.beyin.generate_content(prompt)
            self.konus(cevap.text.strip())
        except Exception:
            self.konus("Beyin modülüme erişimde geçici bir arıza var efendim.")

    # ------------------------------------------------------------------ #
    # ANA DÖNGÜ
    # ------------------------------------------------------------------ #
    def baslat(self) -> None:
        self.konus("Sistemler çevrimiçi efendim. Emrinizi bekliyorum.")
        while self.aktif:
            komut = self.dinle()
            if not komut or "jarvis" not in komut:
                continue

            temiz = komut.replace("jarvis", "").strip()

            if any(k in temiz for k in ("kapat", "kapan", "bitir", "çık")):
                self.konus("Protokol sonlandırılıyor. İyi günler efendim.")
                self.aktif = False
                break

            if temiz:
                self.dusun_ve_uygula(temiz)


# ------------------------------------------------------------------ #
# GİRİŞ NOKTASI
# ------------------------------------------------------------------ #
if __name__ == "__main__":
    import os

    api_key = os.environ.get("GEMINI_API_KEY", "SENIN_API_ANAHTARIN_BURAYA")
    if api_key == "SENIN_API_ANAHTARIN_BURAYA":
        print("[UYARI] GEMINI_API_KEY ortam değişkeni ayarlanmamış.")
        print("  Kullanım: GEMINI_API_KEY=xxx python jarvis.py")

    jarvis = Jarvis(api_key=api_key)
    jarvis.baslat()
