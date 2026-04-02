import Parser from "rss-parser";

// Create parser with custom fields
const parser = new Parser({
  customFields: {
    feed: ["language", "lastBuildDate", "generator"],
    item: [
      ["media:content", "media"],
      ["content:encoded", "contentEncoded"],
      ["dc:creator", "creator"],
    ],
  },
});

export interface FeedItem {
  title: string;
  link: string;
  pubDate: Date | null;
  content: string;
  contentSnippet: string;
  creator?: string;
  categories: string[];
  guid: string;
  media?: {
    url?: string;
    type?: string;
  };
}

export interface ParsedFeed {
  title: string;
  description: string;
  link: string;
  language?: string;
  lastBuildDate?: Date;
  items: FeedItem[];
}

/**
 * Parse an RSS or Atom feed from URL
 */
export async function parseFeed(url: string): Promise<ParsedFeed> {
  const feed = await parser.parseURL(url);

  return {
    title: feed.title || "Untitled Feed",
    description: feed.description || "",
    link: feed.link || url,
    language: feed.language,
    lastBuildDate: feed.lastBuildDate
      ? new Date(feed.lastBuildDate)
      : undefined,
    items: feed.items.map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "",
      pubDate: item.pubDate ? new Date(item.pubDate) : null,
      content: item.content || item.contentEncoded || "",
      contentSnippet: item.contentSnippet || "",
      creator: item.creator || (item as unknown as { author?: string }).author,
      categories: item.categories || [],
      guid: item.guid || item.link || "",
      media: item.media
        ? {
            url: item.media.$.url,
            type: item.media.$.type,
          }
        : undefined,
    })),
  };
}

/**
 * Parse RSS feed from string content
 */
export async function parseFeedFromString(
  content: string
): Promise<ParsedFeed> {
  const feed = await parser.parseString(content);

  return {
    title: feed.title || "Untitled Feed",
    description: feed.description || "",
    link: feed.link || "",
    language: feed.language,
    lastBuildDate: feed.lastBuildDate
      ? new Date(feed.lastBuildDate)
      : undefined,
    items: feed.items.map((item) => ({
      title: item.title || "Untitled",
      link: item.link || "",
      pubDate: item.pubDate ? new Date(item.pubDate) : null,
      content: item.content || item.contentEncoded || "",
      contentSnippet: item.contentSnippet || "",
      creator: item.creator || (item as unknown as { author?: string }).author,
      categories: item.categories || [],
      guid: item.guid || item.link || "",
      media: item.media
        ? {
            url: item.media.$.url,
            type: item.media.$.type,
          }
        : undefined,
    })),
  };
}

/**
 * Discover RSS feeds from a website URL
 */
export async function discoverFeeds(
  websiteUrl: string
): Promise<{ url: string; title?: string }[]> {
  const feeds: { url: string; title?: string }[] = [];

  // Common feed paths to check
  const commonPaths = [
    "/feed",
    "/feed/",
    "/rss",
    "/rss/",
    "/rss.xml",
    "/feed.xml",
    "/atom.xml",
    "/index.xml",
    "/blog/feed",
    "/blog/rss",
    "/news/feed",
    "/feeds/posts/default",
  ];

  const baseUrl = new URL(websiteUrl).origin;

  // Try common paths
  const checkPromises = commonPaths.map(async (path) => {
    const feedUrl = `${baseUrl}${path}`;
    try {
      const response = await fetch(feedUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });
      if (
        response.ok &&
        (response.headers.get("content-type")?.includes("xml") ||
          response.headers.get("content-type")?.includes("rss"))
      ) {
        return { url: feedUrl };
      }
    } catch {
      // Ignore errors
    }
    return null;
  });

  const results = await Promise.all(checkPromises);
  feeds.push(
    ...results.filter((r): r is { url: string } => r !== null)
  );

  return feeds;
}

/**
 * Filter feed items by date range
 */
export function filterItemsByDate(
  items: FeedItem[],
  since?: Date,
  until?: Date
): FeedItem[] {
  return items.filter((item) => {
    if (!item.pubDate) return false;
    if (since && item.pubDate < since) return false;
    if (until && item.pubDate > until) return false;
    return true;
  });
}

/**
 * Filter feed items by keywords
 */
export function filterItemsByKeywords(
  items: FeedItem[],
  keywords: string[],
  options?: {
    searchTitle?: boolean;
    searchContent?: boolean;
    matchAll?: boolean;
  }
): FeedItem[] {
  const { searchTitle = true, searchContent = true, matchAll = false } =
    options || {};

  const normalizedKeywords = keywords.map((k) => k.toLowerCase());

  return items.filter((item) => {
    const searchText = [
      searchTitle ? item.title : "",
      searchContent ? item.contentSnippet || item.content : "",
    ]
      .join(" ")
      .toLowerCase();

    if (matchAll) {
      return normalizedKeywords.every((keyword) =>
        searchText.includes(keyword)
      );
    }
    return normalizedKeywords.some((keyword) => searchText.includes(keyword));
  });
}

/**
 * Sort feed items by date
 */
export function sortItemsByDate(
  items: FeedItem[],
  order: "asc" | "desc" = "desc"
): FeedItem[] {
  return [...items].sort((a, b) => {
    const dateA = a.pubDate?.getTime() || 0;
    const dateB = b.pubDate?.getTime() || 0;
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Get unique categories from feed items
 */
export function extractCategories(items: FeedItem[]): string[] {
  const categories = new Set<string>();
  items.forEach((item) => {
    item.categories.forEach((cat) => categories.add(cat));
  });
  return Array.from(categories).sort();
}

/**
 * Merge multiple feeds into one, removing duplicates
 */
export function mergeFeeds(feeds: ParsedFeed[]): FeedItem[] {
  const seenGuids = new Set<string>();
  const allItems: FeedItem[] = [];

  for (const feed of feeds) {
    for (const item of feed.items) {
      if (!seenGuids.has(item.guid)) {
        seenGuids.add(item.guid);
        allItems.push(item);
      }
    }
  }

  return sortItemsByDate(allItems);
}
