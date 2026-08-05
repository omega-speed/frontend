// Mirrors the backend Schools contracts (GET /schools, GET /schools/:id).

export interface SchoolSummary {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
  setting: string | null;
  size: string | null;
  ownership: string | null;
  admitRate: number | null; // 0–1
  graduationRate: number | null; // 0–100
  netPrice: number | null; // USD/yr after aid
  medianEarnings: number | null; // USD, 10 yrs after entry
  programCount: number;
}

export interface SchoolProgram {
  name: string;
  level: string;
  tuition: number | null;
}

export interface SchoolAward {
  name: string;
  amountMax: number | null;
}

export interface SchoolDetail extends SchoolSummary {
  retentionRate: number | null;
  deadlines: { earlyAction?: string | null; regular?: string | null; transfer?: string | null } | null;
  testPolicy: string | null;
  minGpa: number | null;
  competitiveGpa: number | null;
  programs: SchoolProgram[];
  sports: Record<string, string[]>; // sport → divisions
  clubCount: number;
  clubsSample: string[];
  schoolAid: SchoolAward[];
  website: string | null;
}

export interface BrowseFilters {
  search?: string;
  state?: string;
  setting?: string;
  size?: string;
  sort?: string;
  page?: number;
}

export interface BrowseResult {
  items: SchoolSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  // True when the catalog couldn't be reached — render a retry state, never
  // pretend the catalog is empty.
  failed?: boolean;
}
