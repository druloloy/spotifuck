export interface SpotifyTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface Track {
  id: string;
  uri: string;
  name: string;
  artist: string;
  album: string;
  albumArt: string;
  duration: number;
}

export interface QueueItem {
  track: Track;
  addedAt: number;
  addedBy: string; // IP hash for anonymity
}

export interface NowPlaying {
  track: Track | null;
  isPlaying: boolean;
  progress: number;
}

export interface AppState {
  nowPlaying: NowPlaying;
  queue: QueueItem[];
}

export interface RateLimitInfo {
  count: number;
  resetAt: number;
}

export interface SpotifyTrackResponse {
  id: string;
  uri: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string; height: number; width: number }[];
  };
  duration_ms: number;
}

export interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrackResponse[];
  };
}

export interface SpotifyNowPlayingResponse {
  item: SpotifyTrackResponse | null;
  is_playing: boolean;
  progress_ms: number;
}
