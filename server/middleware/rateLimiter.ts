import { Request, Response, NextFunction } from 'express';
import { RateLimitInfo } from '../types/index.ts';
import crypto from 'crypto';

const RATE_LIMIT = 10; // songs
const RATE_WINDOW = 5 * 60 * 1000; // 5 minutes in ms

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

function hashIdentifier(id: string): string {
  return crypto.createHash('sha256').update(id).digest('hex').substring(0, 16);
}

export function getClientIdentifier(req: Request): string {
  // Try X-Forwarded-For header first (for proxied requests)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    if (ip && ip !== '127.0.0.1' && ip !== '::1') {
      return ip;
    }
  }

  // Try X-Real-IP header
  const realIp = req.headers['x-real-ip'];
  if (realIp && typeof realIp === 'string') {
    return realIp;
  }

  // Try custom client ID header (for development/testing)
  const clientId = req.headers['x-client-id'];
  if (clientId && typeof clientId === 'string') {
    return clientId;
  }

  // Fall back to req.ip or socket address
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function getRateLimitInfo(identifier: string): RateLimitInfo {
  const key = hashIdentifier(identifier);
  const now = Date.now();
  let info = rateLimitMap.get(key);

  if (!info || info.resetAt <= now) {
    info = { count: 0, resetAt: now + RATE_WINDOW };
    rateLimitMap.set(key, info);
  }

  return info;
}

export function incrementRateLimit(identifier: string): void {
  const info = getRateLimitInfo(identifier);
  info.count++;
}

export function rateLimiter(req: Request, res: Response, next: NextFunction): void {
  const clientId = getClientIdentifier(req);
  const info = getRateLimitInfo(clientId);

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
