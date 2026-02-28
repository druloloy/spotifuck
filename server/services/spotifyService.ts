import { getValidAccessToken } from './tokenService.ts';
import {
  Track,
  NowPlaying,
  SpotifySearchResponse,
  SpotifyNowPlayingResponse,
  SpotifyTrackResponse,
} from '../types/index.ts';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

function transformTrack(spotifyTrack: SpotifyTrackResponse): Track {
  return {
    id: spotifyTrack.id,
    uri: spotifyTrack.uri,
    name: spotifyTrack.name,
    artist: spotifyTrack.artists.map((a) => a.name).join(', '),
    album: spotifyTrack.album.name,
    albumArt: spotifyTrack.album.images[0]?.url || '',
    duration: spotifyTrack.duration_ms,
  };
}

async function spotifyFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error('Not authenticated with Spotify');
  }

  const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Spotify API error: ${response.status} - ${error}`);
  }

  return response.json();
}

export async function searchTracks(query: string, limit = 10): Promise<Track[]> {
  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: limit.toString(),
  });

  const data = await spotifyFetch<SpotifySearchResponse>(`/search?${params}`);
  if (!data?.tracks?.items) return [];

  return data.tracks.items.map(transformTrack);
}

export async function getNowPlaying(): Promise<NowPlaying> {
  try {
    const data = await spotifyFetch<SpotifyNowPlayingResponse>('/me/player/currently-playing');

    if (!data || !data.item) {
      return { track: null, isPlaying: false, progress: 0 };
    }

    return {
      track: transformTrack(data.item),
      isPlaying: data.is_playing,
      progress: data.progress_ms,
    };
  } catch (error) {
    console.error('Error fetching now playing:', error);
    return { track: null, isPlaying: false, progress: 0 };
  }
}

export async function addToSpotifyQueue(trackUri: string): Promise<boolean> {
  try {
    await spotifyFetch(`/me/player/queue?uri=${encodeURIComponent(trackUri)}`, {
      method: 'POST',
    });
    return true;
  } catch (error) {
    console.error('Error adding to Spotify queue:', error);
    return false;
  }
}

export async function getSpotifyQueue(): Promise<Track[]> {
  try {
    const data = await spotifyFetch<{ queue: SpotifyTrackResponse[] }>('/me/player/queue');
    if (!data?.queue) return [];
    return data.queue.map(transformTrack);
  } catch (error) {
    console.error('Error fetching Spotify queue:', error);
    return [];
  }
}

export function validateTrackUri(uri: string): boolean {
  return /^spotify:track:[a-zA-Z0-9]{22}$/.test(uri);
}
