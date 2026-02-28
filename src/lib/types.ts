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
  addedBy: string;
}

export interface NowPlaying {
  track: Track | null;
  isPlaying: boolean;
  progress: number;
}

export interface AppState {
  nowPlaying: NowPlaying;
  spotifyQueue: Track[];
  localQueue: QueueItem[];
}

export interface AuthStatus {
  authenticated: boolean;
  redirectUri?: string;
}

export interface SearchResponse {
  tracks: Track[];
}

export interface QueueResponse {
  spotifyQueue: Track[];
  localQueue: QueueItem[];
}

export interface AddToQueueResponse {
  success: boolean;
  queueItem: QueueItem;
  rateLimitRemaining: number;
}

export interface ApiError {
  error: string;
  message?: string;
  retryAfter?: number;
}
