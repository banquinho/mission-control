"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { OpenClawSettings } from "@/types/settings";

export function ConnectionSettings() {
  const [settings, setSettings] = useState<OpenClawSettings | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setSettings(json.data);
      })
      .catch(() => {});
  }, []);

  const testConnection = useCallback(async () => {
    setTesting(true);
    try {
      const res = await fetch("/api/health/openclaw?refresh=1");
      const json = await res.json();
      if (json.ok) setConnected(json.data.connected);
    } catch {}
    setTesting(false);
  }, []);

  const isMock = settings?.mode === "mock";

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">
            OpenClaw Connection
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            Configured via environment variables.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isMock
              ? "bg-zinc-800 text-zinc-400"
              : connected === true
                ? "bg-emerald-950 text-emerald-400"
                : connected === false
                  ? "bg-red-950 text-red-400"
                  : "bg-zinc-800 text-zinc-500"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isMock
                ? "bg-zinc-500"
                : connected === true
                  ? "bg-emerald-400"
                  : connected === false
                    ? "bg-red-400"
                    : "bg-zinc-600"
            }`}
          />
          {isMock
            ? "Mock"
            : connected === true
              ? "Connected"
              : connected === false
                ? "Disconnected"
                : "Unknown"}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <Row label="Mode" value={settings?.mode ?? "—"} />
        {!isMock && settings?.sshHost && (
          <Row label="SSH Host" value={settings.sshHost} />
        )}
        {!isMock && settings?.sshPort != null && (
          <Row label="SSH Port" value={String(settings.sshPort)} />
        )}
        {!isMock && settings?.remoteCwd && (
          <Row label="Remote CWD" value={settings.remoteCwd} />
        )}
        {!isMock && settings?.timeoutMs != null && (
          <Row label="Timeout" value={`${settings.timeoutMs}ms`} />
        )}
        {!isMock && settings?.cliPrefix && (
          <Row label="CLI Prefix" value={settings.cliPrefix} />
        )}
      </div>

      <div className="mt-5">
        <button
          disabled={testing}
          onClick={testConnection}
          className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100 disabled:opacity-50"
        >
          {testing ? "Testing…" : "Test Connection"}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className="font-mono text-sm text-zinc-300">{value}</span>
    </div>
  );
}
