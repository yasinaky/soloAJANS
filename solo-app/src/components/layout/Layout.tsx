import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { ApiKeyBanner } from './ApiKeyBanner';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div style={{ background: 'var(--bg-p)', minHeight: '100vh' }}>
      <Sidebar />
      <TopBar />
      <main style={{ marginLeft: '240px', marginTop: '56px', padding: '32px' }}>
        <div style={{ maxWidth: '1280px' }}>
          <ApiKeyBanner />
          {children}
        </div>
      </main>
    </div>
  );
}
