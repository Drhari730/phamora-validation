// Programs eligible for the study — pharmacology is taught across all of
// these, not just MBBS. Shared between the student profile form and any
// admin/export labeling so the option list never drifts.

export const PROGRAMS = [
  "MBBS",
  "BDS",
  "B.Pharm",
  "Pharm.D",
  "B.Sc Nursing",
  "Other",
] as const;

export const YEARS_OF_STUDY = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Final Year",
  "Internship",
] as const;

/** Full population phrase for formal contexts (consent, study title). */
export const POPULATION_LONG =
  "undergraduate health-professions students (MBBS, BDS, Pharmacy/Pharm.D, and Nursing)";

/** Short population phrase for instrument items and tighter UI copy. */
export const POPULATION_SHORT = "health-professions students";
