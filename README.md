# Mission Control

Control plane UI for the OpenClaw runtime. Mission Control schedules, monitors, and displays results — OpenClaw executes.

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Live Mode vs Mock Mode

Mission Control operates in one of two modes:

### Mock Mode (default)

When `OPENCLAW_SSH_HOST` is **not set**, the app serves hardcoded sample data. No SSH connection is made. This is the default for local development.

### Live Mode

When `OPENCLAW_SSH_HOST` is set, all API routes proxy commands to the OpenClaw runtime over SSH.

#### Required Environment Variables

Create `.env.local` (see `.env.local.example`):

```env
# Required — user@host of your OpenClaw VM
OPENCLAW_SSH_HOST=azureuser@vm-openclaw

# Optional — defaults shown
OPENCLAW_SSH_PORT=22
OPENCLAW_SSH_IDENTITY_FILE=~/.ssh/id_openclaw
OPENCLAW_SSH_OPTS=
OPENCLAW_TIMEOUT_MS=30000
```

#### Testing Connectivity

Once configured, hit the health endpoint:

```bash
# Use cached status (30s TTL)
curl http://localhost:3000/api/health/openclaw

# Force a fresh probe
curl http://localhost:3000/api/health/openclaw?refresh=1
```

Response:

```json
{
  "ok": true,
  "data": {
    "mode": "live",
    "connected": true,
    "latencyMs": 245,
    "lastChecked": "2026-02-12T12:00:00.000Z",
    "config": {
      "mode": "live",
      "host": "***@vm-openclaw",
      "port": "22",
      "identityFile": "(set)",
      "timeoutMs": "30000"
    }
  }
}
```

#### Troubleshooting

| Symptom | Check |
|---------|-------|
| `OPENCLAW_CONNECTION_FAILED` (503) | SSH key auth failing — verify `ssh azureuser@vm-openclaw` works manually |
| `OPENCLAW_TIMEOUT` (504) | VM unreachable or OpenClaw CLI hanging — check network / firewall |
| `OPENCLAW_INVALID_RESPONSE` (502) | OpenClaw CLI returned non-JSON — check `openclaw` is installed on the VM |
| `OPENCLAW_SSH_ERROR` (502) | Remote command failed — check OpenClaw logs on the VM |
| All routes return mock data | `OPENCLAW_SSH_HOST` is not set in `.env.local` |

#### Error Codes

All API errors follow a consistent format:

```json
{
  "ok": false,
  "error": {
    "code": "OPENCLAW_CONNECTION_FAILED",
    "message": "Human-readable description (secrets redacted)"
  }
}
```

#### Connection Caching

To avoid SSH overhead on every request, connection status is cached in-memory for 30 seconds. When the cache reports `disconnected`, API routes return `503` immediately without attempting SSH. The cache auto-expires, or you can force-refresh via the health endpoint.

#### Architecture

```
Browser  →  Next.js API Routes  →  SSH  →  OpenClaw VM
                ↕
          src/lib/openclaw.ts    (single integration point)
          src/lib/live-mode.ts   (mode detection + connection cache)
          src/lib/config.ts      (env parsing + validation)
```

The browser never talks to OpenClaw directly. All interaction is server-side only through `src/lib/openclaw.ts`.
