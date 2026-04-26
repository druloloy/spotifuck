import { useState, useEffect } from 'preact/hooks';
import { useDebounce } from '@hooks/useDebounce';
import { api } from '@lib/api';
import type { Track } from '@lib/types';
import SearchResults from './SearchResults';

const RATE_LIMIT = 5;

interface RateLimitState {
  remaining: number;
  resetAt: number | null;
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

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (rateLimit.resetAt && now >= rateLimit.resetAt) {
      setRateLimit({ remaining: RATE_LIMIT, resetAt: null });
    }
  }, [now, rateLimit.resetAt]);

  const debouncedQuery = useDebounce(query, 300);

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
      if (err.retryAfter) {
        setRateLimit({ remaining: 0, resetAt: Date.now() + err.retryAfter * 1000 });
      }
      setError(err.error || 'Failed to add track');
    } finally {
      setAddingTrackId(null);
    }
  };

  const isExhausted = rateLimit.remaining === 0 && rateLimit.resetAt !== null;
  const isLow = rateLimit.remaining === 1 && !isExhausted;
  const cooldownMs = rateLimit.resetAt ? rateLimit.resetAt - now : 0;
  const showStatus = isExhausted || isLow || rateLimit.remaining < RATE_LIMIT;

  return (
    <div className="relative">
      {showStatus && (
        <div
          className="flex items-center justify-between mb-1 px-0 font-mono text-[10px] tracking-widest"
          style={{ color: isExhausted ? 'var(--heat)' : isLow ? 'var(--brass)' : 'var(--bone-dim)' }}
        >
          {isExhausted
            ? `// LOCKED · RESETS IN ${formatCountdown(cooldownMs)}`
            : `// ${rateLimit.remaining}/${RATE_LIMIT} SLOTS REMAINING`}
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="// SEARCH TRACKS"
          disabled={isExhausted}
          className="w-full px-4 py-3 font-mono text-sm focus:outline-none transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--panel)',
            color: 'var(--bone)',
            border: `1.5px solid ${isExhausted ? 'var(--heat)' : isOpen ? 'var(--bone)' : 'var(--border)'}`,
            borderRadius: 0,
          }}
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <span className="font-mono text-[10px] animate-pulse" style={{ color: 'var(--brass)' }}>···</span>
          </div>
        )}
      </div>

      {error && (
        <p className="font-mono text-[10px] tracking-widest mt-1.5" style={{ color: 'var(--heat)' }}>
          // {error.toUpperCase()}
        </p>
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
