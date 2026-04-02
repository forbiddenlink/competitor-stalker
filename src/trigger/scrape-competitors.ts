import { task, schedules } from "@trigger.dev/sdk/v3";

// Nightly competitor scraping
export const scrapeCompetitors = schedules.task({
  id: "scrape-competitors",
  cron: "0 2 * * *",
  run: async () => {
    console.log("Starting nightly competitor scrape");
    // TODO: Wire up to existing Playwright/Cheerio scraping logic
  },
});

export const scrapeCompetitor = task({
  id: "scrape-single-competitor",
  retry: { maxAttempts: 3 },
  run: async (payload: { competitorId: string; url: string }) => {
    console.log(`Scraping competitor: ${payload.url}`);
  },
});
