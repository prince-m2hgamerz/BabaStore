const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit({
  key,
  maxRequests = 60,
  windowMs = 60_000
}: {
  key: string;
  maxRequests?: number;
  windowMs?: number;
}): { ok: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxRequests - 1, resetIn: windowMs };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    return {
      ok: false,
      remaining: 0,
      resetIn: entry.resetAt - now
    };
  }

  return {
    ok: true,
    remaining: maxRequests - entry.count,
    resetIn: entry.resetAt - now
  };
}
