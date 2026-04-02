import { chromium } from "playwright";
import type { Browser, Page, BrowserContext } from "playwright";

let browserInstance: Browser | null = null;

export interface BrowserOptions {
  headless?: boolean;
  proxy?: {
    server: string;
    username?: string;
    password?: string;
  };
  userAgent?: string;
  viewport?: { width: number; height: number };
}

export interface PageOptions {
  timeout?: number;
  waitUntil?: "load" | "domcontentloaded" | "networkidle" | "commit";
  blockResources?: Array<"image" | "stylesheet" | "font" | "media">;
}

/**
 * Get or create a browser instance
 */
export async function getBrowser(options: BrowserOptions = {}): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }

  browserInstance = await chromium.launch({
    headless: options.headless ?? true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
    ],
  });

  return browserInstance;
}

/**
 * Create a new browser context with options
 */
export async function createContext(
  options: BrowserOptions = {}
): Promise<BrowserContext> {
  const browser = await getBrowser(options);

  const contextOptions: Parameters<Browser["newContext"]>[0] = {
    viewport: options.viewport ?? { width: 1920, height: 1080 },
    userAgent:
      options.userAgent ??
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    locale: "en-US",
    timezoneId: "America/New_York",
  };

  if (options.proxy) {
    contextOptions.proxy = options.proxy;
  }

  return browser.newContext(contextOptions);
}

/**
 * Create a new page with resource blocking
 */
export async function createPage(
  context: BrowserContext,
  options: PageOptions = {}
): Promise<Page> {
  const page = await context.newPage();

  // Block specified resources
  if (options.blockResources?.length) {
    await page.route("**/*", (route) => {
      const resourceType = route.request().resourceType();
      if (options.blockResources?.includes(resourceType as "image" | "stylesheet" | "font" | "media")) {
        route.abort();
      } else {
        route.continue();
      }
    });
  }

  // Set default timeout
  page.setDefaultTimeout(options.timeout ?? 30000);

  return page;
}

/**
 * Navigate to URL and wait for content
 */
export async function navigateAndWait(
  page: Page,
  url: string,
  options: PageOptions = {}
): Promise<void> {
  await page.goto(url, {
    waitUntil: options.waitUntil ?? "domcontentloaded",
    timeout: options.timeout ?? 30000,
  });
}

/**
 * Get page HTML content
 */
export async function getPageContent(page: Page): Promise<string> {
  return page.content();
}

/**
 * Take a screenshot of the page
 */
export async function takeScreenshot(
  page: Page,
  options?: {
    fullPage?: boolean;
    path?: string;
    type?: "png" | "jpeg";
    quality?: number;
  }
): Promise<Buffer> {
  return page.screenshot({
    fullPage: options?.fullPage ?? false,
    path: options?.path,
    type: options?.type ?? "png",
    quality: options?.type === "jpeg" ? options?.quality ?? 80 : undefined,
  });
}

/**
 * Extract text content from elements
 */
export async function extractText(
  page: Page,
  selector: string
): Promise<string[]> {
  return page.$$eval(selector, (elements) =>
    elements.map((el) => el.textContent?.trim() || "")
  );
}

/**
 * Extract attribute values from elements
 */
export async function extractAttributes(
  page: Page,
  selector: string,
  attribute: string
): Promise<(string | null)[]> {
  return page.$$eval(
    selector,
    (elements, attr) => elements.map((el) => el.getAttribute(attr)),
    attribute
  );
}

/**
 * Wait for and extract content after JavaScript execution
 */
export async function waitForContent(
  page: Page,
  selector: string,
  timeout?: number
): Promise<string | null> {
  try {
    await page.waitForSelector(selector, { timeout: timeout ?? 10000 });
    return page.$eval(selector, (el) => el.textContent?.trim() || null);
  } catch {
    return null;
  }
}

/**
 * Scroll page to load lazy content
 */
export async function scrollPage(
  page: Page,
  options?: {
    scrollDelay?: number;
    maxScrolls?: number;
  }
): Promise<void> {
  const { scrollDelay = 500, maxScrolls = 10 } = options ?? {};

  let previousHeight = 0;
  let scrollCount = 0;

  while (scrollCount < maxScrolls) {
    const currentHeight = await page.evaluate(() => document.body.scrollHeight);

    if (currentHeight === previousHeight) {
      break;
    }

    previousHeight = currentHeight;
    await page.evaluate(() =>
      window.scrollTo(0, document.body.scrollHeight)
    );
    await page.waitForTimeout(scrollDelay);
    scrollCount++;
  }
}

/**
 * Click element and wait for navigation or response
 */
export async function clickAndWait(
  page: Page,
  selector: string,
  options?: {
    waitForNavigation?: boolean;
    waitForSelector?: string;
    timeout?: number;
  }
): Promise<void> {
  const { waitForNavigation = false, waitForSelector, timeout = 10000 } =
    options ?? {};

  if (waitForNavigation) {
    await Promise.all([
      page.waitForNavigation({ timeout }),
      page.click(selector),
    ]);
  } else if (waitForSelector) {
    await Promise.all([
      page.waitForSelector(waitForSelector, { timeout }),
      page.click(selector),
    ]);
  } else {
    await page.click(selector);
  }
}

/**
 * Fill form fields
 */
export async function fillForm(
  page: Page,
  fields: Record<string, string>
): Promise<void> {
  for (const [selector, value] of Object.entries(fields)) {
    await page.fill(selector, value);
  }
}

/**
 * Extract structured data (JSON-LD) from page
 */
export async function extractStructuredData(
  page: Page
): Promise<unknown[]> {
  return page.$$eval(
    'script[type="application/ld+json"]',
    (scripts) =>
      scripts.map((script) => {
        try {
          return JSON.parse(script.textContent || "");
        } catch {
          return null;
        }
      }).filter(Boolean)
  );
}

/**
 * Get all cookies from current context
 */
export async function getCookies(
  context: BrowserContext
): Promise<Array<{ name: string; value: string; domain: string }>> {
  return context.cookies();
}

/**
 * Close browser instance
 */
export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}

/**
 * Run a scraping task with automatic cleanup
 */
export async function withBrowser<T>(
  task: (page: Page, context: BrowserContext) => Promise<T>,
  options?: BrowserOptions & PageOptions
): Promise<T> {
  const context = await createContext(options);
  const page = await createPage(context, options);

  try {
    return await task(page, context);
  } finally {
    await context.close();
  }
}
