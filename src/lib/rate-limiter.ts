/**
 * Production-ready Sliding Window Counter Rate Limiter
 * Suitable for Next.js App Router Edge / Node.js Express middleware and in-memory caches.
 */

export interface RateLimitConfig {
  maxRequests: number; // max requests allowed within windowMs
  windowMs: number;    // window duration in milliseconds
  endpointName: string;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Epoch timestamp ms
  retryAfterSeconds?: number;
  clientIp: string;
  endpoint: string;
}

// In-memory sliding window request store
interface RequestLog {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RequestLog>();

// Default Rate Limiting Policies
export const RATE_LIMIT_POLICIES = {
  CHECKOUT: {
    maxRequests: 5,
    windowMs: 60 * 1000, // 5 requests per minute
    endpointName: '/api/checkout',
  },
  ORDER_LOOKUP: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 10 lookups per minute
    endpointName: '/api/orders/lookup',
  },
  ADMIN_MUTATION: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 30 per minute
    endpointName: '/api/admin',
  },
} as const;

/**
 * Check rate limit for a given client identifier and policy
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `${config.endpointName}:${clientId}`;

  let clientLog = rateLimitStore.get(key);
  if (!clientLog) {
    clientLog = { timestamps: [] };
    rateLimitStore.set(key, clientLog);
  }

  // Prune timestamps older than window
  clientLog.timestamps = clientLog.timestamps.filter((ts) => ts > windowStart);

  const requestCount = clientLog.timestamps.length;
  const isAllowed = requestCount < config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - requestCount - (isAllowed ? 1 : 0));
  
  // Oldest timestamp in current window determines reset
  const oldestTs = clientLog.timestamps[0] || now;
  const resetTime = oldestTs + config.windowMs;
  const retryAfterSeconds = isAllowed
    ? undefined
    : Math.ceil((resetTime - now) / 1000);

  if (isAllowed) {
    clientLog.timestamps.push(now);
  }

  return {
    success: isAllowed,
    limit: config.maxRequests,
    remaining: isAllowed ? remaining : 0,
    resetTime,
    retryAfterSeconds,
    clientIp: clientId,
    endpoint: config.endpointName,
  };
}

/**
 * Reset rate limit history for a client (useful in testing)
 */
export function resetRateLimitStore(clientId?: string) {
  if (clientId) {
    for (const key of rateLimitStore.keys()) {
      if (key.includes(clientId)) {
        rateLimitStore.delete(key);
      }
    }
  } else {
    rateLimitStore.clear();
  }
}

/**
 * Get current rate limit stats for display
 */
export function getRateLimitStats(clientId: string, config: RateLimitConfig) {
  const now = Date.now();
  const windowStart = now - config.windowMs;
  const key = `${config.endpointName}:${clientId}`;
  const clientLog = rateLimitStore.get(key);

  const validTimestamps = (clientLog?.timestamps || []).filter((ts) => ts > windowStart);
  return {
    used: validTimestamps.length,
    remaining: Math.max(0, config.maxRequests - validTimestamps.length),
    limit: config.maxRequests,
  };
}
