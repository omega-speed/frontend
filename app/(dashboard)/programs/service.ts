"use server";

import api from "@/lib/api";

export interface Institution {
  id: string;
  officialName: string;
  institutionType: string;
  operatingStatus: string;
  countryId: string | null;
}

export interface Program {
  id: string;
  officialName: string;
  institutionId: string;
  degreeLevel: string;
  modality: string;
  disciplineCodes: string[];
}

export interface ProgramRow extends Program {
  institutionName: string;
}

// The university data product: institutions + their programs, joined for display.
export async function getCatalog(): Promise<{ institutions: Institution[]; programs: ProgramRow[] }> {
  const [instRes, progRes] = await Promise.all([
    api.get("universities/institutions?limit=200"),
    api.get("universities/programs?limit=200"),
  ]);

  const institutions: Institution[] = instRes?.data ?? [];
  const rawPrograms: Program[] = progRes?.data ?? [];
  const nameById = new Map(institutions.map((i) => [i.id, i.officialName]));

  const programs: ProgramRow[] = rawPrograms.map((p) => ({
    ...p,
    institutionName: nameById.get(p.institutionId) ?? "—",
  }));

  return { institutions, programs };
}
