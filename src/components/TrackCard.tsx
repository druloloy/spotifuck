import type { Track } from '@lib/types';
import { formatDuration } from '@lib/api';

interface TrackCardProps {
  track: Track;
  onAdd?: (track: Track) => void;
  showAddButton?: boolean;
  isAdding?: boolean;
  compact?: boolean;
}

export default function TrackCard({
  track,
  onAdd,
  showAddButton = false,
  isAdding = false,
  compact = false,
}: TrackCardProps) {
  const imageSize = compact ? 'w-10 h-10' : 'w-12 h-12';

  return (
    <div className={`flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--spotify-dark-gray)] transition-colors ${compact ? 'py-1' : ''}`}>
      <img
        src={track.albumArt || '/placeholder.png'}
        alt={track.album}
        className={`${imageSize} rounded object-cover flex-shrink-0`}
      />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{track.name}</p>
        <p className="text-[var(--spotify-light-gray)] text-xs truncate">
          {track.artist}
        </p>
      </div>
      <span className="text-[var(--spotify-light-gray)] text-xs flex-shrink-0">
        {formatDuration(track.duration)}
      </span>
      {showAddButton && onAdd && (
        <button
          onClick={() => onAdd(track)}
          disabled={isAdding}
          className="flex-shrink-0 px-3 py-1 bg-[var(--spotify-green)] text-black text-sm font-semibold rounded-full hover:bg-[var(--spotify-green-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAdding ? '...' : '+'}
        </button>
      )}
    </div>
  );
}
