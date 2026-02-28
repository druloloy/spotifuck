import { useState, useEffect } from 'preact/hooks';
import { useDebounce } from '@hooks/useDebounce';
import { api } from '@lib/api';
import type { Track } from '@lib/types';
import SearchResults from './SearchResults';

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
      await api.addToQueue(track);
      setQuery('');
      setResults([]);
      setIsOpen(false);
      onTrackAdded?.();
    } catch (err: any) {
      setError(err.error || 'Failed to add track');
    } finally {
      setAddingTrackId(null);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          type="text"
          value={query}
          onInput={(e) => setQuery((e.target as HTMLInputElement).value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search for a song..."
          className="w-full px-4 py-3 bg-white text-black rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--spotify-green)] text-sm"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[var(--spotify-green)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm mt-2 px-2">{error}</p>
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
