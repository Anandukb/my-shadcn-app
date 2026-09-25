"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, CheckCircle2, ChevronDown, Loader2, Mail, MessageSquareText, Phone, Send, ShieldCheck, User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/browser";
import type { ChatMessage, VisitorChatSession } from "@/lib/live-chat/types";

const STORAGE_KEY = "maram-live-chat";
const WHATSAPP_NUMBER = "919446678765";
// After this long without an agent accepting, offer the visitor a query form instead.
const QUERY_AFTER_MS = 30 * 1000;
const POLL_OPEN_MS = 4000;
const POLL_CLOSED_MS = 15000;

const BRAND_GRADIENT = "from-[oklch(0.56_0.085_195)] to-[oklch(0.42_0.075_200)]";
const BRAND_BG = "bg-[oklch(0.52_0.08_195)]";
const FOCUS_RING =
  "focus-visible:border-[oklch(0.52_0.08_195)] focus-visible:ring-2 focus-visible:ring-[oklch(0.52_0.08_195)]/20";

const FIELDS = [
  { key: "name", icon: User, type: "text", autoComplete: "name", minLength: 1, maxLength: 100 },
  { key: "email", icon: Mail, type: "email", autoComplete: "email", minLength: 1, maxLength: 200 },
  { key: "phone", icon: Phone, type: "tel", autoComplete: "tel", minLength: 5, maxLength: 30 },
] as const;

interface StoredChat {
  sessionId: string;
  token: string;
  channel: string;
}

function readStoredChat(): StoredChat | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredChat;
    return parsed.sessionId && parsed.token && parsed.channel ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredChat(chat: StoredChat | null) {
  try {
    if (chat) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(chat));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // storage unavailable (private mode) — the chat still works for this page view
  }
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

interface LiveChatPanelProps {
  open: boolean;
  onClose: () => void;
  onUnreadChange: (count: number) => void;
}

export function LiveChatPanel({ open, onClose, onUnreadChange }: LiveChatPanelProps) {
  const t = useTranslations("liveChat");
  const tWhatsApp = useTranslations("whatsapp");
  const [stored, setStored] = useState<StoredChat | null>(() => readStoredChat());
  const [session, setSession] = useState<VisitorChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [draft, setDraft] = useState("");
  const [starting, setStarting] = useState(false);
  const [sending, setSending] = useState(false);
  const [query, setQuery] = useState("");
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const lastIdRef = useRef(0);
  const openRef = useRef(open);
  const unreadRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    openRef.current = open;
    if (open && unreadRef.current > 0) {
      unreadRef.current = 0;
      onUnreadChange(0);
    }
  }, [open, onUnreadChange]);

  const resetChat = useCallback(() => {
    writeStoredChat(null);
    setStored(null);
    setSession(null);
    setMessages([]);
    lastIdRef.current = 0;
  }, []);

  const refresh = useCallback(async () => {
    if (!stored) return;
    // History loaded on page load isn't "new" — only count replies after that.
    const isInitialLoad = lastIdRef.current === 0;
    try {
      const res = await fetch(`/api/chat/sessions/${stored.sessionId}?after=${lastIdRef.current}`, {
        headers: { "x-chat-token": stored.token },
        cache: "no-store",
      });
      if (res.status === 404) {
        resetChat();
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as { session: VisitorChatSession; messages: ChatMessage[] };
      setSession(json.session);
      if (json.messages.length > 0) {
        lastIdRef.current = json.messages[json.messages.length - 1].id;
        setMessages((prev) => {
          const seen = new Set(prev.map((m) => m.id));
          return [...prev, ...json.messages.filter((m) => !seen.has(m.id))];
        });
        if (!openRef.current && !isInitialLoad) {
          const fromAgent = json.messages.filter((m) => m.sender !== "visitor").length;
          if (fromAgent > 0) {
            unreadRef.current += fromAgent;
            onUnreadChange(unreadRef.current);
          }
        }
      }
    } catch {
      // network blip — the next poll retries
    }
  }, [stored, resetChat, onUnreadChange]);

  // Initial load + polling fallback.
  const isClosed = session?.status === "closed";
  useEffect(() => {
    if (!stored || isClosed) return;
    const kickoff = setTimeout(() => void refresh(), 0);
    const interval = setInterval(() => void refresh(), open ? POLL_OPEN_MS : POLL_CLOSED_MS);
    return () => {
      clearTimeout(kickoff);
      clearInterval(interval);
    };
  }, [stored, isClosed, open, refresh]);

  // Instant updates: the server pings this broadcast channel on every agent action.
  useEffect(() => {
    if (!stored || isClosed) return;
    const supabase = createClient();
    const channel = supabase
      .channel(stored.channel)
      .on("broadcast", { event: "update" }, () => void refresh())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [stored, isClosed, refresh]);

  // Tick so the query form appears on time without a refetch.
  useEffect(() => {
    if (session?.status !== "waiting") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [session?.status]);

  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, session?.status, open]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setStarting(true);
    setError(null);
    try {
      const res = await fetch("/api/chat/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(res.status === 429 && typeof json.error === "string" ? json.error : t("genericError"));
        return;
      }
      const next: StoredChat = { sessionId: json.session.id, token: json.token, channel: json.channel };
      writeStoredChat(next);
      lastIdRef.current = 0;
      setMessages([]);
      setSession(json.session);
      setNow(Date.now());
      setStored(next);
    } catch {
      setError(t("genericError"));
    } finally {
      setStarting(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = draft.trim();
    if (!stored || !body) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/sessions/${stored.sessionId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-chat-token": stored.token },
        body: JSON.stringify({ body }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(typeof json.error === "string" ? json.error : t("genericError"));
      } else {
        setDraft("");
      }
      await refresh();
    } catch {
      setError(t("genericError"));
    } finally {
      setSending(false);
    }
  };

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = query.trim();
    if (!stored || !body) return;
    setSubmittingQuery(true);
    setError(null);
    try {
      const res = await fetch(`/api/chat/sessions/${stored.sessionId}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-chat-token": stored.token },
        body: JSON.stringify({ body }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof json.error === "string" ? json.error : t("genericError"));
      } else {
        setQuery("");
        setSession(json.session);
      }
      await refresh();
    } catch {
      setError(t("genericError"));
    } finally {
      setSubmittingQuery(false);
    }
  };

  const handleEnd = async () => {
    if (!stored) return;
    await fetch(`/api/chat/sessions/${stored.sessionId}/close`, {
      method: "POST",
      headers: { "x-chat-token": stored.token },
    }).catch(() => undefined);
    await refresh();
  };

  const status = session?.status;
  const elapsed = session ? now - new Date(session.createdAt).getTime() : 0;
  const waitedTooLong = !!session && elapsed > QUERY_AFTER_MS;
  const querySent = status === "waiting" && !!session?.querySubmittedAt;
  const showQueryForm = status === "waiting" && !querySent && waitedTooLong;
  const waitProgress = Math.min(1, elapsed / QUERY_AFTER_MS);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(tWhatsApp("prefilledMessage"))}`;
  const inChat = !!stored && status !== "closed";

  const headerStatus =
    status === "active" && session?.agentName
      ? t("connected", { agent: session.agentName })
      : status === "waiting"
        ? showQueryForm || querySent
          ? t("statusBusy")
          : t("statusWaiting")
        : t("statusOnline");

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-label={t("title")}
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ type: "spring", stiffness: 380, damping: 32 }}
          style={{ transformOrigin: "bottom left" }}
          className="fixed inset-x-3 bottom-3 top-3 flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white text-neutral-800 shadow-[0_24px_60px_-12px_rgba(15,60,65,0.35)] sm:inset-x-auto sm:top-auto sm:bottom-6 sm:left-6 sm:h-[min(620px,calc(100dvh-3rem))] sm:w-[380px] dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          {/* ─── Header ─── */}
          <div className={`relative shrink-0 overflow-hidden bg-gradient-to-br ${BRAND_GRADIENT} px-4 pb-4 pt-4 text-white`}>
            <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-white/10" />
            <div className="pointer-events-none absolute -bottom-16 right-16 h-28 w-28 rounded-full bg-white/5" />

            <div className="relative flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="h-11 w-11 overflow-hidden rounded-full bg-white/90 ring-2 ring-white/40">
                  <video autoPlay loop muted playsInline className="h-full w-full scale-[1.9] object-cover object-[50%_18%]">
                    <source src="/whatsapp-avatar.webm" type="video/webm" />
                  </video>
                </div>
                <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-[#1d6b70] bg-emerald-400" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-semibold leading-tight">
                  {t("assistantName")}
                  {!inChat && <span className="font-normal opacity-75"> · {t("brandName")}</span>}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-white/80">
                  {status === "waiting" && !showQueryForm && !querySent && (
                    <Loader2 className="h-3 w-3 shrink-0 animate-spin" />
                  )}
                  {headerStatus}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                {inChat && (
                  <button
                    type="button"
                    onClick={() => setConfirmEnd(true)}
                    className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/85 transition-colors hover:bg-white/15 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  >
                    {t("endChat")}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                  aria-label={t("minimize")}
                >
                  <ChevronDown className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Progress while we look for an agent */}
            {status === "waiting" && !querySent && !showQueryForm && (
              <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/20">
                <div
                  className="h-full rounded-full bg-white/90 transition-[width] duration-1000 ease-linear"
                  style={{ width: `${Math.max(4, waitProgress * 100)}%` }}
                />
              </div>
            )}
          </div>

          {/* End-chat confirmation */}
          <AnimatePresence>
            {confirmEnd && inChat && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="shrink-0 overflow-hidden border-b border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10"
              >
                <div className="flex items-center justify-between gap-2 px-4 py-2.5">
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">{t("endConfirm")}</p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => setConfirmEnd(false)}
                      className="rounded-full px-3 py-1 text-xs font-semibold text-neutral-600 hover:bg-white dark:text-neutral-300 dark:hover:bg-white/10"
                    >
                      {t("cancel")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmEnd(false);
                        void handleEnd();
                      }}
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
                    >
                      {t("endChat")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!stored ? (
            /* ─── Step 1: visitor details ─── */
            <form onSubmit={handleStart} className="flex flex-1 flex-col overflow-y-auto bg-neutral-50/80 dark:bg-neutral-950/40">
              <div className="space-y-4 p-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5 dark:bg-neutral-800/70 dark:ring-white/5">
                  <p className="text-lg font-semibold">{t("greetingTitle")}</p>
                  <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">{t("greetingBody")}</p>
                </div>

                <div className="space-y-2.5">
                  {FIELDS.map(({ key, icon: Icon, type, autoComplete, minLength, maxLength }) => (
                    <label key={key} className="block">
                      <span className="mb-1 block pl-1 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                        {t(`${key}Label`)}
                      </span>
                      <span className="relative block">
                        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                        <input
                          required
                          type={type}
                          autoComplete={autoComplete}
                          minLength={minLength}
                          maxLength={maxLength}
                          value={form[key]}
                          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                          placeholder={t(`${key}Placeholder`)}
                          className={`h-11 w-full rounded-xl border border-neutral-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800/70 ${FOCUS_RING}`}
                        />
                      </span>
                    </label>
                  ))}
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={starting}
                  className={`group flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${BRAND_GRADIENT} text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition hover:brightness-110 disabled:opacity-60`}
                >
                  {starting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("starting")}
                    </>
                  ) : (
                    <>
                      {t("start")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                    </>
                  )}
                </button>

                <p className="flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("privacyNote")}
                </p>
              </div>

              <div className="mt-auto px-4 pb-4">
                <div className="mb-3 flex items-center gap-3 text-[11px] uppercase tracking-wider text-neutral-400">
                  <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                  {t("orDivider")}
                  <span className="h-px flex-1 bg-neutral-200 dark:bg-neutral-700" />
                </div>
                <WhatsAppButton href={whatsappUrl} label={t("whatsappCta")} />
              </div>
            </form>
          ) : (
            /* ─── Step 2: conversation ─── */
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-neutral-50/80 px-3.5 py-4 dark:bg-neutral-950/40">
                {status === "waiting" && !querySent && (
                  <div className="flex flex-col items-center rounded-2xl bg-white px-4 py-5 text-center shadow-sm ring-1 ring-black/5 dark:bg-neutral-800/70 dark:ring-white/5">
                    {showQueryForm ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
                        <MessageSquareText className="h-5 w-5" />
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5" aria-hidden>
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className={`h-2 w-2 rounded-full ${BRAND_BG}`}
                            animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.18 }}
                          />
                        ))}
                      </div>
                    )}
                    <p className="mt-3 text-sm font-semibold">{showQueryForm ? t("queryTitle") : t("connecting")}</p>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                      {showQueryForm ? t("queryIntro") : t("waitingHint")}
                    </p>
                  </div>
                )}

                {querySent && (
                  <div className="flex flex-col items-center rounded-2xl bg-emerald-50 px-4 py-5 text-center ring-1 ring-emerald-100 dark:bg-emerald-500/10 dark:ring-emerald-500/20">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-300">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="mt-2 text-sm font-semibold text-emerald-800 dark:text-emerald-200">{t("queryReceived")}</p>
                    <p className="mt-1 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-300/80">{t("queryReceivedHint")}</p>
                  </div>
                )}

                {messages.map((m) => {
                  if (m.sender === "system") {
                    return (
                      <div key={m.id} className="flex justify-center">
                        <span className="rounded-full bg-neutral-200/70 px-3 py-1 text-[11px] text-neutral-600 dark:bg-white/10 dark:text-neutral-300">
                          {m.body}
                        </span>
                      </div>
                    );
                  }

                  const mine = m.sender === "visitor";
                  return (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-end gap-2 ${mine ? "justify-end" : "justify-start"}`}
                    >
                      {!mine && (
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${BRAND_BG} text-[11px] font-bold uppercase text-white`}>
                          {(session?.agentName ?? "M").charAt(0)}
                        </span>
                      )}
                      <div
                        className={`max-w-[78%] px-3.5 py-2 text-sm leading-relaxed ${
                          mine
                            ? `rounded-2xl rounded-br-md bg-gradient-to-br ${BRAND_GRADIENT} text-white shadow-sm`
                            : "rounded-2xl rounded-bl-md bg-white shadow-sm ring-1 ring-black/5 dark:bg-neutral-800 dark:ring-white/5"
                        }`}
                      >
                        {m.kind === "query" && (
                          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-75">{t("yourQuery")}</p>
                        )}
                        <p className="whitespace-pre-wrap break-words">{m.body}</p>
                        <p className={`mt-1 text-[10px] ${mine ? "text-right text-white/70" : "text-neutral-400"}`}>
                          {formatTime(m.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}

                {status === "closed" && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl bg-white px-4 py-5 text-center shadow-sm ring-1 ring-black/5 dark:bg-neutral-800/70 dark:ring-white/5">
                    <p className="text-sm text-neutral-600 dark:text-neutral-300">{t("ended")}</p>
                    <button
                      type="button"
                      onClick={resetChat}
                      className={`rounded-full bg-gradient-to-br ${BRAND_GRADIENT} px-4 py-2 text-xs font-semibold text-white shadow-sm hover:brightness-110`}
                    >
                      {t("startNew")}
                    </button>
                  </div>
                )}
              </div>

              {showQueryForm ? (
                /* Leave-a-query form, shown after QUERY_AFTER_MS with no agent */
                <form onSubmit={handleQuery} className="shrink-0 space-y-2.5 border-t border-neutral-100 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900">
                  <textarea
                    required
                    rows={3}
                    maxLength={2000}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("queryPlaceholder")}
                    className={`w-full resize-none rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-neutral-400 dark:border-neutral-700 dark:bg-neutral-800/70 ${FOCUS_RING}`}
                  />
                  {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
                  <button
                    type="submit"
                    disabled={submittingQuery || !query.trim()}
                    className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br ${BRAND_GRADIENT} text-sm font-semibold text-white shadow-md shadow-teal-900/20 transition hover:brightness-110 disabled:opacity-50`}
                  >
                    {submittingQuery ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
                    {submittingQuery ? t("querySubmitting") : t("querySubmit")}
                  </button>
                  <WhatsAppButton href={whatsappUrl} label={t("whatsappCta")} compact />
                </form>
              ) : (
                status !== "closed" && (
                  <div className="shrink-0 border-t border-neutral-100 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                    {error && <p className="px-2 pb-1.5 text-xs text-red-600 dark:text-red-400">{error}</p>}
                    <form
                      onSubmit={handleSend}
                      className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-neutral-50 p-1.5 pl-3.5 transition focus-within:border-[oklch(0.52_0.08_195)] focus-within:ring-2 focus-within:ring-[oklch(0.52_0.08_195)]/20 dark:border-neutral-700 dark:bg-neutral-800/70"
                    >
                      <textarea
                        rows={1}
                        maxLength={2000}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            e.currentTarget.form?.requestSubmit();
                          }
                        }}
                        placeholder={t("messagePlaceholder")}
                        className="max-h-28 min-h-9 flex-1 resize-none bg-transparent py-2 text-sm outline-none placeholder:text-neutral-400 [field-sizing:content]"
                      />
                      <button
                        type="submit"
                        disabled={sending || !draft.trim()}
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${BRAND_GRADIENT} text-white shadow-sm transition hover:brightness-110 disabled:opacity-40`}
                        aria-label={t("send")}
                      >
                        {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 rtl:-scale-x-100" />}
                      </button>
                    </form>
                  </div>
                )
              )}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WhatsAppButton({ href, label, compact = false }: { href: string; label: string; compact?: boolean }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366]/40 font-semibold text-[#128C7E] transition hover:bg-[#25D366]/10 dark:text-[#4ee28a] ${
        compact ? "h-9 text-xs" : "h-11 text-sm"
      }`}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.57.93.95-3.48-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.24-9.44 9.45-9.44 2.52 0 4.89.99 6.67 2.77a9.37 9.37 0 0 1 2.76 6.68c0 5.21-4.24 9.44-9.45 9.44m8.04-17.48A11.3 11.3 0 0 0 12.05.7C5.78.7.68 5.8.68 12.06c0 2 .52 3.96 1.52 5.68L.58 23.7l6.1-1.6a11.33 11.33 0 0 0 5.37 1.37h.01c6.26 0 11.36-5.1 11.37-11.36 0-3.04-1.18-5.89-3.33-8.04" />
      </svg>
      {label}
    </a>
  );
}
