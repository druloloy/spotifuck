import { getLyrics } from '../services/lyricsService.ts';

interface TestCase {
  description: string;
  artist: string;
  title: string;
}

const cases: TestCase[] = [
  // Solo artist
  { description: 'Solo artist', artist: 'Adele', title: 'Hello' },
  // Collaboration — Spotify format "Artist1, Artist2"
  { description: 'Collab (comma-separated)', artist: 'Drake, Future', title: 'Life Is Good' },
  // "feat." in artist string
  { description: 'Feat. artist', artist: 'Eminem feat. Rihanna', title: 'Love The Way You Lie' },
  // Artist starting with "The"
  { description: 'Artist starting with "The"', artist: 'The Weeknd', title: 'Blinding Lights' },
  { description: 'Local artist', artist: 'Alisson Shore', title: 'Sarili Muna' },
  // Song unlikely to exist
  { description: 'Non-existent song (expect unavailable)', artist: 'xyzartist123', title: 'xyzsongtitle456' },
];

async function run() {
  console.log('=== Lyrics Scraper Test ===\n');

  for (const tc of cases) {
    console.log(`[${tc.description}]`);
    console.log(`  Artist : ${tc.artist}`);
    console.log(`  Title  : ${tc.title}`);

    const start = Date.now();
    const result = await getLyrics(tc.artist, tc.title);
    const elapsed = Date.now() - start;

    if (!result?.lyrics) {
      console.log(`  Result : ❌ Unavailable (${elapsed}ms)\n`);
    } else {
      const preview = result.lyrics.split('\n').slice(0, 3).join(' / ');
      console.log(`  Result : ✅ Found via ${result.source} (${elapsed}ms)`);
      console.log(`  Preview: ${preview}`);
      console.log(`  URL    : ${result.sourceUrl}\n`);
    }
  }
}

run().catch(console.error);
