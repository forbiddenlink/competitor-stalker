import Sentiment from "sentiment";

const analyzer = new Sentiment();

export interface SentimentResult {
  score: number;
  comparative: number;
  calculation: Array<{ [word: string]: number }>;
  tokens: string[];
  words: string[];
  positive: string[];
  negative: string[];
  sentiment: "positive" | "negative" | "neutral";
  confidence: number;
}

export interface BulkSentimentResult {
  items: Array<{
    text: string;
    result: SentimentResult;
  }>;
  summary: {
    averageScore: number;
    averageComparative: number;
    distribution: {
      positive: number;
      negative: number;
      neutral: number;
    };
    topPositiveWords: Array<{ word: string; count: number }>;
    topNegativeWords: Array<{ word: string; count: number }>;
  };
}

/**
 * Analyze sentiment of a single text
 */
export function analyzeSentiment(text: string): SentimentResult {
  const result = analyzer.analyze(text);

  // Determine sentiment category
  let sentiment: "positive" | "negative" | "neutral";
  if (result.comparative > 0.1) {
    sentiment = "positive";
  } else if (result.comparative < -0.1) {
    sentiment = "negative";
  } else {
    sentiment = "neutral";
  }

  // Calculate confidence based on comparative score magnitude
  const confidence = Math.min(Math.abs(result.comparative) * 2, 1);

  return {
    score: result.score,
    comparative: result.comparative,
    calculation: result.calculation,
    tokens: result.tokens,
    words: result.words,
    positive: result.positive,
    negative: result.negative,
    sentiment,
    confidence,
  };
}

/**
 * Analyze sentiment of multiple texts with aggregated statistics
 */
export function analyzeBulkSentiment(texts: string[]): BulkSentimentResult {
  const results = texts.map((text) => ({
    text,
    result: analyzeSentiment(text),
  }));

  // Count word occurrences
  const positiveWordCounts = new Map<string, number>();
  const negativeWordCounts = new Map<string, number>();

  let totalScore = 0;
  let totalComparative = 0;
  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  for (const { result } of results) {
    totalScore += result.score;
    totalComparative += result.comparative;

    if (result.sentiment === "positive") positiveCount++;
    else if (result.sentiment === "negative") negativeCount++;
    else neutralCount++;

    for (const word of result.positive) {
      positiveWordCounts.set(word, (positiveWordCounts.get(word) || 0) + 1);
    }
    for (const word of result.negative) {
      negativeWordCounts.set(word, (negativeWordCounts.get(word) || 0) + 1);
    }
  }

  const total = results.length || 1;

  // Get top words
  const topPositiveWords = Array.from(positiveWordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  const topNegativeWords = Array.from(negativeWordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word, count]) => ({ word, count }));

  return {
    items: results,
    summary: {
      averageScore: totalScore / total,
      averageComparative: totalComparative / total,
      distribution: {
        positive: positiveCount,
        negative: negativeCount,
        neutral: neutralCount,
      },
      topPositiveWords,
      topNegativeWords,
    },
  };
}

/**
 * Compare sentiment between two texts
 */
export function compareSentiment(
  textA: string,
  textB: string
): {
  resultA: SentimentResult;
  resultB: SentimentResult;
  comparison: {
    scoreDifference: number;
    morePositive: "A" | "B" | "equal";
    sharedPositiveWords: string[];
    sharedNegativeWords: string[];
  };
} {
  const resultA = analyzeSentiment(textA);
  const resultB = analyzeSentiment(textB);

  const sharedPositiveWords = resultA.positive.filter((word) =>
    resultB.positive.includes(word)
  );
  const sharedNegativeWords = resultA.negative.filter((word) =>
    resultB.negative.includes(word)
  );

  let morePositive: "A" | "B" | "equal";
  if (resultA.comparative > resultB.comparative + 0.05) {
    morePositive = "A";
  } else if (resultB.comparative > resultA.comparative + 0.05) {
    morePositive = "B";
  } else {
    morePositive = "equal";
  }

  return {
    resultA,
    resultB,
    comparison: {
      scoreDifference: resultA.score - resultB.score,
      morePositive,
      sharedPositiveWords,
      sharedNegativeWords,
    },
  };
}

/**
 * Track sentiment over time from timestamped entries
 */
export function analyzeSentimentTrend(
  entries: Array<{ text: string; date: Date }>
): {
  trend: Array<{
    date: Date;
    sentiment: SentimentResult;
  }>;
  trendDirection: "improving" | "declining" | "stable";
  averageChange: number;
} {
  // Sort by date
  const sorted = [...entries].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const trend = sorted.map((entry) => ({
    date: entry.date,
    sentiment: analyzeSentiment(entry.text),
  }));

  // Calculate trend direction using linear regression-like approach
  if (trend.length < 2) {
    return { trend, trendDirection: "stable", averageChange: 0 };
  }

  const changes: number[] = [];
  for (let i = 1; i < trend.length; i++) {
    changes.push(
      trend[i].sentiment.comparative - trend[i - 1].sentiment.comparative
    );
  }

  const averageChange = changes.reduce((a, b) => a + b, 0) / changes.length;

  let trendDirection: "improving" | "declining" | "stable";
  if (averageChange > 0.05) {
    trendDirection = "improving";
  } else if (averageChange < -0.05) {
    trendDirection = "declining";
  } else {
    trendDirection = "stable";
  }

  return { trend, trendDirection, averageChange };
}

/**
 * Register custom words with sentiment scores
 */
export function registerCustomWords(
  words: Record<string, number>
): void {
  analyzer.registerLanguage("en", {
    labels: words,
  });
}

/**
 * Get sentiment category label from score
 */
export function getSentimentLabel(
  comparative: number
): "very negative" | "negative" | "slightly negative" | "neutral" | "slightly positive" | "positive" | "very positive" {
  if (comparative <= -0.5) return "very negative";
  if (comparative <= -0.2) return "negative";
  if (comparative < -0.05) return "slightly negative";
  if (comparative <= 0.05) return "neutral";
  if (comparative < 0.2) return "slightly positive";
  if (comparative < 0.5) return "positive";
  return "very positive";
}

/**
 * Extract emotionally charged phrases from text
 */
export function extractEmotionalPhrases(
  text: string,
  windowSize: number = 5
): Array<{ phrase: string; score: number }> {
  const words = text.split(/\s+/);
  const phrases: Array<{ phrase: string; score: number }> = [];

  for (let i = 0; i <= words.length - windowSize; i++) {
    const phrase = words.slice(i, i + windowSize).join(" ");
    const result = analyzer.analyze(phrase);
    if (Math.abs(result.comparative) > 0.3) {
      phrases.push({
        phrase,
        score: result.comparative,
      });
    }
  }

  // Sort by absolute score
  return phrases.sort(
    (a, b) => Math.abs(b.score) - Math.abs(a.score)
  );
}
