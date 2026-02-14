import { getOpenClawConfig } from "./config";
import {
  testConnection,
  OpenClawError,
  type ConnectionTestResult,
} from "./openclaw";

// ── Mode check ──────────────────────────────────────────────

/**
 * Live mode is enabled when OPENCLAW_SSH_HOST is set.
 */
export function isLiveMode(): boolean {
  return getOpenClawConfig() !== null;
}

// ── Connection status cache ─────────────────────────────────

const CACHE_TTL_MS = 30_000;

interface CachedStatus {
  result: ConnectionTestResult;
  checkedAt: number; // Date.now()
}

let _cache: CachedStatus | null = null;

/**
 * Return the cached connection status, refreshing if stale or missing.
 * Safe to call frequently — won't SSH more than once per TTL window.
 */
export async function getConnectionStatus(): Promise<
  ConnectionTestResult & { lastChecked: string }
> {
  const now = Date.now();

  if (_cache && now - _cache.checkedAt < CACHE_TTL_MS) {
    return {
      ..._cache.result,
      lastChecked: new Date(_cache.checkedAt).toISOString(),
    };
  }

  const result = await testConnection();
  _cache = { result, checkedAt: now };

  return {
    ...result,
    lastChecked: new Date(now).toISOString(),
  };
}

/**
 * Force-refresh the cache (e.g. from health endpoint with ?refresh=1).
 */
export async function refreshConnectionStatus(): Promise<
  ConnectionTestResult & { lastChecked: string }
> {
  _cache = null;
  return getConnectionStatus();
}

/**
 * Peek at the cached status without triggering a refresh.
 * Returns null if nothing has been cached yet.
 */
export function peekConnectionStatus(): (ConnectionTestResult & { lastChecked: string }) | null {
  if (!_cache) return null;
  return {
    ..._cache.result,
    lastChecked: new Date(_cache.checkedAt).toISOString(),
  };
}

// ── Route guard ─────────────────────────────────────────────

/**
 * Call at the top of live-mode API routes. If the connection cache says
 * we're disconnected, this throws an OpenClawError so the route returns
 * 503 without attempting a full SSH command.
 *
 * If the cache is empty (first request), it allows the call through
 * so the real command can populate the cache implicitly.
 */
export function requireConnected(): void {
  if (!isLiveMode()) return; // mock mode, nothing to guard

  const cached = peekConnectionStatus();
  // No cache yet — let the request through; it will fail or succeed naturally
  if (!cached) return;
  // Cache exists and we're connected — proceed
  if (cached.connected) return;

  // Cache says disconnected and it's still fresh
  const age = Date.now() - new Date(cached.lastChecked).getTime();
  if (age < CACHE_TTL_MS) {
    throw new OpenClawError(
      "OPENCLAW_CONNECTION_FAILED",
      "OpenClaw is unreachable (cached status). Retry after 30s or call GET /api/health/openclaw?refresh=1"
    );
  }
  // Cache is stale — let the request through to re-probe
}
