import { useState, useEffect, useCallback } from 'preact/hooks';
import { api } from '@lib/api';
import { usePolling } from '@hooks/usePolling';
import type { AppState } from '@lib/types';
import SearchBar from '@components/SearchBar';
import NowPlaying from '@components/NowPlaying';
import QueueList from '@components/QueueList';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Check auth status on mount
  useEffect(() => {
    api.getAuthStatus()
      .then((status) => setIsAuthenticated(status.authenticated))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const fetchState = useCallback(() => api.getState(), [refreshKey]);

  const { data: state, loading, refetch } = usePolling<AppState>({
    fetcher: fetchState,
    interval: 5000,
    enabled: isAuthenticated === true,
  });

  const handleTrackAdded = () => {
    setRefreshKey((k) => k + 1);
    refetch();
  };

  // Loading auth status
  if (isAuthenticated === null) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[var(--spotify-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Spotify Not Connected</h1>
          <p className="text-[var(--spotify-light-gray)] mb-6">
            The host needs to connect their Spotify account before you can queue songs.
          </p>
          <a
            href="/admin"
            className="inline-block px-6 py-3 bg-[var(--spotify-green)] text-black font-semibold rounded-full hover:bg-[var(--spotify-green-hover)] transition-colors"
          >
            Go to Admin
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        {/* Left Column - Search */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Search & Queue</h2>
          <SearchBar onTrackAdded={handleTrackAdded} />
          <p className="text-[var(--spotify-light-gray)] text-sm">
            Search for songs to add to the queue. Rate limit: 5 songs per 10 minutes.
          </p>
        </div>

        {/* Right Column - Now Playing & Queue */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <NowPlaying
            nowPlaying={state?.nowPlaying || null}
            loading={loading && !state}
          />
          <QueueList
            spotifyQueue={state?.spotifyQueue || []}
            localQueue={state?.localQueue || []}
            loading={loading && !state}
          />
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-4">
        <NowPlaying
          nowPlaying={state?.nowPlaying || null}
          loading={loading && !state}
        />

        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Search & Queue</h2>
          <SearchBar onTrackAdded={handleTrackAdded} />
        </div>

        <QueueList
          spotifyQueue={state?.spotifyQueue || []}
          localQueue={state?.localQueue || []}
          loading={loading && !state}
        />
      </div>
    </main>
  );
}
