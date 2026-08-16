"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

// Which experience segments apply to this learner — drives which sidebar
// surfaces exist at all (a homeschooler sees Homeschool; everyone else doesn't).
export interface Segments {
  homeschool: boolean;
  ged: boolean;
  transfer: boolean;
  grad: boolean;
  global: boolean;
  athlete: boolean;
}

const NONE: Segments = { homeschool: false, ged: false, transfer: false, grad: false, global: false, athlete: false };

export async function getSegments(): Promise<Segments> {
  const user = await getCurrentUser();
  if (!user) return NONE;
  try {
    const res = await api.get("segments");
    return res?.success && res.data ? (res.data as Segments) : NONE;
  } catch {
    return NONE;
  }
}
