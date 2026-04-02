/**
 * competitor-stalker - NLP analysis utilities
 * Sentiment analysis, language detection, content scoring
 */
import natural from "natural";
import { franc } from "franc";
import { readingTime } from "reading-time-estimator";

// ── Sentiment Analysis ─────────────────────────────────────────────────────────

const analyzer = new natural.SentimentAnalyzer(
  "English",
  natural.PorterStemmer,
  "afinn",
);
const tokenizer = new natural.WordTokenizer();

export interface SentimentResult {
  score: number;
  label: "positive" | "negative" | "neutral";
  confidence: number;
}

export function analyzeSentiment(text: string): SentimentResult {
  const tokens = tokenizer.tokenize(text) ?? [];
  const score = analyzer.getSentiment(tokens);
  const label =
    score > 0.05 ? "positive" : score < -0.05 ? "negative" : "neutral";
  const confidence = Math.min(Math.abs(score) * 10, 1);
  return { score, label, confidence };
}

// ── Language Detection ─────────────────────────────────────────────────────────

export function detectLanguage(text: string): {
  language: string;
  confidence: "high" | "medium" | "low";
} {
  const detected = franc(text, { minLength: 20 });
  const isUnd = detected === "und";
  return {
    language: isUnd ? "unknown" : detected,
    confidence: isUnd ? "low" : text.length > 100 ? "high" : "medium",
  };
}

// ── Content Analysis ───────────────────────────────────────────────────────────

export interface ContentAnalysis {
  wordCount: number;
  readingTimeMinutes: number;
  sentiment: SentimentResult;
  language: string;
  topKeywords: string[];
  readabilityScore: number;
}

export function analyzeContent(text: string): ContentAnalysis {
  const reading = readingTime(text, 200);
  const wordCount = reading.words;
  const sentiment = analyzeSentiment(text);
  const { language } = detectLanguage(text);

  // Extract top keywords using TF scoring
  const tokens = tokenizer.tokenize(text.toLowerCase()) ?? [];
  const stopWords = new Set(natural.stopwords);
  const meaningfulTokens = tokens.filter(
    (t) => !stopWords.has(t) && t.length > 3,
  );
  const freq: Record<string, number> = {};
  meaningfulTokens.forEach((t) => (freq[t] = (freq[t] ?? 0) + 1));
  const topKeywords = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word);

  // Simple readability score (Flesch-Kincaid approximation)
  const sentences = text.split(/[.!?]+/).filter(Boolean).length;
  const avgWordsPerSentence = wordCount / Math.max(sentences, 1);
  const avgSyllablesPerWord = 1.5; // approximation
  const readabilityScore = Math.max(
    0,
    Math.min(
      100,
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord,
    ),
  );

  return {
    wordCount,
    readingTimeMinutes: reading.minutes,
    sentiment,
    language,
    topKeywords,
    readabilityScore,
  };
}

// ── Competitive Scoring ────────────────────────────────────────────────────────

export function scoreCompetitorContent(analysis: ContentAnalysis): number {
  let score = 0;
  if (analysis.wordCount > 1000) score += 20;
  else if (analysis.wordCount > 500) score += 10;
  if (analysis.readabilityScore > 60) score += 15;
  if (analysis.sentiment.label === "positive") score += 10;
  if (analysis.readingTimeMinutes > 3) score += 10;
  return Math.min(score, 100);
}
