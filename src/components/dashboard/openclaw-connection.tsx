"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { StatusDot } from "@/components/ui/status-dot";
import { Badge } from "@/components/ui/badge";

interface HealthData {
  mode: string;
  connected: boolean;
  latencyMs?: number;
  lastChecked: string;
  config?: Record<string, string>;
}

const POLL_INTERVAL = 15_000;

export function OpenClawConnection() {
  const [data, setData] = useState<HealthData | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchHealth = useCallback(async (refresh = false) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const url = refresh
        ? "/api/health/openclaw?refresh=1"
        : "/api/health/openclaw";
      const res = await fetch(url, { signal: controller.signal });
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        setError(false);
      } else {
        setError(true);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
    const id = setInterval(() => fetchHealth(), POLL_INTERVAL);
    return () => {
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, [fetchHealth]);

  async function handleRefresh() {
    setRefreshing(true);
    await fetchHealth(true);
    setRefreshing(false);
  }

  const connected = data?.connected ?? false;
  const mode = data?.mode ?? "unknown";
  const isMock = mode === "mock";

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-100">
          OpenClaw Connection
        </h2>
        <div className="flex items-center gap-2">
          <StatusDot
            color={
              isMock
                ? "bg-blue-400"
                : connected
                  ? "bg-green-500"
                  : error
                    ? "bg-yellow-400"
                    : "bg-red-500"
            }
            pulse={connected && !isMock}
          />
          <Badge
            className={
              isMock
                ? "bg-blue-900 text-blue-300"
                : connected
                  ? "bg-green-900 text-green-300"
                  : "bg-red-900 text-red-300"
            }
          >
            {isMock ? "Mock" : connected ? "Connected" : error && !data ? "Unknown" : "Disconnected"}
          </Badge>
        </div>
      </div>

      <div className="mt-4 space-y-2 text-sm">
        <Row label="Mode" value={mode} />
        {!isMock && data?.latencyMs != null && (
          <Row label="Latency" value={`${data.latencyMs}ms`} />
        )}
        {data?.lastChecked && (
          <Row
            label="Last Checked"
            value={new Date(data.lastChecked).toLocaleTimeString()}
          />
        )}
        {!isMock && data?.connected === false && data.config?.host && (
          <Row label="Host" value={data.config.host} />
        )}
      </div>

      <div className="mt-4">
        <button
          disabled={refreshing}
          onClick={handleRefresh}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
        >
          {refreshing ? "Checking..." : "Refresh"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      <span className="font-mono text-zinc-200">{value}</span>
    </div>
  );
}
