// Scoring engines for the PHAMORA validation instruments. Pure functions —
// callers persist both the raw inputs and these derived values (see
// prisma/schema.prisma comments: never store only the calculated score).

/** System Usability Scale (Brooke, 1996). Items are 1-5 Likert responses. */
export function scoreSus(items: {
  q1: number; q2: number; q3: number; q4: number; q5: number;
  q6: number; q7: number; q8: number; q9: number; q10: number;
}): number {
  const odd = [items.q1, items.q3, items.q5, items.q7, items.q9];
  const even = [items.q2, items.q4, items.q6, items.q8, items.q10];
  const oddScore = odd.reduce((sum, v) => sum + (v - 1), 0);
  const evenScore = even.reduce((sum, v) => sum + (5 - v), 0);
  return (oddScore + evenScore) * 2.5;
}

export function susAdjective(score: number): string {
  if (score >= 84.1) return "Best Imaginable";
  if (score >= 80.8) return "Excellent";
  if (score >= 78.9) return "Excellent";
  if (score >= 72.6) return "Good";
  if (score >= 62.7) return "OK";
  if (score >= 51.7) return "Poor";
  return "Awful";
}

/** Item-level CVI: proportion of experts rating an item 3 or 4 (relevant). */
export function itemCvi(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const relevant = ratings.filter((r) => r >= 3).length;
  return relevant / ratings.length;
}

/** Scale-level CVI, averaging method: mean of all item-level I-CVIs. */
export function scaleCviAverage(itemCvis: number[]): number {
  if (itemCvis.length === 0) return 0;
  return itemCvis.reduce((a, b) => a + b, 0) / itemCvis.length;
}

/** Scale-level CVI, universal-agreement method: proportion of items with I-CVI = 1.0. */
export function scaleCviUniversalAgreement(itemCvis: number[]): number {
  if (itemCvis.length === 0) return 0;
  const unanimous = itemCvis.filter((c) => c === 1).length;
  return unanimous / itemCvis.length;
}

export type CviStatus = "ACCEPTED" | "REVIEW_RECOMMENDED" | "REVISION_REQUIRED";

/** I-CVI >= 0.78 accepted; 0.60-0.77 reviewed; below 0.60 needs revision. */
export function cviStatus(iCvi: number): CviStatus {
  if (iCvi >= 0.78) return "ACCEPTED";
  if (iCvi >= 0.6) return "REVIEW_RECOMMENDED";
  return "REVISION_REQUIRED";
}

/** Mean of a set of 1-5 responses, or null if none were given. */
export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Percentage of correct responses in an assessment session. */
export function percentageScore(numCorrect: number, totalQuestions: number): number {
  if (totalQuestions === 0) return 0;
  return (numCorrect / totalQuestions) * 100;
}

/** Cohen's d for paired pre/post scores (within-subject, using the SD of differences). */
export function cohensDPaired(pre: number[], post: number[]): number | null {
  if (pre.length !== post.length || pre.length < 2) return null;
  const diffs = pre.map((p, i) => post[i] - p);
  const n = diffs.length;
  const meanDiff = diffs.reduce((a, b) => a + b, 0) / n;
  const variance =
    diffs.reduce((sum, d) => sum + (d - meanDiff) ** 2, 0) / (n - 1);
  const sd = Math.sqrt(variance);
  if (sd === 0) return null;
  return meanDiff / sd;
}
