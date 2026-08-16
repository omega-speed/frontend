"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// The in-app notification inbox + channel preferences (PF-012). This is where
// deadline reminders actually LAND for the student.

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  urgency: string;
  channel: string;
  readAt: string | null;
  createdAt: string;
}

export interface ChannelPreference {
  channel: "IN_APP" | "EMAIL" | "PUSH";
  enabled: boolean;
}

export type InboxResult = { ok: true; notifications: AppNotification[]; unread: number } | { ok: false; message: string };

export async function getInbox(): Promise<InboxResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("notifications?page=1&limit=20");
    if (res?.success) {
      const all = ((res.data ?? []) as AppNotification[]).filter((n) => n.channel === "IN_APP");
      return { ok: true, notifications: all, unread: all.filter((n) => !n.readAt).length };
    }
    return { ok: false, message: res?.message ?? "Couldn't load notifications." };
  } catch {
    return { ok: false, message: "Couldn't load notifications." };
  }
}

export async function markRead(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  try {
    await api.post(`notifications/${id}/read`, {});
  } catch {
    // best-effort — the unread dot corrects on next load
  }
}

export async function markAllRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  try {
    await api.post("notifications/read-all", {});
  } catch {
    // best-effort
  }
}

export type PreferencesResult = { ok: true; preferences: ChannelPreference[] } | { ok: false; message: string };

export async function getPreferences(): Promise<PreferencesResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in again." };
  try {
    const res = await api.get("notifications/preferences");
    if (res?.success) return { ok: true, preferences: (res.data ?? []) as ChannelPreference[] };
    return { ok: false, message: res?.message ?? "Couldn't load preferences." };
  } catch {
    return { ok: false, message: "Couldn't load preferences." };
  }
}

export async function updatePreferences(preferences: ChannelPreference[]): Promise<{ ok: boolean }> {
  const user = await getCurrentUser();
  if (!user) return { ok: false };
  try {
    const res = await api.put("notifications/preferences", { preferences });
    return { ok: Boolean(res?.success) };
  } catch {
    return { ok: false };
  }
}
