import { QueueItem, Track } from '../types/index.ts';
import crypto from 'crypto';

const queue: QueueItem[] = [];

export function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip).digest('hex').substring(0, 8);
}

export function getQueue(): QueueItem[] {
  return [...queue];
}

export function addToQueue(track: Track, clientIP: string): QueueItem {
  const item: QueueItem = {
    track,
    addedAt: Date.now(),
    addedBy: hashIP(clientIP),
  };
  queue.push(item);
  return item;
}

export function removeFromQueue(trackId: string): boolean {
  const index = queue.findIndex((item) => item.track.id === trackId);
  if (index === -1) return false;
  queue.splice(index, 1);
  return true;
}

export function clearQueue(): void {
  queue.length = 0;
}

export function isTrackInQueue(trackId: string): boolean {
  return queue.some((item) => item.track.id === trackId);
}
