"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/ui/status-dot";
import type { MailboxMessage } from "@/types/mailbox";

const AGENTS = ["mission-control", "openclaw-primary", "data-processor"];

const inputClass =
  "w-full rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";
const selectClass =
  "rounded-md border border-zinc-800 bg-transparent px-3 py-2 text-sm text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500";

export default function MailboxPage() {
  const [agentId, setAgentId] = useState(AGENTS[0]);
  const [messages, setMessages] = useState<MailboxMessage[]>([]);
  const [selected, setSelected] = useState<MailboxMessage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchMessages = useCallback(
    async (agent: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/mailbox?agentId=${encodeURIComponent(agent)}`, {
          signal: controller.signal,
        });
        const json = await res.json();
        if (json.ok) {
          setMessages(json.data);
        } else {
          setError(json.error?.message ?? "Failed to load messages");
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchMessages(agentId);
    return () => abortRef.current?.abort();
  }, [agentId, fetchMessages]);

  async function handleAck(messageId: string) {
    try {
      const res = await fetch("/api/mailbox/ack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId, messageId }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
        if (selected?.id === messageId) setSelected(null);
      }
    } catch {
      // silently fail — message stays in list
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Mailbox
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Inter-agent messaging and requests.
          </p>
        </div>
        <button
          onClick={() => setShowCompose((v) => !v)}
          className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-white"
        >
          {showCompose ? "Cancel" : "Compose"}
        </button>
      </div>

      {/* Agent selector */}
      <div className="mt-6 flex gap-2">
        {AGENTS.map((id) => (
          <button
            key={id}
            onClick={() => {
              setAgentId(id);
              setSelected(null);
            }}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              agentId === id
                ? "bg-zinc-100 text-zinc-950"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {id}
          </button>
        ))}
      </div>

      {showCompose && (
        <>
          <hr className="my-6 border-zinc-800" />
          <ComposeForm
            fromAgent={agentId}
            agents={AGENTS}
            onSent={() => {
              setShowCompose(false);
              fetchMessages(agentId);
            }}
          />
        </>
      )}

      {error && (
        <div className="mt-6 rounded-md border border-red-800 bg-red-950/30 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <hr className="my-6 border-zinc-800" />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Inbox list */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-100">
              Inbox ({messages.length})
            </h2>
            <button
              disabled={loading}
              onClick={() => fetchMessages(agentId)}
              className="text-xs text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
          <div className="mt-4 max-h-[500px] space-y-1 overflow-y-auto">
            {messages.length === 0 && !loading && (
              <p className="py-4 text-center text-sm text-zinc-500">No messages</p>
            )}
            {messages.map((msg) => (
              <button
                key={msg.id}
                onClick={() => setSelected(msg)}
                className={`w-full rounded-md p-3 text-left transition-colors ${
                  selected?.id === msg.id
                    ? "bg-zinc-800/50"
                    : "hover:bg-zinc-800/20"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-200">
                    {msg.subject}
                  </span>
                  <TypeBadge type={msg.type} />
                </div>
                <div className="mt-1 flex items-center gap-2 text-xs text-zinc-500">
                  <span>From: {msg.from}</span>
                  <span>&middot;</span>
                  <span>{new Date(msg.ts).toLocaleString()}</span>
                  {msg.meta?.priority && msg.meta.priority !== "normal" && (
                    <PriorityBadge priority={msg.meta.priority} />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message viewer */}
        <div>
          <h2 className="text-sm font-medium text-zinc-100">Message</h2>
          {selected ? (
            <div className="mt-4 space-y-4">
              <div className="space-y-2 text-sm">
                <Row label="Subject" value={selected.subject} />
                <Row label="From" value={selected.from} mono />
                <Row label="To" value={selected.to} mono />
                <Row label="Type"><TypeBadge type={selected.type} /></Row>
                <Row label="Time" value={new Date(selected.ts).toLocaleString()} />
                {selected.meta?.priority && (
                  <Row label="Priority">
                    <PriorityBadge priority={selected.meta.priority} />
                  </Row>
                )}
                {selected.replyTo && (
                  <Row label="Reply To" value={selected.replyTo} mono />
                )}
              </div>
              <div className="rounded-md bg-zinc-800/30 p-3">
                <pre className="whitespace-pre-wrap text-sm text-zinc-300">
                  {selected.body}
                </pre>
              </div>
              <button
                onClick={() => handleAck(selected.id)}
                className="rounded-md border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-600 hover:bg-zinc-800 hover:text-zinc-100"
              >
                Acknowledge
              </button>
            </div>
          ) : (
            <p className="mt-4 py-8 text-center text-sm text-zinc-500">
              Select a message to view
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    MESSAGE: "bg-blue-900 text-blue-300",
    REQUEST: "bg-amber-900 text-amber-300",
    RESPONSE: "bg-green-900 text-green-300",
  };
  return <Badge className={colors[type] ?? ""}>{type}</Badge>;
}

function PriorityBadge({ priority }: { priority: string }) {
  return (
    <span className="flex items-center gap-1">
      <StatusDot
        color={priority === "high" ? "bg-red-500" : "bg-zinc-500"}
        pulse={priority === "high"}
      />
      <span className="text-xs text-zinc-400">{priority}</span>
    </span>
  );
}

function Row({
  label,
  value,
  mono,
  children,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-zinc-500">{label}</span>
      {children ?? (
        <span className={`${mono ? "font-mono text-xs" : ""} text-zinc-200`}>
          {value}
        </span>
      )}
    </div>
  );
}

// ── Compose form ───────────────────────────────────────────

function ComposeForm({
  fromAgent,
  agents,
  onSent,
}: {
  fromAgent: string;
  agents: string[];
  onSent: () => void;
}) {
  const [to, setTo] = useState(agents.find((a) => a !== fromAgent) ?? agents[0]);
  const [type, setType] = useState<"MESSAGE" | "REQUEST" | "RESPONSE">("MESSAGE");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/mailbox/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAgent,
          to,
          type,
          subject,
          body,
          meta: { priority },
        }),
      });
      const json = await res.json();
      if (json.ok) {
        onSent();
      } else {
        setError(json.error?.message ?? "Failed to send");
      }
    } catch {
      setError("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <div>
      <h2 className="text-sm font-medium text-zinc-100">Compose Message</h2>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div className="flex gap-3">
          <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
            {agents
              .filter((a) => a !== fromAgent)
              .map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
          </select>
          <select value={type} onChange={(e) => setType(e.target.value as typeof type)} className={selectClass}>
            <option value="MESSAGE">MESSAGE</option>
            <option value="REQUEST">REQUEST</option>
            <option value="RESPONSE">RESPONSE</option>
          </select>
          <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className={selectClass}>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          required
          className={inputClass}
        />
        <textarea
          placeholder="Message body..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          maxLength={10000}
          required
          rows={4}
          className={inputClass}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="rounded-md bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-950 transition-colors hover:bg-white disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
}
