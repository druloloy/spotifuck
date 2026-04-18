import { useState, useEffect } from 'preact/hooks';
import { useDebounce } from '@hooks/useDebounce';
import { api } from '@lib/api';
import type { Track } from '@lib/types';
import SearchResults from './SearchResults';

const RATE_LIMIT = 5;

interface RateLimitState {
  remaining: number;
  resetAt: number | null; // ms timestamp
}

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface SearchBarProps {
  onTrackAdded?: () => void;
}

export default function SearchBar({ onTrackAdded }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [addingTrackId, setAddingTrackId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<RateLimitState>({ remaining: RATE_LIMIT, resetAt: null });
  const [now, setNow] = useState(Date.now());

  const debouncedQuery = useDebounce(query, 300);

  // Tick every second to drive the countdown
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Clear resetAt once the window has passed
  useEffect(() => {
    if (rateLimit.resetAt && now >= rateLimit.resetAt) {
      setRateLimit({ remaining: RATE_LIMIT, resetAt: null });
    }
  }, [now, rateLimit.resetAt]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const search = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const tracks = await api.searchTracks(debouncedQuery);
        setResults(tracks);
        setIsOpen(tracks.length > 0);
      } catch (err: any) {
        setError(err.error || 'Search failed');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    search();
  }, [debouncedQuery]);

  const handleAddTrack = async (track: Track) => {
    setAddingTrackId(track.id);
    setError(null);
    try {
      const res = await api.addToQueue(track);
      setRateLimit({ remaining: res.rateLimitRemaining, resetAt: res.rateLimitResetAt });
      setQuery('');
      setResults([]);
      setIsOpen(false);
      onTrackAdded?.();
    } catch (err: any) {
      // On 429, retryAfter is in seconds
      if (err.retryAfter) {
        setRateLimit({ remaining: 0, resetAt: Date.now() + err.retryAfter * 1000 });
      }
      setError(err.error || 'Failed to add track');
    } finally {
      setAddingTrackId(null);
    }
  };

  const isRateLimited = rateLimit.remaining === 0 && rateLimit.resetAt !== null;
  const msUntilReset = rateLimit.resetAt ? rateLimit.resetAt - now : 0;

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search for a song..."
          className="w-full px-4 py-3 bg-[var(--spotify-white)] text-[var(--spotify-black)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--spotify-green)] text-sm"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[var(--spotify-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* Rate limit indicator */}
      <div className="flex items-center gap-2 mt-2 px-1 text-xs">
        {isRateLimited ? (
          <>
            <span className="text-red-400 font-medium">Rate limit reached</span>
            <span className="text-[var(--spotify-light-gray)]">•</span>
            <span className="text-[var(--spotify-light-gray)]">
              resets in <span className="text-[var(--spotify-white)] tabular-nums">{formatCountdown(msUntilReset)}</span>
            </span>
          </>
        ) : (
          <>
            <span className={rateLimit.remaining <= 1 ? 'text-yellow-400 font-medium' : 'text-[var(--spotify-light-gray)]'}>
              {rateLimit.remaining} of {RATE_LIMIT} songs remaining
            </span>
            {rateLimit.resetAt && (
              <>
                <span className="text-[var(--spotify-light-gray)]">•</span>
                <span className="text-[var(--spotify-light-gray)]">
                  resets in <span className="text-[var(--spotify-white)] tabular-nums">{formatCountdown(msUntilReset)}</span>
                </span>
              </>
            )}
          </>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-1 px-2">{error}</p>
      )}

      {isOpen && (
        <SearchResults
          results={results}
          onAdd={handleAddTrack}
          addingTrackId={addingTrackId}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
