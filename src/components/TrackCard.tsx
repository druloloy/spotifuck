import type { Track } from '@lib/types';
import { formatDuration } from '@lib/api';

interface TrackCardProps {
  track: Track;
  onAdd?: (track: Track) => void;
  showAddButton?: boolean;
  isAdding?: boolean;
  compact?: boolean;
  index?: number;
}

export default function TrackCard({
  track,
  onAdd,
  showAddButton = false,
  isAdding = false,
  compact = false,
  index,
}: TrackCardProps) {
  return (
    <div
      className="flex items-center gap-3 p-2 transition-colors"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      {index !== undefined && (
        <span
          className="font-mono text-[10px] w-5 flex-shrink-0 text-right"
          style={{ color: 'var(--bone-dim)' }}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      )}

      <img
        src={track.albumArt || '/placeholder.png'}
        alt={track.album}
        className={`${compact ? 'w-8 h-8' : 'w-10 h-10'} object-cover flex-shrink-0`}
        style={{ outline: '1px solid var(--border)' }}
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: 'var(--bone)' }}>
          {track.name}
        </p>
        <p className="text-xs truncate" style={{ color: 'var(--bone-dim)' }}>
          {track.artist}
        </p>
      </div>

      <span className="font-mono text-[10px] flex-shrink-0" style={{ color: 'var(--bone-dim)' }}>
        {formatDuration(track.duration)}
      </span>

      {showAddButton && onAdd && (
        <button
          onClick={() => onAdd(track)}
          disabled={isAdding}
          className="flex-shrink-0 px-3 py-1 font-mono text-xs font-bold tracking-wider shadow-brass-sm btn-press transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: 'var(--brass)',
            color: 'var(--ink)',
          }}
        >
          {isAdding ? '···' : '+ ADD'}
        </button>
      )}
    </div>
  );
}
