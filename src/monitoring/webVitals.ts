import { track } from '@vercel/analytics';
import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric, type ReportOpts } from 'web-vitals';

type VitalName = Metric['name'];

type VitalTarget = {
  good: number;
  needsImprovement: number;
  unit: 'ms' | 'score';
};

const VITAL_TARGETS: Record<VitalName, VitalTarget> = {
  CLS: { good: 0.1, needsImprovement: 0.25, unit: 'score' },
  FCP: { good: 1800, needsImprovement: 3000, unit: 'ms' },
  INP: { good: 200, needsImprovement: 500, unit: 'ms' },
  LCP: { good: 2500, needsImprovement: 4000, unit: 'ms' },
  TTFB: { good: 800, needsImprovement: 1800, unit: 'ms' },
};

const DEFAULT_SAMPLE_RATE = 1;

const parseSampleRate = () => {
  const rawValue = import.meta.env.VITE_WEB_VITALS_SAMPLE_RATE;
  if (!rawValue) {
    return DEFAULT_SAMPLE_RATE;
  }

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0 || parsedValue > 1) {
    return DEFAULT_SAMPLE_RATE;
  }

  return parsedValue;
};

const shouldSample = (sampleRate: number) => Math.random() <= sampleRate;

const roundMetric = (metricName: VitalName, value: number) =>
  metricName === 'CLS' ? Number(value.toFixed(4)) : Math.round(value);

const reportMetric = (metric: Metric) => {
  const target = VITAL_TARGETS[metric.name];
  const value = roundMetric(metric.name, metric.value);
  const delta = roundMetric(metric.name, metric.delta);

  track('web_vital', {
    metric: metric.name,
    value,
    delta,
    rating: metric.rating,
    unit: target.unit,
    good_threshold: target.good,
    needs_improvement_threshold: target.needsImprovement,
    navigation_type: metric.navigationType,
  });
};

const reportOptions: ReportOpts = {
  reportAllChanges: false,
};

export const initWebVitals = () => {
  if (typeof window === 'undefined') {
    return;
  }

  const sampleRate = parseSampleRate();
  if (!shouldSample(sampleRate)) {
    return;
  }

  onCLS(reportMetric, reportOptions);
  onFCP(reportMetric, reportOptions);
  onINP(reportMetric, reportOptions);
  onLCP(reportMetric, reportOptions);
  onTTFB(reportMetric, reportOptions);
};
