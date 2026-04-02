import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { competitorRepo, scheduleRepo } from "../../src/db/repositories";
import * as schema from "../../src/db/schema";
import { scrapeCompetitor } from "../../src/trigger/scrape-competitors";

/**
 * GET /api/competitors/:id - Get a single competitor
 * PUT /api/competitors/:id - Update a competitor
 * DELETE /api/competitors/:id - Delete a competitor
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({ error: "Invalid competitor ID" });
  }

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  try {
    if (req.method === "GET") {
      const competitor = await competitorRepo.findById(db, id);

      if (!competitor) {
        client.close();
        return res.status(404).json({ error: "Competitor not found" });
      }

      // Also fetch scrape schedules
      const schedules = await scheduleRepo.findByCompetitor(db, id);

      client.close();
      return res.status(200).json({ ...competitor, schedules });
    }

    if (req.method === "PUT") {
      const body = req.body;
      const competitor = await competitorRepo.update(db, id, body);

      if (!competitor) {
        client.close();
        return res.status(404).json({ error: "Competitor not found" });
      }

      scrapeCompetitor
        .trigger({
          competitorId: competitor.id,
          url: competitor.website,
        })
        .catch((err) => {
          console.error("Trigger job error:", err);
        });

      client.close();
      return res.status(200).json(competitor);
    }

    if (req.method === "DELETE") {
      await competitorRepo.delete(db, id);
      client.close();
      return res.status(204).end();
    }

    client.close();
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    client.close();
    console.error("API error:", err);
    return res.status(500).json({
      error: err instanceof Error ? err.message : "Internal server error",
    });
  }
}
