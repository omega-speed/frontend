"use server";

import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import type {
  MatchResult,
  MatchesData,
  OptionMeta,
  Portfolio,
  RankedOption,
} from "./types";

interface Institution {
  id: string;
  officialName: string;
}
interface Program {
  id: string;
  officialName: string;
  institutionId: string;
  degreeLevel: string;
}

// Assemble everything the Matches page needs for the signed-in learner:
// the current matches, a fresh ranking, the balanced portfolio (built if none
// exists yet), and a lookup that resolves each option id to a readable program +
// institution name.
export async function getMatchesData(): Promise<MatchesData> {
  const user = await getCurrentUser();
  const empty: MatchesData = { matches: [], ranked: [], portfolio: null, meta: {} };
  if (!user) return empty;

  const [instRes, progRes, matchRes, rankRes] = await Promise.all([
    api.get("universities/institutions?limit=200"),
    api.get("universities/programs?limit=200"),
    api.get(`q-match/learners/${user.id}/matches`),
    api.post(`q-match/learners/${user.id}/ranking`, { weights: {} }),
  ]);

  const institutions: Institution[] = instRes?.data ?? [];
  const programs: Program[] = progRes?.data ?? [];
  const matches: MatchResult[] = matchRes?.data ?? [];
  const ranked: RankedOption[] = rankRes?.data?.ranked ?? [];

  // Build the portfolio if the learner doesn't have one yet.
  let portfolio: Portfolio | null = null;
  const pfRes = await api.get(`q-match/learners/${user.id}/portfolio`);
  portfolio = pfRes?.data ?? null;
  if (!portfolio && matches.length > 0) {
    const built = await api.post(`q-match/learners/${user.id}/portfolio`, {});
    portfolio = built?.data ?? null;
  }

  const instById = new Map(institutions.map((i) => [i.id, i.officialName]));
  const meta: Record<string, OptionMeta> = {};
  for (const p of programs) {
    meta[p.id] = {
      optionId: p.id,
      programName: p.officialName,
      institutionName: instById.get(p.institutionId) ?? "—",
      degreeLevel: p.degreeLevel,
    };
  }

  return { matches, ranked, portfolio, meta };
}
