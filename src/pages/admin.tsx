import { useState, useEffect } from 'preact/hooks';
import { api } from '@lib/api';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [redirectUri, setRedirectUri] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setMessage({ type: 'success', text: 'Connected to Spotify.' });
      window.history.replaceState({}, '', '/admin');
    } else if (params.get('error')) {
      setMessage({ type: 'error', text: 'Auth failed. Try again.' });
      window.history.replaceState({}, '', '/admin');
    }

    api.getAuthStatus()
      .then((status) => {
        setIsAuthenticated(status.authenticated);
        setRedirectUri(status.redirectUri || '');
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleConnect = () => { window.location.href = '/api/auth/login'; };

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <p className="font-mono text-[9px] tracking-widest mb-6" style={{ color: 'var(--bone-dim)' }}>
        § 00 // ADMIN PANEL
      </p>

      <h1 className="font-display text-4xl md:text-5xl leading-none mb-8" style={{ color: 'var(--bone)' }}>
        SPOTIFY<br />SETUP.
      </h1>

      {message && (
        <div
          className="p-4 mb-6 font-mono text-xs tracking-widest"
          style={{
            border: `1.5px solid ${message.type === 'success' ? 'var(--brass)' : 'var(--heat)'}`,
            color: message.type === 'success' ? 'var(--brass)' : 'var(--heat)',
            backgroundColor: 'var(--panel)',
          }}
        >
          // {message.text.toUpperCase()}
        </div>
      )}

      {/* Connection status */}
      <div
        className="p-5 mb-4"
        style={{ backgroundColor: 'var(--panel)', border: '1.5px solid var(--border)' }}
      >
        <p className="font-mono text-[9px] tracking-widest mb-4" style={{ color: 'var(--bone-dim)' }}>
          § 01 // CONNECTION STATUS
        </p>

        {isAuthenticated === null ? (
          <p className="font-mono text-xs animate-pulse tracking-widest" style={{ color: 'var(--bone-dim)' }}>
            // CHECKING···
          </p>
        ) : isAuthenticated ? (
          <div className="space-y-4">
            <p className="font-mono text-xs tracking-widest" style={{ color: 'var(--brass)' }}>
              // CONNECTED
            </p>
            <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
              Spotify account linked. Users can search and queue songs.
            </p>
            <a
              href="/"
              className="inline-block px-5 py-2.5 font-mono text-xs font-bold tracking-widest shadow-brass-sm btn-press transition-all"
              style={{ backgroundColor: 'var(--brass)', color: 'var(--ink)' }}
            >
              // OPEN PLAYER →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--bone-dim)' }}>
              Connect a Spotify Premium account to open the queue.
            </p>
            <button
              onClick={handleConnect}
              className="px-5 py-2.5 font-mono text-xs font-bold tracking-widest shadow-brass-sm btn-press transition-all"
              style={{ backgroundColor: 'var(--brass)', color: 'var(--ink)' }}
            >
              // CONNECT WITH SPOTIFY →
            </button>
          </div>
        )}
      </div>

      {/* Setup instructions */}
      <div
        className="p-5"
        style={{ backgroundColor: 'var(--panel)', border: '1.5px solid var(--border)' }}
      >
        <p className="font-mono text-[9px] tracking-widest mb-4" style={{ color: 'var(--bone-dim)' }}>
          § 02 // SETUP INSTRUCTIONS
        </p>

        <ol className="space-y-3">
          {[
            <>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener" className="underline" style={{ color: 'var(--brass)' }}>developer.spotify.com/dashboard</a></>,
            <>Create an app or use an existing one</>,
            <>Add <code className="font-mono text-xs px-1.5 py-0.5" style={{ backgroundColor: 'var(--ink)', color: 'var(--brass)', border: '1px solid var(--border)' }}>{redirectUri || 'http://localhost:5000/api/auth/callback'}</code> to Redirect URIs</>,
            <>Copy Client ID and Secret to your <code className="font-mono text-xs px-1 py-0.5" style={{ backgroundColor: 'var(--ink)', color: 'var(--bone)', border: '1px solid var(--border)' }}>.env</code></>,
            <>Restart the server and click Connect above</>,
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm" style={{ color: 'var(--bone-dim)' }}>
              <span className="font-mono text-[10px] pt-0.5 flex-shrink-0" style={{ color: 'var(--brass)' }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
