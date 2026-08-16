// Mirrors the backend athlete overlay contract (GET/PUT /athlete, UX-011 / SEG-ATH).

export interface CoachContact {
  coach: string;
  institution: string;
  sport: string;
  status: "identified" | "contacted" | "responded" | "visit" | "offer";
}

export interface AthleteEvent {
  name: string;
  date: string; // yyyy-mm-dd
  note?: string;
}

export interface AthleteOverview {
  isAthlete: boolean;
  sports: { sport: string; schools: { institution: string; division: string | null }[] }[];
  readiness: { label: string; next: string | null }[];
  outreach: CoachContact[];
  events: AthleteEvent[];
  laddersNote: string;
  outreachNote: string;
  aidNote: string;
  healthNote: string;
  postAthleticNote: string;
  tasks: { title: string; detail: string }[];
}
