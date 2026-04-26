import type { NowPlaying as NowPlayingType } from '@lib/types';
import { formatDuration } from '@lib/api';
import KineticText from './KineticText';

interface NowPlayingProps {
  nowPlaying: NowPlayingType | null;
  loading?: boolean;
}

export default function NowPlaying({ nowPlaying, loading }: NowPlayingProps) {
  const cardStyle = {
    backgroundColor: 'var(--panel)',
    border: '1.5px solid var(--border)',
  };

  if (loading) {
    return (
      <div style={cardStyle} className="p-4">
        <p className="font-mono text-[10px] tracking-widest mb-4" style={{ color: 'var(--bone-dim)' }}>
          // NOW PLAYING
        </p>
        <div className="animate-pulse space-y-3">
          <div className="h-8 rounded-none w-3/4" style={{ backgroundColor: 'var(--border)' }} />
          <div className="h-4 rounded-none w-1/2" style={{ backgroundColor: 'var(--border)' }} />
        </div>
      </div>
    );
  }

  if (!nowPlaying?.track) {
    return (
      <div style={cardStyle} className="p-4">
        <p className="font-mono text-[10px] tracking-widest mb-4" style={{ color: 'var(--bone-dim)' }}>
          // NOW PLAYING
        </p>
        <p className="font-mono text-xs" style={{ color: 'var(--bone-dim)' }}>
          NOTHING PLAYING
        </p>
      </div>
    );
  }

  const { track, isPlaying, progress } = nowPlaying;
  const progressPercent = Math.min(100, (progress / track.duration) * 100);

  return (
    <div style={cardStyle} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--bone-dim)' }}>
          // NOW PLAYING
        </p>
        {isPlaying && (
          <span className="font-mono text-[9px] tracking-widest" style={{ color: 'var(--brass)' }}>
            ▶ LIVE
          </span>
        )}
      </div>

      <div className="flex items-start gap-4">
        <img
          src={track.albumArt || '/placeholder.png'}
          alt={track.album}
          className="w-16 h-16 flex-shrink-0 object-cover"
          style={{ outline: '1px solid var(--border)' }}
        />
        <div className="flex-1 min-w-0">
          <h2
            className="font-display text-xl leading-tight mb-1 truncate"
            style={{ color: 'var(--bone)' }}
          >
            <KineticText text={track.name.toUpperCase()} staggerMs={90} />
          </h2>
          <p className="text-sm truncate" style={{ color: 'var(--bone-dim)' }}>
            {track.artist}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="h-[2px] w-full" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full transition-all duration-1000"
            style={{ width: `${progressPercent}%`, backgroundColor: 'var(--brass)' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="font-mono text-[10px]" style={{ color: 'var(--bone-dim)' }}>
            {formatDuration(progress)}
          </span>
          <span className="font-mono text-[10px]" style={{ color: 'var(--bone-dim)' }}>
            {formatDuration(track.duration)}
          </span>
        </div>
      </div>
    </div>
  );
}
