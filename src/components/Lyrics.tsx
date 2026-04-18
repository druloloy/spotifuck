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
    if (!track) {
      setResult(null);
      return;
    }

    // Don't re-fetch for the same track
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
    <div className="bg-[var(--spotify-dark-gray)] rounded-lg p-4 flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-[var(--spotify-light-gray)]">LYRICS</h2>

      {loading ? (
        <div className="flex items-center gap-2 text-[var(--spotify-light-gray)] text-sm py-4">
          <div className="w-4 h-4 border-2 border-[var(--spotify-green)] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          Fetching lyrics…
        </div>
      ) : !result?.lyrics ? (
        <p className="text-[var(--spotify-light-gray)] text-sm italic py-2">
          Lyrics unavailable for this track.
        </p>
      ) : (
        <>
          <pre className="text-sm text-white whitespace-pre-wrap font-sans leading-relaxed max-h-96 overflow-y-auto pr-1">
            {result.lyrics}
          </pre>

          {result.source && result.sourceUrl && (
            <p className="text-xs text-[var(--spotify-light-gray)] border-t border-[var(--spotify-medium-gray)] pt-3 mt-1">
              Source:{' '}
              <a
                href={result.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--spotify-green)] hover:underline"
              >
                {result.source}
              </a>
            </p>
          )}
        </>
      )}
    </div>
  );
}
