import { useState, useEffect } from 'preact/hooks';
import { api } from '@lib/api';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Check for URL params from callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('success') === 'true') {
      setMessage({ type: 'success', text: 'Successfully connected to Spotify!' });
      // Clean URL
      window.history.replaceState({}, '', '/admin');
    } else if (params.get('error')) {
      setMessage({ type: 'error', text: 'Failed to connect to Spotify. Please try again.' });
      window.history.replaceState({}, '', '/admin');
    }

    // Check auth status
    api.getAuthStatus()
      .then((status) => setIsAuthenticated(status.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleConnect = () => {
    window.location.href = '/api/auth/login';
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin - Spotify Setup</h1>

      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-900/50 text-green-300 border border-green-700'
              : 'bg-red-900/50 text-red-300 border border-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Spotify Connection</h2>

        {isAuthenticated === null ? (
          <div className="flex items-center gap-2 text-[var(--spotify-light-gray)]">
            <div className="w-4 h-4 border-2 border-[var(--spotify-green)] border-t-transparent rounded-full animate-spin" />
            Checking connection status...
          </div>
        ) : isAuthenticated ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[var(--spotify-green)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Connected to Spotify
            </div>
            <p className="text-[var(--spotify-light-gray)] text-sm">
              Your Spotify account is connected. Users can now search and queue songs.
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-[var(--spotify-green)] text-black font-semibold rounded-full hover:bg-[var(--spotify-green-hover)] transition-colors"
            >
              Go to Player
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[var(--spotify-light-gray)]">
              Connect your Spotify account to enable the office player. You'll need a Spotify Premium account.
            </p>
            <button
              onClick={handleConnect}
              className="flex items-center gap-2 px-6 py-3 bg-[var(--spotify-green)] text-black font-semibold rounded-full hover:bg-[var(--spotify-green-hover)] transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Connect with Spotify
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 bg-[var(--spotify-dark-gray)] rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Setup Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-[var(--spotify-light-gray)] text-sm">
          <li>Go to <a href="https://developer.spotify.com/dashboard" target="_blank" rel="noopener" className="text-[var(--spotify-green)] underline">Spotify Developer Dashboard</a></li>
          <li>Create a new app or use an existing one</li>
          <li>Add <code className="bg-[var(--spotify-medium-gray)] px-1 rounded">http://localhost:5000/api/auth/callback</code> to Redirect URIs</li>
          <li>Copy Client ID and Client Secret to your <code className="bg-[var(--spotify-medium-gray)] px-1 rounded">.env</code> file</li>
          <li>Restart the server and click "Connect with Spotify" above</li>
        </ol>
      </div>
    </main>
  );
}