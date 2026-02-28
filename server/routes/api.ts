import { Router, Request, Response } from 'express';
import {
  isAuthenticated,
  exchangeCodeForTokens,
} from '../services/tokenService.ts';
import {
  searchTracks,
  getNowPlaying,
  addToSpotifyQueue,
  getSpotifyQueue,
  validateTrackUri,
} from '../services/spotifyService.ts';
import {
  getQueue,
  addToQueue,
  isTrackInQueue,
} from '../services/queueService.ts';
import { rateLimiter, incrementRateLimit, getRateLimitInfo, getClientIdentifier } from '../middleware/rateLimiter.ts';

const router = Router();

// ===== Auth Routes =====

router.get('/auth/login', (req: Request, res: Response) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    res.status(500).json({ error: 'Spotify credentials not configured' });
    return;
  }

  const scopes = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
  ].join(' ');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: scopes,
    redirect_uri: redirectUri,
    show_dialog: 'true',
  });

  res.redirect(`https://accounts.spotify.com/authorize?${params}`);
});

router.get('/auth/callback', async (req: Request, res: Response) => {
  const { code, error } = req.query;

  if (error) {
    res.status(400).json({ error: `Spotify auth error: ${error}` });
    return;
  }

  if (!code || typeof code !== 'string') {
    res.status(400).json({ error: 'No authorization code received' });
    return;
  }

  const success = await exchangeCodeForTokens(code);

  if (success) {
    res.redirect('/admin?success=true');
  } else {
    res.redirect('/admin?error=auth_failed');
  }
});

router.get('/auth/status', (req: Request, res: Response) => {
  res.json({
    authenticated: isAuthenticated(),
    redirectUri: process.env.SPOTIFY_REDIRECT_URI || '',
  });
});

// ===== Search Routes =====

router.get('/search', async (req: Request, res: Response) => {
  const { q } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    res.status(400).json({ error: 'Query must be at least 2 characters' });
    return;
  }

  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Host not authenticated with Spotify' });
    return;
  }

  try {
    const tracks = await searchTracks(q.trim());
    res.json({ tracks });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search tracks' });
  }
});

// ===== Now Playing Routes =====

router.get('/now-playing', async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Host not authenticated with Spotify' });
    return;
  }

  try {
    const nowPlaying = await getNowPlaying();
    res.json(nowPlaying);
  } catch (error) {
    console.error('Now playing error:', error);
    res.status(500).json({ error: 'Failed to fetch now playing' });
  }
});

// ===== Queue Routes =====

router.get('/queue', async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Host not authenticated with Spotify' });
    return;
  }

  try {
    const spotifyQueue = await getSpotifyQueue();
    const localQueue = getQueue();
    res.json({ spotifyQueue, localQueue });
  } catch (error) {
    console.error('Queue error:', error);
    res.status(500).json({ error: 'Failed to fetch queue' });
  }
});

router.post('/queue', rateLimiter, async (req: Request, res: Response) => {
  const { trackUri, track } = req.body;

  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Host not authenticated with Spotify' });
    return;
  }

  if (!trackUri || !validateTrackUri(trackUri)) {
    res.status(400).json({ error: 'Invalid track URI' });
    return;
  }

  if (!track || !track.id || !track.name) {
    res.status(400).json({ error: 'Track information required' });
    return;
  }

  // Check if track is already in queue
  if (isTrackInQueue(track.id)) {
    res.status(409).json({ error: 'Track is already in the queue' });
    return;
  }

  try {
    // Add to Spotify's playback queue
    const added = await addToSpotifyQueue(trackUri);
    if (!added) {
      res.status(500).json({ error: 'Failed to add to Spotify queue' });
      return;
    }

    // Add to local queue for display
    const clientId = getClientIdentifier(req);
    const queueItem = addToQueue(track, clientId);
    incrementRateLimit(clientId);

    const info = getRateLimitInfo(clientId);
    res.status(201).json({
      success: true,
      queueItem,
      rateLimitRemaining: 5 - info.count,
    });
  } catch (error) {
    console.error('Add to queue error:', error);
    res.status(500).json({ error: 'Failed to add track to queue' });
  }
});

// ===== State Route (combined for polling) =====

router.get('/state', async (req: Request, res: Response) => {
  if (!isAuthenticated()) {
    res.status(401).json({ error: 'Host not authenticated with Spotify' });
    return;
  }

  try {
    const [nowPlaying, spotifyQueue] = await Promise.all([
      getNowPlaying(),
      getSpotifyQueue(),
    ]);

    const localQueue = getQueue();

    res.json({
      nowPlaying,
      spotifyQueue,
      localQueue,
    });
  } catch (error) {
    console.error('State error:', error);
    res.status(500).json({ error: 'Failed to fetch state' });
  }
});

export default router;
