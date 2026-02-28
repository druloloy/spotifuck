# Spotifuck

A web app that lets office users search and queue songs anonymously, while the host controls Spotify playback.

## Features

- **Anonymous Song Queuing**: Users can search and add songs to the queue without logging in
- **Real-time Updates**: Now playing and queue status update every 5 seconds
- **Rate Limiting**: 5 songs per 10 minutes per user to prevent spam
- **Responsive Design**: Works on desktop and mobile devices
- **Spotify Integration**: Direct integration with Spotify's playback queue
- **Dark Theme**: Spotify-inspired dark UI

## Prerequisites

- Node.js 18+
- Spotify Premium account (required for playback control)
- Spotify Developer App credentials

## Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd spotifuck
npm install
```

### 2. Configure Spotify App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app (or use existing)
3. Add `http://localhost:5000/api/auth/callback` to Redirect URIs
4. Copy your Client ID and Client Secret

### 3. Environment Variables

Copy the template and fill in your credentials:

```bash
cp .env.template .env.development
```

Edit `.env.development`:

```env
SPOTIFY_CLIENT_ID="your_client_id_here"
SPOTIFY_CLIENT_SECRET="your_client_secret_here"
SPOTIFY_REDIRECT_URI="http://localhost:5000/api/auth/callback"
PORT=5000
NODE_ENV=development
```

### 4. Run the App

**Development** (two terminals):

```bash
# Terminal 1: Backend server
npm run server

# Terminal 2: Frontend dev server
npm run dev
```

Then open http://localhost:5173

**Production** (single command):

```bash
npm run prod
```

Then open http://localhost:5000

### 5. Connect Spotify

1. Go to http://localhost:5173/admin (or :5000 in production)
2. Click "Connect with Spotify"
3. Authorize the app
4. Start playing music on Spotify (on any device)
5. Users can now search and queue songs!

## Project Structure

```
spotifuck/
├── server/                  # Backend (Express)
│   ├── routes/
│   │   └── api.ts          # API endpoints
│   ├── services/
│   │   ├── spotifyService.ts   # Spotify API wrapper
│   │   ├── tokenService.ts     # OAuth token management
│   │   └── queueService.ts     # In-memory queue
│   ├── middleware/
│   │   └── rateLimiter.ts  # IP-based rate limiting
│   ├── types/
│   │   └── index.ts        # TypeScript interfaces
│   ├── app.ts              # Express app setup
│   └── index.ts            # Server entry point
├── src/                    # Frontend (Preact)
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   ├── TrackCard.tsx
│   │   ├── NowPlaying.tsx
│   │   └── QueueList.tsx
│   ├── pages/
│   │   ├── home.tsx        # Main player UI
│   │   └── admin.tsx       # Spotify setup
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   └── usePolling.ts
│   ├── lib/
│   │   ├── api.ts          # API client
│   │   └── types.ts        # TypeScript interfaces
│   └── index.css           # Spotify theme
├── public/
│   └── favicon.svg
├── .env.template
├── package.json
└── vite.config.ts
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/auth/login` | Redirect to Spotify OAuth |
| GET | `/api/auth/callback` | OAuth callback |
| GET | `/api/auth/status` | Check if host is authenticated |
| GET | `/api/search?q=<query>` | Search Spotify tracks |
| GET | `/api/now-playing` | Get currently playing track |
| GET | `/api/queue` | Get song queue |
| POST | `/api/queue` | Add song to queue |
| GET | `/api/state` | Combined now-playing + queue |

## Rate Limiting

- **Limit**: 5 songs per 10 minutes per user
- **Identification**: Uses IP address (production) or browser fingerprint (development)
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Tech Stack

- **Frontend**: Preact, TailwindCSS, TypeScript
- **Backend**: Express 5, TypeScript
- **Build**: Vite
- **Styling**: Spotify-inspired dark theme

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (frontend) |
| `npm run server` | Start Express server (backend) |
| `npm run build` | Build for production |
| `npm run prod` | Build and run production server |
| `npm run preview` | Preview production build |

## License

MIT
