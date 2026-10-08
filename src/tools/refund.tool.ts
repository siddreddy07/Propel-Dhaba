import { tool } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { tickets } from "../db/schema.js";
import { evaluateRefund } from "../services/refund.service.js";

export const refundTool = tool({
  description:
    "Evaluate refund eligibility for a ticket using stored purchase records and refund policy. Use for refund requests and payment disputes.",

  inputSchema: z.object({
    ticketId: z.string(),
    disputeType: z.enum([
      "standard_refund",
      "unauthorized_charge",
      "duplicate_charge",
      "payment_not_confirmed",
      "other",
    ]),
  }),

  execute: async ({ ticketId, disputeType }) => {
    const [ticket] = await db
      .select({
        id: tickets.id,
        received_at: tickets.receivedAt,
        subject: tickets.subject,
        body: tickets.body,
        purchases: tickets.purchases,
        app_opens_since_renewal: tickets.appOpensSinceRenewal,
      })
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);

    if (!ticket) {
      return {
        approved: false,
        amount: 0,
        reason: "Ticket not found.",
        needsHuman: true,
      };
    }

    return evaluateRefund(  {
    ...ticket,
    received_at: ticket.received_at.toISOString(),
  }, disputeType);
  },
});