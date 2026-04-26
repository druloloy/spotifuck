import { useState, useEffect, useCallback } from 'preact/hooks';
import { api } from '@lib/api';
import { usePolling } from '@hooks/usePolling';
import { useFocusMode } from '@lib/focusContext';
import type { AppState } from '@lib/types';
import SearchBar from '@components/SearchBar';
import NowPlaying from '@components/NowPlaying';
import QueueList from '@components/QueueList';
import Lyrics from '@components/Lyrics';
import FocusMode from '@components/FocusMode';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { isFocusMode } = useFocusMode();

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

  if (isAuthenticated === null) {
    return (
      <main className="max-w-6xl mx-auto px-4 py-16 flex items-center justify-center h-64">
        <span className="font-mono text-xs animate-pulse tracking-widest" style={{ color: 'var(--bone-dim)' }}>
          // CONNECTING···
        </span>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono text-[9px] tracking-widest mb-8" style={{ color: 'var(--bone-dim)' }}>
          § 00 // ERROR
        </p>
        <h1 className="font-display text-5xl md:text-7xl leading-none mb-6" style={{ color: 'var(--bone)' }}>
          NOT<br />CONNECTED.
        </h1>
        <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--bone-dim)' }}>
          Host needs to connect their Spotify account before the queue opens.
        </p>
        <a
          href="/admin"
          className="inline-block px-6 py-3 font-mono text-xs font-bold tracking-widest shadow-brass btn-press transition-all"
          style={{ backgroundColor: 'var(--brass)', color: 'var(--ink)' }}
        >
          // GO TO ADMIN →
        </a>
      </main>
    );
  }

  if (isFocusMode) {
    return (
      <FocusMode
        state={state ?? null}
        loading={loading && !state}
        onTrackAdded={handleTrackAdded}
      />
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-6">

      {/* Desktop: 2-col grid */}
      <div className="hidden md:grid md:grid-cols-2 gap-px h-[calc(100vh-100px)]" style={{ backgroundColor: 'var(--border)' }}>

        {/* Left — Search + Lyrics */}
        <div className="flex flex-col gap-px overflow-hidden" style={{ backgroundColor: 'var(--ink)' }}>
          <div className="p-4" style={{ backgroundColor: 'var(--panel)', borderBottom: '1px solid var(--border)' }}>
            <p className="font-mono text-[9px] tracking-widest mb-3" style={{ color: 'var(--bone-dim)' }}>
              § 01 // SEARCH &amp; QUEUE
            </p>
            <SearchBar onTrackAdded={handleTrackAdded} />
            <p className="font-mono text-[9px] tracking-widest mt-2" style={{ color: 'var(--bone-dim)' }}>
              MAX 5 TRACKS · 10 MIN WINDOW
            </p>
          </div>
          <Lyrics track={state?.nowPlaying?.track ?? null} />
        </div>

        {/* Right — Now Playing + Queue */}
        <div className="flex flex-col gap-px overflow-hidden" style={{ backgroundColor: 'var(--ink)' }}>
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

      {/* Mobile: stacked */}
      <div className="md:hidden flex flex-col gap-4">
        <NowPlaying
          nowPlaying={state?.nowPlaying || null}
          loading={loading && !state}
        />

        <div style={{ backgroundColor: 'var(--panel)', border: '1.5px solid var(--border)' }} className="p-4">
          <p className="font-mono text-[9px] tracking-widest mb-3" style={{ color: 'var(--bone-dim)' }}>
            § 01 // SEARCH &amp; QUEUE
          </p>
          <SearchBar onTrackAdded={handleTrackAdded} />
        </div>

        <Lyrics track={state?.nowPlaying?.track ?? null} />

        <QueueList
          spotifyQueue={state?.spotifyQueue || []}
          localQueue={state?.localQueue || []}
          loading={loading && !state}
        />
      </div>
    </main>
  );
}
