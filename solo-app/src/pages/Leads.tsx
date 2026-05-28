import { Plus, TrendingUp, DollarSign, Target } from 'lucide-react';
import { useLeadStore } from '../stores/index';

const PIPELINE = ['new','contacted','qualified','proposal','won','lost'] as const;
const LABELS: Record<string,string> = { new:'🆕 Yeni', contacted:'📞 İletişim', qualified:'✓ Qualify', proposal:'💼 Teklif', won:'🎉 Kazanıldı', lost:'❌ Kaybedildi' };

export function Leads() {
  const leads = useLeadStore((s) => s.leads);
  const total = leads.reduce((s,l) => s+(l.deal_value||0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tp">Sales Pipeline</h1><p className="ts text-sm mt-1">{leads.length} lead takip ediliyor</p></div>
        <button className="btn-p"><Plus size={16}/>Lead Ekle</button>
      </div>

      <div className="glass p-6">
        <div className="grid grid-cols-3 gap-6">
          <div><div className="flex items-center gap-2 tm text-sm mb-2"><Target size={14}/>Toplam Lead</div><div className="text-3xl font-bold tp">{leads.length}</div></div>
          <div><div className="flex items-center gap-2 tm text-sm mb-2"><TrendingUp size={14}/>Pipeline Değeri</div><div className="text-3xl font-bold tcyan">${(total/1000).toFixed(0)}k</div></div>
          <div><div className="flex items-center gap-2 tm text-sm mb-2"><DollarSign size={14}/>Dönüşüm</div><div className="text-3xl font-bold tgreen">{((leads.filter(l=>l.status==='won').length/leads.length)*100).toFixed(0)}%</div></div>
        </div>
      </div>

      <div style={{ overflowX:'auto' }}>
        <div style={{ display:'flex', gap:'16px', paddingBottom:'16px', minWidth:'max-content' }}>
          {PIPELINE.map((status) => {
            const sl = leads.filter((l) => l.status === status);
            const sv = sl.reduce((s,l) => s+(l.deal_value||0), 0);
            return (
              <div key={status} className="kcol">
                <div className="p-4 border-b" style={{ borderColor:'var(--bd)', background:'var(--bg-s)' }}>
                  <h3 className="font-semibold tp text-sm">{LABELS[status]}</h3>
                  <div className="text-xs tm mt-1">${(sv/1000).toFixed(0)}k</div>
                  <span className="bdg bdg-c text-xs mt-1 inline-block">{sl.length}</span>
                </div>
                <div className="p-3 space-y-3">
                  {sl.map((l) => (
                    <div key={l.id} className="glass p-3">
                      <h4 className="font-medium tp text-sm">{l.company}</h4>
                      <p className="text-xs tm mt-1">{l.contact_name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs tm truncate">{l.email}</span>
                        <span className="bdg bdg-p ml-1 flex-shrink-0">{l.score}</span>
                      </div>
                      {l.deal_value && <div className="text-xs font-bold tgreen mt-2">${l.deal_value.toLocaleString()}</div>}
                      <div className="mt-2 pt-2 border-t text-xs tm" style={{ borderColor:'var(--bd)' }}>
                        <p className="line-clamp-2">{l.notes}</p>
                        <div className="mt-1 tcyan font-medium">{l.next_action}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
