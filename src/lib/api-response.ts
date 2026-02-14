import { NextResponse } from "next/server";
import { OpenClawError } from "./openclaw";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ ok: true, data }, { status });
}

export function err(error: unknown, fallbackStatus = 500) {
  if (error instanceof OpenClawError) {
    const status =
      error.code === "OPENCLAW_NOT_CONFIGURED" ? 503 :
      error.code === "OPENCLAW_CONNECTION_FAILED" ? 503 :
      error.code === "OPENCLAW_TIMEOUT" ? 504 :
      error.code === "OPENCLAW_INVALID_ID" ? 400 :
      error.code === "OPENCLAW_INVALID_RESPONSE" ? 502 :
      error.code === "OPENCLAW_SSH_ERROR" ? 502 :
      500;
    return NextResponse.json(
      { ok: false, error: { code: error.code, message: error.message } },
      { status }
    );
  }

  const message =
    error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    { ok: false, error: { code: "INTERNAL", message } },
    { status: fallbackStatus }
  );
}
