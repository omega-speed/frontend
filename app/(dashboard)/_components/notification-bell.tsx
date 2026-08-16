"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  AppNotification,
  ChannelPreference,
  getInbox,
  getPreferences,
  markAllRead,
  markRead,
  updatePreferences,
} from "../_lib/notifications";

dayjs.extend(relativeTime);

// The header bell: where reminders LAND. A quiet dot when something is unread,
// a small panel with the inbox and the two switches that control how nudges
// reach you (in-app is always on — this panel IS in-app).

const CHANNEL_WORDS: Record<ChannelPreference["channel"], string> = {
  IN_APP: "In-app",
  EMAIL: "Email",
  PUSH: "Push",
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [prefs, setPrefs] = useState<ChannelPreference[]>([]);
  const [loading, startLoad] = useTransition();
  const panelRef = useRef<HTMLDivElement>(null);

  const load = () =>
    startLoad(async () => {
      const [inbox, preferences] = await Promise.all([getInbox(), getPreferences()]);
      if (inbox.ok) {
        setItems(inbox.notifications);
        setUnread(inbox.unread);
      }
      if (preferences.ok) setPrefs(preferences.preferences);
    });

  useEffect(() => {
    load();
    const t = setInterval(load, 5 * 60 * 1000); // a fresh dot without a reload
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const openPanel = () => {
    setOpen((v) => !v);
    if (!open && unread > 0) {
      // Opening the panel IS reading it — clear the dot, then the rows.
      setUnread(0);
      void markAllRead();
      setItems((xs) => xs.map((x) => ({ ...x, readAt: x.readAt ?? new Date().toISOString() })));
    }
  };

  const toggle = (channel: ChannelPreference["channel"]) => {
    const next = prefs.map((p) => (p.channel === channel ? { ...p, enabled: !p.enabled } : p));
    setPrefs(next);
    void updatePreferences(next);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label={unread > 0 ? `Notifications — ${unread} unread` : "Notifications"}
        onClick={openPanel}
        className="relative flex h-8 items-center rounded-full border border-border px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        Updates
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-10 z-50 w-80 rounded-2xl border border-border bg-card shadow-lg"
          >
            <div className="border-b border-border/70 px-4 py-2.5">
              <p className="text-sm font-semibold text-foreground">Updates</p>
              <p className="text-[11px] text-muted-foreground">Deadline nudges and things worth knowing</p>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {items.length === 0 ? (
                <p className="px-4 py-6 text-xs leading-relaxed text-muted-foreground">
                  {loading ? "Loading…" : "Nothing yet — when a deadline gets close, it shows up here."}
                </p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li
                      key={n.id}
                      className="border-b border-border/60 px-4 py-2.5 last:border-b-0"
                      onMouseEnter={() => !n.readAt && void markRead(n.id)}
                    >
                      <p className="text-xs font-semibold text-foreground">{n.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{n.body}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground/70">{dayjs(n.createdAt).fromNow()}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-border/70 px-4 py-2.5">
              <p className="text-[10px] font-black uppercase text-muted-foreground">How to reach you</p>
              <div className="mt-1.5 flex gap-2">
                {prefs
                  .filter((p) => p.channel !== "PUSH") // push arrives with the mobile slice
                  .map((p) => (
                    <button
                      key={p.channel}
                      type="button"
                      disabled={p.channel === "IN_APP"}
                      title={p.channel === "IN_APP" ? "In-app is always on — this panel is it" : undefined}
                      onClick={() => toggle(p.channel)}
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors disabled:opacity-60 ${
                        p.enabled ? "bg-primary/10 text-primary" : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {CHANNEL_WORDS[p.channel]} {p.enabled ? "on" : "off"}
                    </button>
                  ))}
              </div>
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
                Day-before deadline alerts always come through — everything else respects these.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
