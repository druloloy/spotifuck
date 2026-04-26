import { useState, useEffect, useRef } from 'preact/hooks';
import { api } from '@lib/api';
import type { LyricsResult, Track } from '@lib/types';

interface LyricsProps {
  track: Track | null;
}

export default function Lyrics({ track }: LyricsProps) {
  const [result, setResult] = useState<LyricsResult | null>(null);
  const [loading, setLoading] = useState(false);
  const lastTrackId = useRef<string | null>(null);

  useEffect(() => {
    if (!track) { setResult(null); return; }
    if (track.id === lastTrackId.current) return;
    lastTrackId.current = track.id;

    setLoading(true);
    setResult(null);

    api.getLyrics(track.artist, track.name)
      .then((data) => setResult(data))
      .catch(() => setResult({ lyrics: null, source: null, sourceUrl: null }))
      .finally(() => setLoading(false));
  }, [track?.id]);

  if (!track) return null;

  return (
    <div
      className="flex flex-col gap-3 overflow-hidden flex-1"
      style={{ backgroundColor: 'var(--panel)', border: '1.5px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-4 pt-4 pb-3"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <p className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--bone-dim)' }}>
          // LYRICS
        </p>
        {result?.source && (
          <span className="font-mono text-[9px] tracking-widest" style={{ color: 'var(--bone-dim)' }}>
            SRC · {result.source.toUpperCase()}
          </span>
        )}
      </div>

      <div className="px-4 pb-4 overflow-y-auto flex-1">
        {loading ? (
          <p className="font-mono text-[10px] tracking-widest animate-pulse" style={{ color: 'var(--bone-dim)' }}>
            // FETCHING···
          </p>
        ) : !result?.lyrics ? (
          <p className="font-mono text-xs" style={{ color: 'var(--bone-dim)' }}>
            LYRICS UNAVAILABLE.
          </p>
        ) : (
          <pre
            className="text-sm whitespace-pre-wrap leading-relaxed"
            style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--bone)' }}
          >
            {result.lyrics}
          </pre>
        )}
      </div>
    </div>
  );
}
