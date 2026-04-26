import type { AppState } from '@lib/types';
import { formatDuration } from '@lib/api';

interface FocusModeProps {
  state: AppState | null;
  loading: boolean;
  onTrackAdded: () => void;
}

export default function FocusMode({ state, loading }: FocusModeProps) {
  const nowPlaying = state?.nowPlaying ?? null;
  const track = nowPlaying?.track ?? null;
  const nextTrack = state?.spotifyQueue?.[0] ?? state?.localQueue?.[0]?.track ?? null;
  const progressPercent = track
    ? Math.min(100, (nowPlaying!.progress / track.duration) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-[var(--spotify-black)]">
      {/* Main content — vertically centered */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16">
        <div className="w-full max-w-lg">

          {/* Now playing label */}
          <p className="text-xs font-semibold tracking-widest text-[var(--spotify-light-gray)] mb-10 uppercase">
            Now Playing
          </p>

          {loading && !track ? (
            <div className="space-y-3">
              <div className="h-8 w-3/4 bg-[var(--spotify-dark-gray)] rounded animate-pulse" />
              <div className="h-5 w-1/2 bg-[var(--spotify-dark-gray)] rounded animate-pulse" />
            </div>
          ) : track ? (
            <>
              {/* Track name */}
              <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2 break-words">
                {track.name}
              </h1>

              {/* Artist */}
              <p className="text-base text-[var(--spotify-light-gray)] mb-10">
                {track.artist}
              </p>

              {/* Progress */}
              <div className="mb-1.5">
                <div className="h-px w-full bg-[var(--spotify-medium-gray)]">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-[var(--spotify-light-gray)]">
                <span>{formatDuration(nowPlaying?.progress ?? 0)}</span>
                <span>{formatDuration(track.duration)}</span>
              </div>
            </>
          ) : (
            <p className="text-xl text-[var(--spotify-light-gray)]">Nothing playing right now</p>
          )}

          {/* Up next */}
          {nextTrack && (
            <div className="mt-12 pt-8 border-t border-[var(--spotify-dark-gray)]">
              <p className="text-xs font-semibold tracking-widest text-[var(--spotify-light-gray)] uppercase mb-3">
                Up Next
              </p>
              <p className="text-white font-medium">{nextTrack.name}</p>
              <p className="text-sm text-[var(--spotify-light-gray)]">{nextTrack.artist}</p>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
