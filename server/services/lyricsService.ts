export interface LyricsResult {
  lyrics: string;
  source: string;
  sourceUrl: string;
}

// ── Source 1: lyrics.ovh (free REST API) ─────────────────────────────────────

async function fetchLyricsOvh(artist: string, title: string): Promise<LyricsResult | null> {
  try {
    const url = `https://api.lyrics.ovh/v1/${encodeURIComponent(artist)}/${encodeURIComponent(title)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    const data = await res.json() as { lyrics?: string; error?: string };
    if (!data.lyrics || data.error) return null;

    return {
      lyrics: data.lyrics.trim(),
      source: 'lyrics.ovh',
      sourceUrl: 'https://lyrics.ovh',
    };
  } catch {
    return null;
  }
}

// ── Source 2: ChartLyrics (free XML API) ─────────────────────────────────────

async function fetchChartLyrics(artist: string, title: string): Promise<LyricsResult | null> {
  try {
    const params = new URLSearchParams({ artist, song: title });
    const url = `http://api.chartlyrics.com/apiv1.asmx/SearchLyricDirect?${params}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;

    const xml = await res.text();

    // Parse <Lyric> tag from the XML response
    const match = xml.match(/<Lyric>([\s\S]*?)<\/Lyric>/);
    if (!match || !match[1].trim()) return null;

    const lyrics = match[1].trim();
    if (lyrics.length < 50) return null;

    // Parse the song URL from <LyricUrl> for the source link
    const urlMatch = xml.match(/<LyricUrl>([\s\S]*?)<\/LyricUrl>/);
    const sourceUrl = urlMatch?.[1].trim() || 'http://www.chartlyrics.com';

    return {
      lyrics,
      source: 'ChartLyrics',
      sourceUrl,
    };
  } catch {
    return null;
  }
}

// ── Source 3: lrclib.net (free open API) ─────────────────────────────────────

interface LrclibResponse {
  id: number;
  trackName: string;
  artistName: string;
  plainLyrics?: string;
  syncedLyrics?: string;
}

async function fetchLrclib(artist: string, title: string): Promise<LyricsResult | null> {
  try {
    const params = new URLSearchParams({ artist_name: artist, track_name: title });
    const url = `https://lrclib.net/api/get?${params}`;

    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;

    const data = await res.json() as LrclibResponse;

    // Prefer plain lyrics; fall back to synced lyrics with timestamps stripped
    const raw = data.plainLyrics || data.syncedLyrics?.replace(/^\[\d+:\d+\.\d+\]\s?/gm, '');
    if (!raw || raw.trim().length < 50) return null;

    return {
      lyrics: raw.trim(),
      source: 'lrclib.net',
      sourceUrl: 'https://lrclib.net',
    };
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getLyrics(artist: string, title: string): Promise<LyricsResult | null> {
  // Normalize to primary artist only — Spotify returns "Artist1, Artist2" for collabs
  const primaryArtist = artist.split(/,|feat\.|ft\.|&/i)[0].trim();

  // Try all three sources concurrently, return the first that succeeds
  const results = await Promise.allSettled([
    fetchLyricsOvh(primaryArtist, title),
    fetchChartLyrics(primaryArtist, title),
    fetchLrclib(primaryArtist, title),
  ]);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  return null;
}
