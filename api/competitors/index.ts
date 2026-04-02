import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { competitorRepo } from "../../src/db/repositories";
import * as schema from "../../src/db/schema";
import { scrapeCompetitor } from "../../src/trigger/scrape-competitors";

/**
 * GET /api/competitors - List all competitors
 * POST /api/competitors - Create a new competitor
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    return res.status(500).json({ error: "Database not configured" });
  }

  const client = createClient({ url, authToken });
  const db = drizzle(client, { schema });

  try {
    if (req.method === "GET") {
      const competitors = await competitorRepo.findAll(db);
      client.close();
      return res.status(200).json(competitors);
    }

    if (req.method === "POST") {
      const body = req.body;

      if (!body.name || !body.website) {
        client.close();
        return res.status(400).json({ error: "Name and website are required" });
      }

      const competitor = await competitorRepo.create(db, {
        id: crypto.randomUUID(),
        name: body.name,
        website: body.website,
        logo: body.logo,
        founded: body.founded,
        size: body.size,
        location: body.location,
        oneLiner: body.oneLiner,
        targetAudience: body.targetAudience,
        estimatedRevenue: body.estimatedRevenue,
        keyPeople: body.keyPeople,
        threatLevel: body.threatLevel || "Low",
        positionX: body.positionX,
        positionY: body.positionY,
        features: body.features || {},
        pricingModels: body.pricingModels || [],
        socialHandles: body.socialHandles,
        weaknesses: body.weaknesses || [],
        strategies: body.strategies || [],
        strengths: body.strengths || [],
        opportunities: body.opportunities || [],
        threats: body.threats || [],
        sources: body.sources || [],
        notes: body.notes || "",
      });

      scrapeCompetitor
        .trigger({
          competitorId: competitor.id,
          url: competitor.website,
        })
        .catch((err) => {
          console.error("Trigger job error:", err);
        });

      client.close();
      return res.status(201).json(competitor);
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
