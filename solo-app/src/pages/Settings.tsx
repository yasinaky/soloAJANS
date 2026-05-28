import { Moon, Sun, Bell, Shield, Zap } from 'lucide-react';
import { useThemeStore } from '../stores/index';

export function Settings() {
  const { theme, toggle } = useThemeStore();

  return (
    <div className="space-y-6">
      <div><h1 className="text-3xl font-bold tp">Ayarlar</h1><p className="ts text-sm mt-1">Solo OS deneyiminizi özelleştirin</p></div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4">Şirket Profili</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium tp mb-2">Şirket Adı</label><input type="text" defaultValue="My AI Company" className="inp"/></div>
          <div><label className="block text-sm font-medium tp mb-2">Misyon</label><textarea defaultValue="Building the future with AI agents" className="ta"/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium tp mb-2">Aylık Gelir Hedefi</label><input type="number" defaultValue="100000" className="inp"/></div>
            <div><label className="block text-sm font-medium tp mb-2">Ekip Boyutu Hedefi</label><input type="number" defaultValue="50" className="inp"/></div>
          </div>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2">{theme==='dark'?<Moon size={18}/>:<Sun size={18}/>}Görünüm</h2>
        <div className="flex items-center justify-between p-4 rounded-lg" style={{ background:'var(--bg-s)' }}>
          <div><div className="font-medium tp">Tema Modu</div><div className="text-sm tm">Şu an: {theme==='dark'?'Karanlık':'Açık'} Mod</div></div>
          <button onClick={toggle} className="btn-p">{theme==='dark'?<Sun size={15}/>:<Moon size={15}/>}Tema Değiştir</button>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Bell size={18}/>Bildirimler</h2>
        <div className="space-y-3">
          {[['Görev Tamamlama','Ajanlar görev tamamladığında bildirim'],['Kritik Uyarılar','Sistem sorunları için acil bildirimler'],['Günlük Özet','Tüm aktivitelerin günlük özeti'],['Lead Güncellemeleri','Yeni qualify edilmiş leadlerde bildirim']].map(([k,v],i)=>(
            <div key={k} className="flex items-center justify-between p-3 rounded" style={{ background:'var(--bg-s)' }}>
              <div><div className="font-medium tp text-sm">{k}</div><div className="text-xs tm">{v}</div></div>
              <input type="checkbox" defaultChecked={i<2} className="w-4 h-4 cursor-pointer"/>
            </div>
          ))}
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Shield size={18}/>Güvenlik & AI Sınırları</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium tp mb-2">Ajan Özerklik Sınırı</label><select className="sel w-full"><option>Düşük (Tüm işlemler onay gerektirir)</option><option selected>Orta (Sınırlar içinde özerk)</option><option>Yüksek (Tam özerk + guardrails)</option></select></div>
          <div><label className="block text-sm font-medium tp mb-2">Günlük Harcama Limiti ($)</label><input type="number" defaultValue="5000" className="inp"/></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" defaultChecked/><span className="text-sm font-medium tp">Kritik kararlar için insan onayı zorunlu</span></label>
        </div>
      </div>

      <div className="glass p-6">
        <h2 className="text-lg font-semibold tp mb-4 flex items-center gap-2"><Zap size={18}/>AI Model Tercihleri</h2>
        <div className="space-y-4">
          <div><label className="block text-sm font-medium tp mb-2">Varsayılan Model</label><select className="sel w-full"><option>GPT-4 Turbo (En yetenekli)</option><option>Claude 3 Opus (Dengeli)</option><option>GPT-3.5 Turbo (Hızlı & ucuz)</option></select></div>
          <div><label className="block text-sm font-medium tp mb-2">Context Penceresi</label><select className="sel w-full"><option>4K (Standart)</option><option>8K (Genişletilmiş)</option><option selected>32K (Ultra)</option></select></div>
        </div>
      </div>

      <div className="flex gap-3"><button className="btn-p">Kaydet</button><button className="btn-g">Varsayılana Sıfırla</button></div>
    </div>
  );
}
