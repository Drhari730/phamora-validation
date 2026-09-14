// Single source of truth for the study's standardized instruments (SUS,
// uMARS-based App Quality). Wording is used as-is per the validation
// toolkit — these are NOT editable from admin, since altering the wording
// would break the instruments' published psychometric properties. Both the
// student-facing pages and the admin "Instruments" reference view import
// from here.

export const LIKERT_AGREEMENT: [string, string, string, string, string] = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

export const LIKERT_QUALITY: [string, string, string, string, string] = [
  "Inadequate",
  "Poor",
  "Acceptable",
  "Good",
  "Excellent",
];

export const SUS_ITEMS = [
  "I think that I would like to use PHAMORA frequently.",
  "I found PHAMORA unnecessarily complex.",
  "I thought PHAMORA was easy to use.",
  "I think that I would need the support of a technical person to be able to use PHAMORA.",
  "I found the various functions in PHAMORA were well integrated.",
  "I thought there was too much inconsistency in PHAMORA.",
  "I would imagine that most medical students would learn to use PHAMORA very quickly.",
  "I found PHAMORA very cumbersome to use.",
  "I felt very confident using PHAMORA.",
  "I needed to learn a lot of things before I could get going with PHAMORA.",
];

export interface AppQualitySection {
  key: string;
  dbSection: string;
  title: string;
  labels: [string, string, string, string, string];
  items: string[];
}

export const APP_QUALITY_SECTIONS: AppQualitySection[] = [
  {
    key: "engagement",
    dbSection: "ENGAGEMENT",
    title: "Engagement",
    labels: LIKERT_QUALITY,
    items: [
      "Entertainment — Is PHAMORA fun/engaging to use? Does it use gamification (streaks, badges, progress) effectively?",
      "Interest — Was the content presented in an interesting way?",
      "Customization — Does the app adapt to your own progress/performance (e.g., spaced-repetition flashcards, stats)?",
      "Interactivity — Does it prompt input, give feedback, track progress, or notify you appropriately?",
      "Target group — Is the content appropriate and pitched correctly for undergraduate medical students?",
    ],
  },
  {
    key: "functionality",
    dbSection: "FUNCTIONALITY",
    title: "Functionality",
    labels: LIKERT_QUALITY,
    items: [
      "Performance — Do the app's features (quizzes, search, flashcards) work accurately and load quickly?",
      "Ease of use — Is it easy to learn how to use PHAMORA, with clear menus/labels?",
      "Navigation — Is it easy to move between lessons, quizzes, cases, and monographs?",
      "Gestural design — Are taps/swipes/scrolls consistent and intuitive throughout the app?",
    ],
  },
  {
    key: "aesthetics",
    dbSection: "AESTHETICS",
    title: "Aesthetics",
    labels: LIKERT_QUALITY,
    items: [
      "Layout — Are graphics and menus well organized and sized appropriately?",
      "Graphics — Is the visual quality of icons/illustrations/charts good?",
      "Visual appeal — Overall, how good does PHAMORA look?",
    ],
  },
  {
    key: "information",
    dbSection: "INFORMATION_QUALITY",
    title: "Information Quality",
    labels: LIKERT_QUALITY,
    items: [
      "Quality of information — Is the pharmacology content correct, well written, and clinically relevant?",
      "Quantity of information — Is the amount of content in each lesson/monograph appropriate (not too little/too much)?",
      "Visual information — Are charts, tables and mechanism diagrams clear and well designed?",
      "Goal clarity — Does each lesson/case have a clear, specific learning objective?",
    ],
  },
  {
    key: "subjective",
    dbSection: "SUBJECTIVE_QUALITY",
    title: "Subjective Quality",
    labels: LIKERT_QUALITY,
    items: [
      "Would you recommend PHAMORA to fellow medical students?",
      "How many times do you think you would use PHAMORA in the next 12 months?",
      "Would you pay for this app? (rate perceived value even if free)",
      "Overall star rating you would give PHAMORA.",
    ],
  },
  {
    key: "impact",
    dbSection: "PERCEIVED_IMPACT",
    title: "Perceived Learning Impact",
    labels: LIKERT_AGREEMENT,
    items: [
      "Using PHAMORA increased my awareness of key pharmacology concepts.",
      "Using PHAMORA increased my knowledge of drug mechanisms/interactions/ADRs.",
      "PHAMORA changed my attitude toward the importance of pharmacology in clinical practice.",
      "Using PHAMORA increased my confidence in applying pharmacology to clinical (case-based) reasoning.",
      "I intend to keep using PHAMORA for exam preparation / clinical rotations.",
      "Overall, PHAMORA is likely to improve learning outcomes compared to my usual study methods.",
    ],
  },
];

export const CVI_RATING_SCALE = [
  { value: 1, label: "Not Relevant" },
  { value: 2, label: "Needs Major Revision" },
  { value: 3, label: "Relevant, Minor Revision" },
  { value: 4, label: "Highly Relevant" },
];
