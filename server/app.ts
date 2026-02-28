import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import views from './views/index.ts';
import apiRoutes from './routes/api.ts';

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
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

// View routes
views(app);

export default app;