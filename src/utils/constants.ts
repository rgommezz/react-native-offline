import { SemaphoreColor } from '../types';

export const CACHE_HEADER_VALUE = 'no-cache, no-store, must-revalidate';
export const DEFAULT_TIMEOUT = 10000;
export const DEFAULT_PING_SERVER_URL = 'https://www.google.com/';
export const DEFAULT_HTTP_METHOD = 'HEAD';
export const SEMAPHORE_COLOR: Record<SemaphoreColor, SemaphoreColor> = {
  RED: 'RED',
  GREEN: 'GREEN',
};
