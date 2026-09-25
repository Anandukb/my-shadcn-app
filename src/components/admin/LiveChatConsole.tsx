// src/components/admin/LiveChatConsole.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle, ArrowLeft, BellRing, CheckCircle2, Loader2, Mail,
  MessageSquareText, MessagesSquare, Phone, Send, XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { extractErrorMessage } from "@/lib/extract-error-message";
import type { ChatMessage, ChatSession, ChatStatus } from "@/lib/live-chat/types";
import {
  LIVE_CHAT_SESSIONS_KEY,
  liveChatMessagesKey,
  useChatSessions,
} from "@/components/admin/useLiveChatRealtime";

const STATUS_TABS: { value: ChatStatus; label: string }[] = [
  { value: "waiting", label: "Waiting" },
  { value: "active", label: "Active" },
  { value: "closed", label: "Closed" },
];

const STATUS_BADGE: Record<ChatStatus, string> = {
  waiting: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  closed: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

function relativeTime(iso: string): string {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

async function postAction(url: string, body?: unknown, fallback = "Request failed") {
  const res = await fetch(url, {
    method: "POST",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(await extractErrorMessage(res, fallback));
  return res.json();
}

function DesktopAlertsButton() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  if (permission === "unsupported" || permission === "granted") return null;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={permission === "denied"}
      onClick={async () => setPermission(await Notification.requestPermission())}
      className="gap-2 border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg text-xs"
    >
      <BellRing className="h-3.5 w-3.5" />
      {permission === "denied" ? "Desktop alerts blocked in browser" : "Enable desktop alerts"}
    </Button>
  );
}

function Conversation({ session, onBack }: { session: ChatSession; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: liveChatMessagesKey(session.id),
    queryFn: async () => {
      const res = await fetch(`/api/admin/chat/sessions/${session.id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load conversation"));
      return (await res.json()) as { session: ChatSession; messages: ChatMessage[] };
    },
  });

  const refreshAll = () => {
    void queryClient.invalidateQueries({ queryKey: liveChatMessagesKey(session.id) });
    void queryClient.invalidateQueries({ queryKey: LIVE_CHAT_SESSIONS_KEY });
  };

  const accept = useMutation({
    mutationFn: () => postAction(`/api/admin/chat/sessions/${session.id}/accept`, undefined, "Failed to accept chat"),
    onSuccess: refreshAll,
  });
  const close = useMutation({
    mutationFn: () => postAction(`/api/admin/chat/sessions/${session.id}/close`, undefined, "Failed to end chat"),
    onSuccess: refreshAll,
  });
  const send = useMutation({
    mutationFn: (body: string) =>
      postAction(`/api/admin/chat/sessions/${session.id}/messages`, { body }, "Failed to send message"),
    onSuccess: () => {
      setDraft("");
      refreshAll();
    },
  });

  const messages = data?.messages ?? [];
  const current = data?.session ?? session;
  const actionError = accept.error ?? close.error ?? send.error;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (body) send.mutate(body);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Visitor details */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="icon" onClick={onBack} className="lg:hidden text-slate-400 hover:text-white">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-white truncate">{current.name}</p>
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[current.status]}`}>
                {current.status}
              </span>
              {current.querySubmittedAt && (
                <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                  Query left
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
              <a href={`mailto:${current.email}`} className="flex items-center gap-1 hover:text-blue-400">
                <Mail className="h-3 w-3" /> {current.email}
              </a>
              <a href={`tel:${current.phone}`} className="flex items-center gap-1 hover:text-blue-400">
                <Phone className="h-3 w-3" /> {current.phone}
              </a>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {current.status === "waiting" && (
            <Button
              size="sm"
              onClick={() => accept.mutate()}
              disabled={accept.isPending}
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
            >
              {accept.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Accept chat
            </Button>
          )}
          {current.status !== "closed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => close.mutate()}
              disabled={close.isPending}
              className="gap-2 border-slate-800 bg-slate-900 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg font-bold"
            >
              <XCircle className="h-4 w-4" />
              End chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto p-4">
        {isLoading && (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        )}
        {error && <p className="text-sm text-red-400">{(error as Error).message}</p>}
        {!isLoading && messages.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">No messages yet — the visitor is waiting for you.</p>
        )}
        {messages.map((m) =>
          m.sender === "system" ? (
            <p key={m.id} className="py-1 text-center text-[11px] text-slate-500">{m.body}</p>
          ) : m.kind === "query" ? (
            <div key={m.id} className="rounded-xl border border-violet-500/30 bg-violet-500/10 p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-violet-300">
                <MessageSquareText className="h-3.5 w-3.5" />
                Offline query — no agent connected
              </p>
              <p className="whitespace-pre-wrap break-words text-sm text-slate-100">{m.body}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {new Date(m.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                {" · "}Reply here by accepting the chat, or contact them by email/phone.
              </p>
            </div>
          ) : (
            <div key={m.id} className={`flex ${m.sender === "agent" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm ${
                  m.sender === "agent"
                    ? "rounded-br-sm bg-blue-600 text-white"
                    : "rounded-bl-sm bg-slate-800 text-slate-100"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p className="mt-0.5 text-[10px] opacity-60">
                  {new Date(m.createdAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-slate-800/60 p-3">
        {actionError && (
          <p className="mb-2 flex items-center gap-1.5 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" /> {(actionError as Error).message}
          </p>
        )}
        {current.status === "active" ? (
          <form onSubmit={handleSend} className="flex items-end gap-2">
            <textarea
              rows={2}
              maxLength={2000}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  e.currentTarget.form?.requestSubmit();
                }
              }}
              placeholder="Type a reply… (Enter to send, Shift+Enter for a new line)"
              className="flex-1 resize-none rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 outline-none focus:border-blue-500"
            />
            <Button
              type="submit"
              disabled={send.isPending || !draft.trim()}
              className="h-11 w-11 rounded-xl bg-blue-600 hover:bg-blue-500 p-0"
              aria-label="Send reply"
            >
              {send.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        ) : (
          <p className="py-2 text-center text-xs text-slate-500">
            {current.status === "waiting" ? "Accept the chat to start replying." : "This chat has ended."}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LiveChatConsole() {
  const { data: sessions = [], isLoading, error } = useChatSessions();
  const [tab, setTab] = useState<ChatStatus>("waiting");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const counts = {
    waiting: sessions.filter((s) => s.status === "waiting").length,
    active: sessions.filter((s) => s.status === "active").length,
    closed: sessions.filter((s) => s.status === "closed").length,
  };
  const visible = sessions.filter((s) => s.status === tab);
  const selected = sessions.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-400">
          Visitors who start a chat from the website appear here instantly.
        </p>
        <DesktopAlertsButton />
      </div>

      <div className="grid h-[calc(100vh-13rem)] min-h-[480px] grid-cols-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 lg:grid-cols-[320px_1fr]">
        {/* Session list */}
        <div className={`flex flex-col border-slate-800 lg:border-r ${selected ? "hidden lg:flex" : "flex"}`}>
          <div className="flex gap-1 border-b border-slate-800/60 p-2">
            {STATUS_TABS.map((s) => (
              <button
                key={s.value}
                onClick={() => setTab(s.value)}
                className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold transition-colors ${
                  tab === s.value ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                {s.label}
                {counts[s.value] > 0 && (
                  <span className={`ml-1.5 rounded-full px-1.5 text-[10px] ${
                    s.value === "waiting" && tab !== "waiting" ? "bg-amber-500 text-slate-950" : "bg-white/15"
                  }`}>
                    {counts[s.value]}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {isLoading && (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}
            {error && <p className="p-4 text-sm text-red-400">{(error as Error).message}</p>}
            {!isLoading && visible.length === 0 && (
              <div className="flex flex-col items-center gap-2 px-6 py-12 text-center text-slate-500">
                <MessagesSquare className="h-8 w-8" />
                <p className="text-sm">No {tab} chats.</p>
              </div>
            )}
            {visible.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedId(s.id)}
                className={`w-full border-b border-slate-800/40 px-4 py-3 text-left transition-colors ${
                  s.id === selectedId ? "bg-slate-800/70" : "hover:bg-slate-800/30"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-bold text-white">{s.name}</span>
                  <span className="shrink-0 text-[10px] text-slate-500">{relativeTime(s.lastMessageAt)}</span>
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-400">{s.email}</p>
                {s.status === "active" && s.agentName && (
                  <p className="mt-1 text-[10px] font-semibold text-emerald-400">with {s.agentName}</p>
                )}
                {s.status === "waiting" && !s.querySubmittedAt && (
                  <p className="mt-1 text-[10px] font-semibold text-amber-400">Waiting since {relativeTime(s.createdAt)}</p>
                )}
                {s.querySubmittedAt && (
                  <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-violet-300">
                    <MessageSquareText className="h-3 w-3" />
                    Query left {relativeTime(s.querySubmittedAt)}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation */}
        <div className={`min-h-0 ${selected ? "block" : "hidden lg:block"}`}>
          {selected ? (
            <Conversation key={selected.id} session={selected} onBack={() => setSelectedId(null)} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-500">
              <MessagesSquare className="h-10 w-10" />
              <p className="text-sm">Select a chat to view the conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
