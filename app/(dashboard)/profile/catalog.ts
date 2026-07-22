// A small, curated set of fields we invite the learner to fill — deliberately
// NOT the full 12-category twin. This is the "progressive, not a wall" surface;
// most data will arrive later from conversation and document extraction. Any
// twin attribute NOT listed here still shows up (see profile-view "Other").

export interface CatalogField {
  category: string;
  name: string;
  label: string;
  placeholder: string;
  // Optional fixed choices; omit for a free-text field.
  options?: { value: string; label: string }[];
}

export interface CatalogSection {
  key: string;
  title: string;
  blurb: string;
  fields: CatalogField[];
}

export const CATALOG: CatalogSection[] = [
  {
    key: "education",
    title: "Where you are now",
    blurb: "Your current stage of education.",
    fields: [
      {
        category: "education",
        name: "current_level",
        label: "Current level",
        placeholder: "Select level",
        options: [
          { value: "high_school", label: "High school" },
          { value: "associate", label: "Associate / diploma" },
          { value: "undergraduate", label: "Undergraduate" },
          { value: "graduate", label: "Graduate" },
          { value: "other", label: "Other" },
        ],
      },
      {
        category: "education",
        name: "current_institution",
        label: "Current school",
        placeholder: "e.g. Lincoln High School",
      },
      {
        category: "education",
        name: "expected_completion",
        label: "Expected completion",
        placeholder: "e.g. June 2027",
      },
    ],
  },
  {
    key: "goals",
    title: "Where you want to go",
    blurb: "What you're aiming for — this guides every recommendation.",
    fields: [
      {
        category: "goals",
        name: "target_level",
        label: "Goal: level",
        placeholder: "Select level",
        options: [
          { value: "undergraduate", label: "Undergraduate" },
          { value: "graduate", label: "Graduate" },
          { value: "doctorate", label: "Doctorate" },
          { value: "certificate", label: "Certificate" },
        ],
      },
      {
        category: "goals",
        name: "target_program",
        label: "Goal: field of study",
        placeholder: "e.g. Computer Science",
      },
      {
        category: "goals",
        name: "target_country",
        label: "Goal: country",
        placeholder: "e.g. Canada",
      },
    ],
  },
  {
    key: "preferences",
    title: "What matters to you",
    blurb: "Preferences we weigh when matching you to options.",
    fields: [
      {
        category: "preferences",
        name: "institution_type",
        label: "School type",
        placeholder: "Select type",
        options: [
          { value: "public", label: "Public" },
          { value: "private", label: "Private" },
          { value: "no_preference", label: "No preference" },
        ],
      },
      {
        category: "preferences",
        name: "campus_setting",
        label: "Campus setting",
        placeholder: "Select setting",
        options: [
          { value: "urban", label: "Urban" },
          { value: "suburban", label: "Suburban" },
          { value: "rural", label: "Rural" },
          { value: "no_preference", label: "No preference" },
        ],
      },
      {
        category: "preferences",
        name: "budget_comfort",
        label: "Budget comfort",
        placeholder: "e.g. up to $20,000 / year",
      },
    ],
  },
  {
    // These fields write the exact twin attributes Q-Match reads, so changing one
    // and rebuilding actually moves your matches. Kept in Q-Match's vocabulary on
    // purpose (academic/gpa, financial/annual_budget, …) — no translation layer.
    key: "matching",
    title: "What we match you on",
    blurb:
      "The details Q-Match scores your programs against. Change any of these and we rebuild your matches.",
    fields: [
      {
        category: "academic",
        name: "gpa",
        label: "GPA (0–4 scale)",
        placeholder: "e.g. 3.7",
      },
      {
        category: "academic",
        name: "intended_degree_level",
        label: "Degree you're pursuing",
        placeholder: "Select level",
        options: [
          { value: "bachelor", label: "Bachelor's" },
          { value: "master", label: "Master's" },
          { value: "doctorate", label: "Doctorate" },
          { value: "certificate", label: "Certificate" },
        ],
      },
      {
        category: "academic",
        name: "discipline",
        label: "Field of study",
        placeholder: "Select field",
        options: [
          { value: "computer_science", label: "Computer Science" },
          { value: "data_science", label: "Data Science" },
          { value: "engineering", label: "Engineering" },
          { value: "business", label: "Business" },
          { value: "life_sciences", label: "Life Sciences" },
          { value: "social_sciences", label: "Social Sciences" },
        ],
      },
      {
        category: "financial",
        name: "annual_budget",
        label: "Annual budget (USD)",
        placeholder: "e.g. 35000",
      },
      {
        category: "preference",
        name: "modality",
        label: "Study mode",
        placeholder: "Select mode",
        options: [
          { value: "ON_CAMPUS", label: "On campus" },
          { value: "ONLINE", label: "Online" },
        ],
      },
      {
        category: "preference",
        name: "country",
        label: "Preferred country",
        placeholder: "Select country",
        options: [
          { value: "US", label: "United States" },
          { value: "CA", label: "Canada" },
          { value: "GB", label: "United Kingdom" },
          { value: "AU", label: "Australia" },
        ],
      },
    ],
  },
];

// Fast lookup of whether a (category, name) is part of the curated catalog.
export const CATALOG_KEYS = new Set(
  CATALOG.flatMap((s) => s.fields.map((f) => `${f.category}:${f.name}`)),
);

// The subset of catalog fields Q-Match consumes — editing any of these should
// rebuild the learner's matches.
export const MATCH_INPUT_KEYS = new Set(
  (CATALOG.find((s) => s.key === "matching")?.fields ?? []).map(
    (f) => `${f.category}:${f.name}`,
  ),
);
