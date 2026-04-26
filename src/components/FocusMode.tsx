import { useState } from 'preact/hooks';
import type { AppState } from '@lib/types';
import { formatDuration } from '@lib/api';
import KineticText from './KineticText';
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
  const progressPercent = track ? Math.min(100, (nowPlaying!.progress / track.duration) * 100) : 0;

  return (
    <div
      className="fixed inset-0 z-40 flex flex-col items-center justify-center px-6 pb-24 gap-6"
      style={{ backgroundColor: 'var(--ink)' }}
    >
      {/* Section label */}
      <p className="absolute top-20 left-6 font-mono text-[9px] tracking-widest" style={{ color: 'var(--bone-dim)' }}>
        § 01 // FOCUS MODE
      </p>

      {/* Album art */}
      <div
        className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 overflow-hidden"
        style={{ outline: '1.5px solid var(--border)', boxShadow: '8px 8px 0 var(--brass)' }}
      >
        {track?.albumArt ? (
          <img src={track.albumArt} alt={track.album} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: 'var(--panel)' }}>
            <span className="font-display text-5xl" style={{ color: 'var(--border)' }}>♪</span>
          </div>
        )}
      </div>

      {/* Track info */}
      <div className="text-center w-full max-w-lg">
        {loading && !track ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-10 w-3/4 mx-auto" style={{ backgroundColor: 'var(--panel)' }} />
            <div className="h-5 w-1/2 mx-auto" style={{ backgroundColor: 'var(--panel)' }} />
          </div>
        ) : track ? (
          <>
            <h1 className="font-display text-3xl md:text-5xl leading-none mb-2 truncate" style={{ color: 'var(--bone)' }}>
              <KineticText text={track.name.toUpperCase()} staggerMs={80} />
            </h1>
            <p className="text-base mb-4" style={{ color: 'var(--bone-dim)' }}>{track.artist}</p>

            <div className="w-full max-w-sm mx-auto">
              <div className="h-[2px] w-full" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-full transition-all duration-1000"
                  style={{ width: `${progressPercent}%`, backgroundColor: 'var(--brass)' }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="font-mono text-[10px]" style={{ color: 'var(--bone-dim)' }}>{formatDuration(nowPlaying?.progress ?? 0)}</span>
                <span className="font-mono text-[10px]" style={{ color: 'var(--bone-dim)' }}>{formatDuration(track.duration)}</span>
              </div>
            </div>
          </>
        ) : (
          <p className="font-display text-2xl" style={{ color: 'var(--bone-dim)' }}>NOTHING PLAYING</p>
        )}
      </div>

      {/* Up next */}
      {nextTrack && (
        <div
          className="w-full max-w-sm p-3"
          style={{ backgroundColor: 'var(--panel)', border: '1px solid var(--border)' }}
        >
          <p className="font-mono text-[9px] tracking-widest mb-2" style={{ color: 'var(--bone-dim)' }}>
            // UP NEXT
          </p>
          <div className="flex items-center gap-3">
            <img src={nextTrack.albumArt || '/placeholder.png'} alt={nextTrack.album} className="w-9 h-9 object-cover" style={{ outline: '1px solid var(--border)' }} />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--bone)' }}>{nextTrack.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--bone-dim)' }}>{nextTrack.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Inline search */}
      {showSearch && (
        <div className="w-full max-w-sm">
          <SearchBar onTrackAdded={() => { onTrackAdded(); setShowSearch(false); }} />
        </div>
      )}

      {/* FAB — toggle search */}
      <button
        onClick={() => setShowSearch((s) => !s)}
        className="fixed bottom-6 right-6 px-5 py-3 font-mono text-xs font-bold tracking-widest shadow-brass btn-press transition-all"
        style={{ backgroundColor: 'var(--brass)', color: 'var(--ink)' }}
        aria-label={showSearch ? 'Hide search' : 'Search'}
      >
        {showSearch ? '// CLOSE' : '// SEARCH'}
      </button>
    </div>
  );
}
