import { Request, Response, NextFunction } from 'express';
import { RateLimitInfo } from '../types/index.ts';
import { hashIP } from '../services/queueService.ts';

const RATE_LIMIT = 5; // songs
const RATE_WINDOW = 10 * 60 * 1000; // 10 minutes in ms

const rateLimitMap = new Map<string, RateLimitInfo>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, info] of rateLimitMap.entries()) {
    if (info.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 60000); // Clean every minute

export function getRateLimitInfo(ip: string): RateLimitInfo {
  const key = hashIP(ip);
  const now = Date.now();
  let info = rateLimitMap.get(key);

  if (!info || info.resetAt <= now) {
    info = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimitMap.set(key, info);
  }

  return info;
}

export function incrementRateLimit(ip: string): void {
  const info = getRateLimitInfo(ip);
  info.count++;
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const info = getRateLimitInfo(ip);

  // Set rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
  res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - info.count));
  res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetAt / 1000));

  if (info.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((info.resetAt - Date.now()) / 1000);
    res.setHeader('Retry-After', retryAfter);
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: `You can add up to ${RATE_LIMIT} songs per 10 minutes`,
      retryAfter,
    });
    return;
  }

  next();
}
