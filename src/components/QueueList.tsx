import type { Track, QueueItem } from '@lib/types';
import TrackCard from './TrackCard';

interface QueueListProps {
  spotifyQueue: Track[];
  localQueue: QueueItem[];
  loading?: boolean;
}

export default function QueueList({ spotifyQueue, localQueue, loading }: QueueListProps) {
  const cardStyle = {
    backgroundColor: 'var(--panel)',
    border: '1.5px solid var(--border)',
  };

  if (loading) {
    return (
      <div style={cardStyle} className="p-4 flex-1">
        <p className="font-mono text-[10px] tracking-widest mb-4" style={{ color: 'var(--bone-dim)' }}>
          // QUEUE
        </p>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border)' }}>
              <div className="w-8 h-8 flex-shrink-0" style={{ backgroundColor: 'var(--border)' }} />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-3/4" style={{ backgroundColor: 'var(--border)' }} />
                <div className="h-2 w-1/2" style={{ backgroundColor: 'var(--border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const total = spotifyQueue.length + localQueue.length;

  return (
    <div style={cardStyle} className="flex flex-col flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <p className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--bone-dim)' }}>
          // QUEUE
        </p>
        {total > 0 && (
          <span className="font-mono text-[10px]" style={{ color: 'var(--brass)' }}>
            {String(total).padStart(2, '0')} TRACKS
          </span>
        )}
      </div>

      {total === 0 ? (
        <p className="px-4 py-4 font-mono text-xs" style={{ color: 'var(--bone-dim)' }}>
          QUEUE IS EMPTY.
        </p>
      ) : (
        <div className="overflow-y-auto flex-1 px-2 py-2">
          {spotifyQueue.map((track, i) => (
            <TrackCard key={`${track.id}-${i}`} track={track} index={i} compact />
          ))}
        </div>
      )}
    </div>
  );
}
