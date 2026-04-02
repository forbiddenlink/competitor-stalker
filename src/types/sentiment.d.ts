declare module "sentiment" {
  interface SentimentResult {
    score: number;
    comparative: number;
    calculation: Array<{ [word: string]: number }>;
    tokens: string[];
    words: string[];
    positive: string[];
    negative: string[];
  }

  interface LanguageOptions {
    labels: Record<string, number>;
  }

  class Sentiment {
    analyze(text: string, options?: Record<string, unknown>): SentimentResult;
    registerLanguage(
      languageCode: string,
      options: LanguageOptions
    ): void;
  }

  export default Sentiment;
}
