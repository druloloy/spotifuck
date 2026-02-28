import { useEffect, useRef } from 'preact/hooks';
import type { Track } from '@lib/types';
import TrackCard from './TrackCard';

interface SearchResultsProps {
  results: Track[];
  onAdd: (track: Track) => void;
  addingTrackId: string | null;
  onClose: () => void;
}

export default function SearchResults({
  results,
  onAdd,
  addingTrackId,
  onClose,
}: SearchResultsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  if (results.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className="absolute top-full left-0 right-0 mt-2 bg-[var(--spotify-dark-gray)] rounded-lg shadow-xl max-h-80 overflow-y-auto z-50"
    >
      {results.map((track) => (
        <TrackCard
          key={track.id}
          track={track}
          onAdd={onAdd}
          showAddButton
          isAdding={addingTrackId === track.id}
        />
      ))}
    </div>
  );
}
