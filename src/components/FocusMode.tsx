import { useState } from 'preact/hooks';
import type { AppState } from '@lib/types';
import { formatDuration } from '@lib/api';
import SearchBar from './SearchBar';

interface FocusModeProps {
  state: AppState | null;
  loading: boolean;
  onTrackAdded: () => void;
}

export default function FocusMode({ state, loading, onTrackAdded }: FocusModeProps) {
  const [showSearch, setShowSearch] = useState(false);

  const nowPlaying = state?.nowPlaying ?? null;
  const track = nowPlaying?.track ?? null;
  const nextTrack = state?.spotifyQueue?.[0] ?? state?.localQueue?.[0]?.track ?? null;

  const progressPercent = track
    ? Math.min(100, (nowPlaying!.progress / track.duration) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-[var(--spotify-black)] z-40 flex flex-col items-center justify-center px-6 pb-24">
      {/* Album Art */}
      <div className="w-56 h-56 md:w-72 md:h-72 rounded-lg shadow-2xl overflow-hidden mb-6 bg-[var(--spotify-dark-gray)]">
        {track?.albumArt ? (
          <img src={track.albumArt} alt={track.album} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-20 h-20 text-[var(--spotify-medium-gray)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>
        )}
      </div>

      {/* Track Info */}
      <div className="text-center mb-6 max-w-sm w-full">
        {loading && !track ? (
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-[var(--spotify-medium-gray)] rounded w-3/4 mx-auto" />
            <div className="h-4 bg-[var(--spotify-medium-gray)] rounded w-1/2 mx-auto" />
          </div>
        ) : track ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-1">
              <p className="text-white text-2xl font-bold truncate">{track.name}</p>
              {nowPlaying?.isPlaying && (
                <div className="flex items-end gap-0.5 shrink-0 pb-0.5">
                  <span className="w-0.5 h-3 bg-[var(--spotify-green)] rounded animate-pulse" />
                  <span className="w-0.5 h-4 bg-[var(--spotify-green)] rounded animate-pulse delay-75" />
                  <span className="w-0.5 h-2 bg-[var(--spotify-green)] rounded animate-pulse delay-150" />
                </div>
              )}
            </div>
            <p className="text-[var(--spotify-light-gray)] text-base truncate">{track.artist}</p>

            {/* Progress Bar */}
            <div className="mt-4 w-full">
              <div className="h-1.5 bg-[var(--spotify-medium-gray)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--spotify-green)] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--spotify-light-gray)] mt-1">
                <span>{formatDuration(nowPlaying?.progress ?? 0)}</span>
                <span>{formatDuration(track.duration)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="text-[var(--spotify-light-gray)] text-lg">Nothing playing right now</p>
        )}
      </div>

      {/* Up Next */}
      {nextTrack && (
        <div className="w-full max-w-sm bg-[var(--spotify-dark-gray)] rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-[var(--spotify-light-gray)] mb-2">UP NEXT</p>
          <div className="flex items-center gap-3">
            <img
              src={nextTrack.albumArt || '/placeholder.png'}
              alt={nextTrack.album}
              className="w-10 h-10 rounded"
            />
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{nextTrack.name}</p>
              <p className="text-[var(--spotify-light-gray)] text-xs truncate">{nextTrack.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search toggle */}
      {showSearch && (
        <div className="w-full max-w-sm mb-3">
          <SearchBar
            onTrackAdded={() => {
              onTrackAdded();
              setShowSearch(false);
            }}
          />
        </div>
      )}

      {/* Floating action button: toggle search */}
      <button
        onClick={() => setShowSearch((s) => !s)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[var(--spotify-green)] hover:bg-[var(--spotify-green-hover)] text-black rounded-full shadow-lg flex items-center justify-center transition-colors"
        aria-label={showSearch ? 'Hide search' : 'Show search'}
      >
        {showSearch ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}
