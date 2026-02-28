import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './routes/api.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// CORS configuration (disabled in production since we serve from same origin)
app.use(cors({
  origin: isProduction
    ? false
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Security headers with CSP allowing Spotify images
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https://i.scdn.co'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));

// Trust proxy for rate limiting (to get real IP)
app.set('trust proxy', 1);

// API routes
app.use('/api', apiRoutes);

// In production, serve static files from dist
if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // SPA fallback - serve index.html for all non-API routes (Express 5 syntax)
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

export default app;