import { SpotifyTokens } from '../types/index.ts';

let tokens: SpotifyTokens | null = null;

const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';

export function getTokens(): SpotifyTokens | null {
  return tokens;
}

export function setTokens(newTokens: SpotifyTokens): void {
  tokens = newTokens;
}

export function clearTokens(): void {
  tokens = null;
}

export function isAuthenticated(): boolean {
  return tokens !== null;
}

export function isTokenExpired(): boolean {
  if (!tokens) return true;
  // Add 60 second buffer
  return Date.now() >= tokens.expiresAt - 60000;
}

export async function refreshAccessToken(): Promise<boolean> {
  if (!tokens?.refreshToken) return false;

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error('Missing Spotify credentials');
    return false;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: tokens.refreshToken,
      }),
    });

    if (!response.ok) {
      console.error('Failed to refresh token:', await response.text());
      return false;
    }

    const data = await response.json();

    tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || tokens.refreshToken,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    console.log('Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('Error refreshing token:', error);
    return false;
  }
}

export async function getValidAccessToken(): Promise<string | null> {
  if (!tokens) return null;

  if (isTokenExpired()) {
    const refreshed = await refreshAccessToken();
    if (!refreshed) return null;
  }

  return tokens.accessToken;
}

export async function exchangeCodeForTokens(code: string): Promise<boolean> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    console.error('Missing Spotify credentials');
    return false;
  }

  try {
    const response = await fetch(SPOTIFY_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      console.error('Failed to exchange code:', await response.text());
      return false;
    }

    const data = await response.json();

    tokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    console.log('Successfully authenticated with Spotify');
    return true;
  } catch (error) {
    console.error('Error exchanging code:', error);
    return false;
  }
}
