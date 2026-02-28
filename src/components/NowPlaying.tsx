import type { NowPlaying as NowPlayingType } from '@lib/types';
import { formatDuration } from '@lib/api';

interface NowPlayingProps {
  nowPlaying: NowPlayingType | null;
  loading?: boolean;
}

export default function NowPlaying({ nowPlaying, loading }: NowPlayingProps) {
  if (loading) {
    return (
      <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-[var(--spotify-light-gray)] mb-3">
          NOW PLAYING
        </h2>
        <div className="animate-pulse flex items-center gap-4">
          <div className="w-16 h-16 bg-[var(--spotify-medium-gray)] rounded" />
          <div className="flex-1">
            <div className="h-4 bg-[var(--spotify-medium-gray)] rounded w-3/4 mb-2" />
            <div className="h-3 bg-[var(--spotify-medium-gray)] rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!nowPlaying?.track) {
    return (
      <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-4">
        <h2 className="text-sm font-semibold text-[var(--spotify-light-gray)] mb-3">
          NOW PLAYING
        </h2>
        <p className="text-[var(--spotify-light-gray)] text-sm">
          Nothing playing right now
        </p>
      </div>
    );
  }

  const { track, isPlaying, progress } = nowPlaying;
  const progressPercent = (progress / track.duration) * 100;

  return (
    <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-sm font-semibold text-[var(--spotify-light-gray)]">
          NOW PLAYING
        </h2>
        {isPlaying && (
          <div className="flex items-center gap-0.5">
            <span className="w-0.5 h-3 bg-[var(--spotify-green)] rounded animate-pulse" />
            <span className="w-0.5 h-4 bg-[var(--spotify-green)] rounded animate-pulse delay-75" />
            <span className="w-0.5 h-2 bg-[var(--spotify-green)] rounded animate-pulse delay-150" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <img
          src={track.albumArt || '/placeholder.png'}
          alt={track.album}
          className="w-16 h-16 rounded shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium truncate">{track.name}</p>
          <p className="text-[var(--spotify-light-gray)] text-sm truncate">
            {track.artist}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <div className="h-1 bg-[var(--spotify-medium-gray)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--spotify-green)] transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-[var(--spotify-light-gray)] mt-1">
          <span>{formatDuration(progress)}</span>
          <span>{formatDuration(track.duration)}</span>
        </div>
      </div>
    </div>
  );
}
