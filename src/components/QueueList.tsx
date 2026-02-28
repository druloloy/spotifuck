import type { Track, QueueItem } from '@lib/types';
import TrackCard from './TrackCard';

interface QueueListProps {
  spotifyQueue: Track[];
  localQueue: QueueItem[];
  loading?: boolean;
}

export default function QueueList({ spotifyQueue, localQueue, loading }: QueueListProps) {
  if (loading) {
    return (
      <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-[var(--spotify-light-gray)] mb-3">
          QUEUE
        </h2>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-2">
              <div className="w-10 h-10 bg-[var(--spotify-medium-gray)] rounded" />
              <div className="flex-1">
                <div className="h-3 bg-[var(--spotify-medium-gray)] rounded w-3/4 mb-1" />
                <div className="h-2 bg-[var(--spotify-medium-gray)] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const hasQueue = spotifyQueue.length > 0 || localQueue.length > 0;

  return (
    <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-4 flex-1 overflow-hidden flex flex-col">
      <h2 className="text-sm font-semibold text-[var(--spotify-light-gray)] mb-3">
        QUEUE {hasQueue && `(${spotifyQueue.length})`}
      </h2>

      {!hasQueue ? (
        <p className="text-[var(--spotify-light-gray)] text-sm">
          Queue is empty. Search and add some songs!
        </p>
      ) : (
        <div className="overflow-y-auto flex-1 -mr-2 pr-2">
          {spotifyQueue.map((track, index) => (
            <div key={`${track.id}-${index}`} className="relative">
              <TrackCard track={track} compact />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
