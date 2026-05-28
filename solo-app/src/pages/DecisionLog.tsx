import { useState } from 'react';
import { Plus, User, Calendar, BarChart3 } from 'lucide-react';
import { useDecisionStore } from '../stores/index';

const IC: Record<string,string> = { low:'bdg-y', medium:'bdg-o', high:'bdg-r', critical:'bdg-r' };
const SC: Record<string,string> = { active:'bdg-g', pending:'bdg-y', implemented:'bdg-c', cancelled:'bdg-gr' };
const II: Record<string,string> = { low:'📍', medium:'⚠️', high:'🔴', critical:'🚨' };

export function DecisionLog() {
  const decisions = useDecisionStore((s) => s.decisions);
  const [impact, setImpact] = useState('');

  const filtered = decisions.filter((d) => !impact || d.impact === impact);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tp">Stratejik Kararlar</h1><p className="ts text-sm mt-1">Kritik kararların kaydı ve sonuçları</p></div>
        <button className="btn-p"><Plus size={16}/>Karar Kaydet</button>
      </div>

      <div className="glass p-4 flex flex-wrap gap-2">
        <button onClick={()=>setImpact('')} className={`px-3 py-1.5 rounded text-sm font-medium ${!impact?'btn-p':'bdg bdg-gr'}`}>Tümü</button>
        {(['low','medium','high','critical'] as const).map((v)=>(
          <button key={v} onClick={()=>setImpact(v===impact?'':v)} className={`px-3 py-1.5 rounded text-sm font-medium flex items-center gap-1 ${impact===v?'btn-p':'bdg bdg-gr'}`}>{II[v]} {v}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((d)=>(
          <div key={d.id} className="glass p-6">
            <div className="grid grid-cols-4 gap-6">
              <div className="col-span-2">
                <h3 className="text-lg font-bold tp mb-2">{d.title}</h3>
                <p className="ts text-sm mb-4">{d.context}</p>
                <div className="space-y-3">
                  <div><div className="text-xs font-semibold tm mb-1">Karar</div><p className="text-sm tp">{d.decision}</p></div>
                  <div><div className="text-xs font-semibold tm mb-1">Gerekçe</div><p className="text-sm ts">{d.rationale}</p></div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tm mb-3">Metadata</div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm"><User size={13} className="tm"/><span className="tp">{d.owner}</span></div>
                  <div className="flex items-center gap-2 text-sm"><Calendar size={13} className="tm"/><span className="tp">{new Date(d.date).toLocaleDateString()}</span></div>
                  <div className="flex items-center gap-2 text-sm"><BarChart3 size={13} className="tm"/><span className={`bdg ${IC[d.impact]}`}>{d.impact}</span></div>
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold tm mb-2">Durum</div>
                <span className={`bdg ${SC[d.status]}`}>{d.status}</span>
                {d.outcome && <div className="mt-4"><div className="text-xs font-semibold tm mb-1">Sonuç</div><p className="text-sm ts">{d.outcome}</p></div>}
                {d.tags.length>0 && <div className="mt-4"><div className="flex flex-wrap gap-1">{d.tags.map((t)=><span key={t} className="bdg bdg-p text-xs">{t}</span>)}</div></div>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
