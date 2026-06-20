import { useState } from 'react';
import { Link } from 'react-router-dom';
import { KeyRound, X, ArrowRight } from 'lucide-react';
import { useCompanyStore } from '../../stores/index';

export function ApiKeyBanner() {
  const company = useCompanyStore((s) => s.company);
  const [dismissed, setDismissed] = useState(false);

  // only show once setup is complete, when there's no key, and not dismissed this session
  if (!company.setup_complete || company.anthropic_api_key?.trim() || dismissed) return null;

  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 mb-6 rounded-xl text-sm"
      style={{
        background: 'rgba(245,158,11,0.10)',
        border: '1px solid rgba(245,158,11,0.30)',
        color: 'var(--tp)',
      }}
    >
      <KeyRound size={16} style={{ color: 'var(--yellow)', flexShrink: 0 }} />
      <span className="flex-1">
        <strong>Demo modundasın.</strong> Ajanların gerçekten çalışması için Anthropic API key ekle.
      </span>
      <Link to="/settings" className="btn-p text-xs py-1.5 px-3 flex items-center gap-1" style={{ flexShrink: 0 }}>
        API Key Ekle <ArrowRight size={12} />
      </Link>
      <button onClick={() => setDismissed(true)} className="btn-g p-1.5" style={{ flexShrink: 0 }} aria-label="Kapat">
        <X size={14} />
      </button>
    </div>
  );
}
