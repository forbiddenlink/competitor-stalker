/**
 * Google PageSpeed Insights API Integration
 * Fetches Core Web Vitals and Lighthouse scores for competitor URLs.
 * https://developers.google.com/speed/docs/insights/v5/reference/pagespeedapi/runpagespeed
 *
 * Free tier: 25,000 requests/day with API key.
 * Requires: PAGESPEED_API_KEY (optional — works without key at lower quota)
 */

const PSI_API = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PageSpeedStrategy = "mobile" | "desktop";

export interface CoreWebVitals {
  /** Largest Contentful Paint (ms) */
  lcp: number | null;
  /** First Input Delay / INP (ms) */
  fid: number | null;
  /** Cumulative Layout Shift (score) */
  cls: number | null;
  /** First Contentful Paint (ms) */
  fcp: number | null;
  /** Total Blocking Time (ms) */
  tbt: number | null;
  /** Speed Index (ms) */
  speedIndex: number | null;
  /** Time to Interactive (ms) */
  tti: number | null;
}

export interface LighthouseScore {
  performance: number; // 0–100
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface PageSpeedResult {
  url: string;
  strategy: PageSpeedStrategy;
  fetchTime: string;
  scores: LighthouseScore;
  vitals: CoreWebVitals;
  opportunities: Array<{
    id: string;
    title: string;
    description: string;
    savingsMs?: number;
    savingsBytes?: number;
  }>;
}

export interface CompetitorReport {
  url: string;
  mobile: PageSpeedResult | null;
  desktop: PageSpeedResult | null;
  comparison?: CompetitorMetricComparison;
}

export interface CompetitorMetricComparison {
  betterThan: string[]; // areas where competitor lags
  worseThan: string[]; // areas where competitor excels
  similar: string[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractAuditValue(
  audits: Record<string, { numericValue?: number }>,
  key: string,
): number | null {
  return audits[key]?.numericValue ?? null;
}

function extractLighthouseScore(
  categories: Record<string, { score: number }>,
  key: string,
): number {
  return Math.round((categories[key]?.score ?? 0) * 100);
}

// ─── Fetcher ──────────────────────────────────────────────────────────────────

/**
 * Run PageSpeed Insights for a URL and strategy.
 */
export async function runPageSpeed(
  url: string,
  strategy: PageSpeedStrategy = "mobile",
  signal?: AbortSignal,
): Promise<PageSpeedResult | null> {
  const params = new URLSearchParams({
    url,
    strategy,
    category: "performance",
    category_accessibility: "accessibility",
    category_best_practices: "best-practices",
    category_seo: "seo",
  });

  // API key is optional — without it quota is ~1 req/100s
  const key = process.env.PAGESPEED_API_KEY;
  if (key) params.set("key", key);

  try {
    const res = await fetch(`${PSI_API}?${params}`, { signal });
    if (!res.ok) {
      console.warn(`PageSpeed API ${res.status} for ${url}`);
      return null;
    }

    const json = await res.json();
    const lr = json.lighthouseResult;

    if (!lr) return null;

    const audits: Record<string, { numericValue?: number }> = lr.audits ?? {};
    const categories: Record<string, { score: number }> = lr.categories ?? {};

    return {
      url,
      strategy,
      fetchTime: json.analysisUTCTimestamp ?? new Date().toISOString(),
      scores: {
        performance: extractLighthouseScore(categories, "performance"),
        accessibility: extractLighthouseScore(categories, "accessibility"),
        bestPractices: extractLighthouseScore(categories, "best-practices"),
        seo: extractLighthouseScore(categories, "seo"),
      },
      vitals: {
        lcp: extractAuditValue(audits, "largest-contentful-paint"),
        fid: extractAuditValue(audits, "max-potential-fid"),
        cls: extractAuditValue(audits, "cumulative-layout-shift"),
        fcp: extractAuditValue(audits, "first-contentful-paint"),
        tbt: extractAuditValue(audits, "total-blocking-time"),
        speedIndex: extractAuditValue(audits, "speed-index"),
        tti: extractAuditValue(audits, "interactive"),
      },
      opportunities: Object.entries(
        lr.audits as Record<
          string,
          {
            id: string;
            title: string;
            description: string;
            score: number;
            details?: {
              overallSavingsMs?: number;
              overallSavingsBytes?: number;
            };
          }
        >,
      )
        .filter(
          ([, audit]) =>
            audit.score !== null && audit.score < 0.9 && audit.details,
        )
        .slice(0, 10)
        .map(([, audit]) => ({
          id: audit.id,
          title: audit.title,
          description: audit.description,
          savingsMs: audit.details?.overallSavingsMs,
          savingsBytes: audit.details?.overallSavingsBytes,
        })),
    };
  } catch (err) {
    console.error("PageSpeed fetch error:", err);
    return null;
  }
}

/**
 * Run both mobile and desktop PageSpeed for a URL.
 */
export async function analyzeCompetitor(
  url: string,
): Promise<CompetitorReport> {
  const [mobile, desktop] = await Promise.all([
    runPageSpeed(url, "mobile"),
    runPageSpeed(url, "desktop"),
  ]);
  return { url, mobile, desktop };
}

/**
 * Compare two competitor reports and identify gaps.
 */
export function compareCompetitors(
  ours: CompetitorReport,
  theirs: CompetitorReport,
): CompetitorMetricComparison {
  const betterThan: string[] = [];
  const worseThan: string[] = [];
  const similar: string[] = [];

  const metrics: Array<keyof LighthouseScore> = [
    "performance",
    "accessibility",
    "bestPractices",
    "seo",
  ];

  for (const m of metrics) {
    const ourScore = ours.desktop?.scores[m] ?? ours.mobile?.scores[m] ?? 0;
    const theirScore =
      theirs.desktop?.scores[m] ?? theirs.mobile?.scores[m] ?? 0;
    const diff = ourScore - theirScore;
    if (diff > 10) betterThan.push(`${m} (+${diff} pts)`);
    else if (diff < -10) worseThan.push(`${m} (${diff} pts)`);
    else similar.push(m);
  }

  return { betterThan, worseThan, similar };
}

/**
 * Batch analyze multiple competitor URLs.
 * Adds a delay between requests to respect rate limits.
 */
export async function batchAnalyze(
  urls: string[],
  delayMs = 2000,
): Promise<CompetitorReport[]> {
  const results: CompetitorReport[] = [];
  for (const url of urls) {
    results.push(await analyzeCompetitor(url));
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
  }
  return results;
}
