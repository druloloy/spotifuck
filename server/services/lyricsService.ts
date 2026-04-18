import { parse } from 'node-html-parser';

export interface LyricsResult {
  lyrics: string;
  source: string;
  sourceUrl: string;
}

// Normalize strings for use in URLs
function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

// Strip HTML tags and normalize whitespace from a lyrics string
function cleanLyrics(raw: string): string {
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]/g, '[$1]') // keep [Verse], [Chorus] markers
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── Source 1: lyrics.ovh (free REST API) ──────────────────────────────────────

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
      sourceUrl: `https://lyrics.ovh`,
    };
  } catch {
    return null;
  }
}

// ── Source 2: AZLyrics (HTML scrape) ─────────────────────────────────────────

async function scrapeAZLyrics(artist: string, title: string): Promise<LyricsResult | null> {
  try {
    // AZLyrics removes "a" prefix for artists starting with it, and strips "the"
    const artistSlug = slugify(artist.replace(/^the\s+/i, ''));
    const titleSlug = slugify(title);
    const url = `https://www.azlyrics.com/lyrics/${artistSlug}/${titleSlug}.html`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return null;

    const html = await res.text();
    const root = parse(html);

    // AZLyrics lyrics live in a classless <div> inside .col-xs-12.col-lg-8.text-center
    const container = root.querySelector('.col-xs-12.col-lg-8');
    if (!container) return null;

    const lyricsDivs = container.querySelectorAll('div');
    const lyricsDiv = lyricsDivs.find(
      (d) => !d.getAttribute('class') && !d.getAttribute('id') && d.innerHTML.length > 100
    );
    if (!lyricsDiv) return null;

    const lyrics = cleanLyrics(lyricsDiv.innerHTML);
    if (!lyrics || lyrics.length < 50) return null;

    return {
      lyrics,
      source: 'AZLyrics',
      sourceUrl: url,
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

    // Prefer plain lyrics; fall back to synced lyrics stripped of timestamps
    const raw = data.plainLyrics || data.syncedLyrics?.replace(/^\[\d+:\d+\.\d+\]\s?/gm, '');
    if (!raw || raw.trim().length < 50) return null;

    return {
      lyrics: raw.trim(),
      source: 'lrclib.net',
      sourceUrl: `https://lrclib.net`,
    };
  } catch {
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getLyrics(artist: string, title: string): Promise<LyricsResult | null> {
  // Try all three sources concurrently, return the first that succeeds
  const results = await Promise.allSettled([
    fetchLyricsOvh(artist, title),
    scrapeAZLyrics(artist, title),
    fetchLrclib(artist, title),
  ]);

  for (const result of results) {
    if (result.status === 'fulfilled' && result.value) {
      return result.value;
    }
  }

  return null;
}
