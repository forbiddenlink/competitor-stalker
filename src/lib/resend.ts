import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

/**
 * Send competitor analysis digest
 */
export async function sendCompetitorDigest({
  userEmail,
  competitors,
  changes,
}: {
  userEmail: string;
  competitors: string[];
  changes: number;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const resend = getResend();
  if (!resend) {
    return { success: false, error: "Resend API key not configured" };
  }

  const html = `
    <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h2>Competitor Stalker Digest</h2>
        <p>Your tracked competitors have ${changes} changes this week:</p>
        <ul>
          ${competitors.map((c) => `<li>${c}</li>`).join("")}
        </ul>
        <p><a href="https://competitor-stalker.dev/dashboard" style="background-color: #007bff; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">View Full Analysis</a></p>
      </body>
    </html>
  `;

  try {
    const response = await resend.emails.send({
      from: "digest@competitor-stalker.dev",
      to: userEmail,
      subject: `Competitor Update: ${changes} changes detected`,
      html,
      text: `Your tracked competitors have ${changes} changes this week.`,
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return { success: true, id: response.data?.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send digest",
    };
  }
}
