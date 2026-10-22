// Statistics helpers for the validation analysis page. Dependency-free,
// pure functions. Distribution functions follow Numerical Recipes.

export function sum(a: number[]): number {
  return a.reduce((x, y) => x + y, 0);
}

export function avg(a: number[]): number | null {
  return a.length ? sum(a) / a.length : null;
}

/** Sample variance (n - 1). */
export function variance(a: number[]): number | null {
  if (a.length < 2) return null;
  const m = sum(a) / a.length;
  return sum(a.map((v) => (v - m) ** 2)) / (a.length - 1);
}

export function sd(a: number[]): number | null {
  const v = variance(a);
  return v === null ? null : Math.sqrt(v);
}

export function median(a: number[]): number | null {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function lgamma(x: number): number {
  const c = [
    76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155,
    0.1208650973866179e-2, -0.5395239384953e-5,
  ];
  let y = x;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (const ci of c) ser += ci / ++y;
  return -tmp + Math.log((2.5066282746310005 * ser) / x);
}

function betacf(a: number, b: number, x: number): number {
  const MAXIT = 200;
  const EPS = 3e-12;
  const FPMIN = 1e-300;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - (qab * x) / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
}

/** Regularised incomplete beta function I_x(a, b). */
function ibeta(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const bt = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (bt * betacf(a, b, x)) / a : 1 - (bt * betacf(b, a, 1 - x)) / b;
}

export function tCdf(t: number, df: number): number {
  const x = df / (df + t * t);
  const p = 0.5 * ibeta(x, df / 2, 0.5);
  return t > 0 ? 1 - p : p;
}

export function tTwoSidedP(t: number, df: number): number {
  return ibeta(df / (df + t * t), df / 2, 0.5);
}

/** Upper critical value for a two-sided interval, e.g. level 0.95 -> t(0.975, df). */
export function tCritical(level: number, df: number): number {
  const target = 1 - (1 - level) / 2;
  let lo = 0;
  let hi = 200;
  for (let i = 0; i < 80; i++) {
    const mid = (lo + hi) / 2;
    if (tCdf(mid, df) < target) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function normalCdf(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp((-z * z) / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

export interface PairedResult {
  n: number;
  meanPre: number;
  sdPre: number | null;
  meanPost: number;
  sdPost: number | null;
  meanDiff: number;
  sdDiff: number | null;
  ciLow: number | null;
  ciHigh: number | null;
  t: number | null;
  df: number;
  p: number | null;
  dz: number | null;
  dzCiLow: number | null;
  dzCiHigh: number | null;
  wilcoxonP: number | null;
  wilcoxonNote: string | null;
  normalisedGain: number | null;
}

export function pairedAnalysis(pre: number[], post: number[]): PairedResult | null {
  const n = pre.length;
  if (n < 2 || post.length !== n) return null;
  const diffs = post.map((v, i) => v - pre[i]);
  const meanDiff = sum(diffs) / n;
  const sdDiff = sd(diffs);
  const df = n - 1;
  let t: number | null = null;
  let p: number | null = null;
  let ciLow: number | null = null;
  let ciHigh: number | null = null;
  let dz: number | null = null;
  let dzCiLow: number | null = null;
  let dzCiHigh: number | null = null;
  if (sdDiff !== null && sdDiff > 0) {
    const se = sdDiff / Math.sqrt(n);
    t = meanDiff / se;
    p = tTwoSidedP(t, df);
    const crit = tCritical(0.95, df);
    ciLow = meanDiff - crit * se;
    ciHigh = meanDiff + crit * se;
    dz = meanDiff / sdDiff;
    const seD = Math.sqrt(1 / n + (dz * dz) / (2 * n));
    dzCiLow = dz - 1.96 * seD;
    dzCiHigh = dz + 1.96 * seD;
  }

  // Wilcoxon signed-rank, normal approximation with tie + continuity correction.
  let wilcoxonP: number | null = null;
  let wilcoxonNote: string | null = null;
  const nz = diffs.filter((d) => d !== 0);
  if (nz.length >= 5) {
    const abs = nz.map((d, i) => ({ a: Math.abs(d), s: Math.sign(d), i })).sort((x, y) => x.a - y.a);
    const ranks = new Array<number>(abs.length);
    let tieCorr = 0;
    for (let i = 0; i < abs.length; ) {
      let j = i;
      while (j + 1 < abs.length && abs[j + 1].a === abs[i].a) j++;
      const r = (i + j) / 2 + 1;
      for (let k = i; k <= j; k++) ranks[k] = r;
      const tcount = j - i + 1;
      tieCorr += tcount ** 3 - tcount;
      i = j + 1;
    }
    const wPlus = sum(abs.map((x, k) => (x.s > 0 ? ranks[k] : 0)));
    const m = nz.length;
    const mu = (m * (m + 1)) / 4;
    const varW = (m * (m + 1) * (2 * m + 1)) / 24 - tieCorr / 48;
    if (tieCorr === 0 && m <= 25) {
      // Exact null distribution of W+ (ranks are 1..m when there are no ties).
      const maxW = (m * (m + 1)) / 2;
      const counts = new Array<number>(maxW + 1).fill(0);
      counts[0] = 1;
      for (let r = 1; r <= m; r++) for (let w = maxW; w >= r; w--) counts[w] += counts[w - r];
      const total = 2 ** m;
      const w = Math.round(Math.min(wPlus, maxW - wPlus));
      let cum = 0;
      for (let i = 0; i <= w; i++) cum += counts[i];
      wilcoxonP = Math.min(1, (2 * cum) / total);
      wilcoxonNote = null;
    } else if (varW > 0) {
      const z = (Math.abs(wPlus - mu) - 0.5) / Math.sqrt(varW);
      wilcoxonP = Math.min(1, 2 * (1 - normalCdf(Math.max(0, z))));
      if (m < 10) wilcoxonNote = "normal approximation; interpret cautiously with fewer than 10 non-tied pairs";
    }
  }

  // Hake normalised gain on class means: (post - pre) / (100 - pre).
  const mp = sum(pre) / n;
  const mq = sum(post) / n;
  const gain = mp < 100 ? (mq - mp) / (100 - mp) : null;

  return {
    n,
    meanPre: mp,
    sdPre: sd(pre),
    meanPost: mq,
    sdPost: sd(post),
    meanDiff,
    sdDiff,
    ciLow,
    ciHigh,
    t,
    df,
    p,
    dz,
    dzCiLow,
    dzCiHigh,
    wilcoxonP,
    wilcoxonNote,
    normalisedGain: gain,
  };
}

export function oneSampleT(values: number[], mu: number) {
  const n = values.length;
  const s = sd(values);
  if (n < 2 || s === null || s === 0) return null;
  const m = sum(values) / n;
  const se = s / Math.sqrt(n);
  const t = (m - mu) / se;
  const crit = tCritical(0.95, n - 1);
  return { n, mean: m, sd: s, t, df: n - 1, p: tTwoSidedP(t, n - 1), ciLow: m - crit * se, ciHigh: m + crit * se };
}

/** Cronbach's alpha. rows = respondents, cols = items. For 0/1 data this equals KR-20. */
export function cronbachAlpha(matrix: number[][]): number | null {
  const n = matrix.length;
  const k = matrix[0]?.length ?? 0;
  if (n < 3 || k < 2) return null;
  const itemVarSum = sum(
    Array.from({ length: k }, (_, j) => variance(matrix.map((r) => r[j])) ?? 0)
  );
  const totalVar = variance(matrix.map((r) => sum(r)));
  if (!totalVar || totalVar === 0) return null;
  return (k / (k - 1)) * (1 - itemVarSum / totalVar);
}

export function pearson(x: number[], y: number[]): number | null {
  const n = x.length;
  if (n < 3 || y.length !== n) return null;
  const mx = sum(x) / n;
  const my = sum(y) / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    sxy += (x[i] - mx) * (y[i] - my);
    sxx += (x[i] - mx) ** 2;
    syy += (y[i] - my) ** 2;
  }
  if (sxx === 0 || syy === 0) return null;
  return sxy / Math.sqrt(sxx * syy);
}

export function interpretAlpha(a: number | null): string {
  if (a === null) return "n/a";
  if (a >= 0.9) return "excellent";
  if (a >= 0.8) return "good";
  if (a >= 0.7) return "acceptable";
  if (a >= 0.6) return "questionable";
  return "poor";
}

/** Modified kappa for content validity (Polit, Beck & Owen, 2007). */
export function modifiedKappa(nExperts: number, nRelevant: number): number | null {
  if (nExperts < 2) return null;
  let comb = 1;
  for (let i = 1; i <= nRelevant; i++) comb = (comb * (nExperts - nRelevant + i)) / i;
  const pc = comb * Math.pow(0.5, nExperts);
  const icvi = nRelevant / nExperts;
  if (pc >= 1) return null;
  return (icvi - pc) / (1 - pc);
}

export function interpretKappa(k: number | null): string {
  if (k === null) return "n/a";
  if (k > 0.74) return "excellent";
  if (k >= 0.6) return "good";
  if (k >= 0.4) return "fair";
  return "poor";
}

/** Aiken's V for a 1-4 relevance scale (lo = 1, c = 4 categories). */
export function aikenV(ratings: number[]): number | null {
  if (!ratings.length) return null;
  return sum(ratings.map((r) => r - 1)) / (ratings.length * 3);
}

/** ICC(2,1) and ICC(2,k), two-way random effects, absolute agreement (Shrout & Fleiss). rows = items, cols = raters. */
export function icc2(matrix: number[][]): { single: number; average: number } | null {
  const n = matrix.length;
  const k = matrix[0]?.length ?? 0;
  if (n < 2 || k < 2) return null;
  const grand = sum(matrix.map((r) => sum(r))) / (n * k);
  const rowMeans = matrix.map((r) => sum(r) / k);
  const colMeans = Array.from({ length: k }, (_, j) => sum(matrix.map((r) => r[j])) / n);
  const ssr = k * sum(rowMeans.map((m) => (m - grand) ** 2));
  const ssc = n * sum(colMeans.map((m) => (m - grand) ** 2));
  let sst = 0;
  for (const r of matrix) for (const v of r) sst += (v - grand) ** 2;
  const sse = sst - ssr - ssc;
  const msr = ssr / (n - 1);
  const msc = ssc / (k - 1);
  const mse = sse / ((n - 1) * (k - 1));
  const denomSingle = msr + (k - 1) * mse + (k * (msc - mse)) / n;
  const denomAvg = msr + (msc - mse) / n;
  if (denomSingle === 0 || denomAvg === 0) return null;
  return { single: (msr - mse) / denomSingle, average: (msr - mse) / denomAvg };
}

export function interpretIcc(v: number | null): string {
  if (v === null) return "n/a";
  if (v >= 0.9) return "excellent";
  if (v >= 0.75) return "good";
  if (v >= 0.5) return "moderate";
  return "poor";
}
