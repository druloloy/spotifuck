import type {
  Track,
  AuthStatus,
  SearchResponse,
  NowPlaying,
  QueueResponse,
  AppState,
  AddToQueueResponse,
  ApiError,
} from './types';

const API_BASE = '/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Unknown error',
      }));
      throw error;
    }

    return response.json();
  }

  async getAuthStatus(): Promise<AuthStatus> {
    return this.request<AuthStatus>('/auth/status');
  }

  async searchTracks(query: string): Promise<Track[]> {
    if (query.trim().length < 2) return [];
    const data = await this.request<SearchResponse>(
      `/search?q=${encodeURIComponent(query)}`
    );
    return data.tracks;
  }

  async getNowPlaying(): Promise<NowPlaying> {
    return this.request<NowPlaying>('/now-playing');
  }

  async getQueue(): Promise<QueueResponse> {
    return this.request<QueueResponse>('/queue');
  }

  async addToQueue(track: Track): Promise<AddToQueueResponse> {
    return this.request<AddToQueueResponse>('/queue', {
      method: 'POST',
      body: JSON.stringify({ trackUri: track.uri, track }),
    });
  }

  async getState(): Promise<AppState> {
    return this.request<AppState>('/state');
  }
}

export const api = new ApiClient();

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
