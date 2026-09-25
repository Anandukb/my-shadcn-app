"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/browser";
import { extractErrorMessage } from "@/lib/extract-error-message";
import type { ChatMessageRow, ChatSession, ChatSessionRow } from "@/lib/live-chat/types";

export const LIVE_CHAT_SESSIONS_KEY = ["live-chat-sessions"] as const;
export const liveChatMessagesKey = (id: string) => ["live-chat", id] as const;

export async function fetchChatSessions(): Promise<ChatSession[]> {
  const res = await fetch("/api/admin/chat/sessions", { cache: "no-store" });
  if (!res.ok) throw new Error(await extractErrorMessage(res, "Failed to load chats"));
  const json = await res.json();
  return json.sessions as ChatSession[];
}

export function useChatSessions() {
  return useQuery({ queryKey: LIVE_CHAT_SESSIONS_KEY, queryFn: fetchChatSessions });
}

function playChime() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.setValueAtTime(1320, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
    osc.onended = () => void ctx.close();
  } catch {
    // audio blocked until the admin interacts with the page — the badge still updates
  }
}

function showDesktopAlert(title: string, body: string) {
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  if (document.visibilityState === "visible" && document.hasFocus()) return;
  try {
    new Notification(title, { body, tag: "maram-live-chat" });
  } catch {
    // some browsers only allow notifications from a service worker
  }
}

/**
 * Subscribes the admin panel to live chat changes via Supabase Realtime
 * (Postgres changes, gated by the admin-only RLS policies) and keeps the
 * React Query caches fresh. Mounted once in DashboardShell so alerts arrive
 * on every admin page, not just the Live Chat screen.
 */
export function useLiveChatRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    (async () => {
      // Make sure Realtime joins with the admin's JWT, not the anon key,
      // otherwise RLS filters out every event.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session) await supabase.realtime.setAuth(data.session.access_token);

      channel = supabase
        .channel("admin-live-chat")
        .on("postgres_changes", { event: "*", schema: "public", table: "chat_sessions" }, (payload) => {
          void queryClient.invalidateQueries({ queryKey: LIVE_CHAT_SESSIONS_KEY });
          if (payload.eventType === "INSERT") {
            const row = payload.new as ChatSessionRow;
            playChime();
            showDesktopAlert("New live chat", `${row.name} is waiting for an agent`);
          }
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "chat_messages" }, (payload) => {
          const row = payload.new as ChatMessageRow;
          void queryClient.invalidateQueries({ queryKey: liveChatMessagesKey(row.session_id) });
          void queryClient.invalidateQueries({ queryKey: LIVE_CHAT_SESSIONS_KEY });
          if (row.sender === "visitor") {
            playChime();
            showDesktopAlert(
              row.kind === "query" ? "New offline query" : "New chat message",
              row.body.slice(0, 120)
            );
          }
        })
        .subscribe();
    })();

    return () => {
      cancelled = true;
      if (channel) void supabase.removeChannel(channel);
    };
  }, [queryClient]);
}
