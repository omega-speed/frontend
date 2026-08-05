"use server";

import api from "@/lib/api";
import type { BrowseFilters, BrowseResult, SchoolDetail } from "./types";

// GET /schools — browse the validated catalog with filters + pagination.
export async function browseSchools(filters: BrowseFilters): Promise<BrowseResult> {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.state) query.set("state", filters.state);
  if (filters.setting) query.set("setting", filters.setting);
  if (filters.size) query.set("size", filters.size);
  if (filters.sort) query.set("sort", filters.sort);
  query.set("page", String(filters.page ?? 1));
  query.set("limit", "24");
  try {
    const res = await api.get(`schools?${query}`);
    if (res?.success) {
      return {
        items: res.data ?? [],
        total: res.meta?.total ?? 0,
        page: res.meta?.page ?? 1,
        limit: res.meta?.limit ?? 24,
        totalPages: res.meta?.totalPages ?? 1,
      };
    }
  } catch {
    // fall through to the failed result below
  }
  // Couldn't reach the catalog (expired session mid-request, DB cold start…) —
  // say so honestly instead of rendering "0 schools".
  return { items: [], total: 0, page: 1, limit: 24, totalPages: 1, failed: true };
}

// GET /schools/:id — one school's full page.
export async function getSchool(id: string): Promise<SchoolDetail | null> {
  try {
    const res = await api.get(`schools/${id}`);
    if (res?.success && res.data) return res.data as SchoolDetail;
  } catch {
    // not found / transient — page renders notFound
  }
  return null;
}

// POST /ollie/pin — pin or remove this school on the learner's shortlist.
export async function PinSchool(institutionId: string, action: "add" | "remove") {
  try {
    return await api.post("ollie/pin", { institutionId, action });
  } catch (error) {
    return error;
  }
}
