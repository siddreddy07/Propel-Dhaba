import { tool } from "ai";
import { z } from "zod";
import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { tickets } from "../db/schema.js";

export const reviewTicketTool = tool({
  description:
    "Review stored payment records when a customer reports an unexpected charge, duplicate payment, failed payment, or billing discrepancy. Use this tool before making factual claims about payment status.",

  inputSchema: z.object({
    ticketId: z.string(),
  }),

  execute: async ({ ticketId }) => {
    const [ticket] = await db
      .select({
        id: tickets.id,
        purchases: tickets.purchases,
        appOpensSinceRenewal: tickets.appOpensSinceRenewal,
      })
      .from(tickets)
      .where(eq(tickets.id, ticketId))
      .limit(1);
      
    if (!ticket) {
      return {
        status: "not_found" as const,
        requiresInvestigation: true,
      };
    }

    const successful = ticket.purchases.filter(
      (purchase) => purchase.status === "successful"
    );

    const failed = ticket.purchases.filter(
      (purchase) => purchase.status === "failed"
    );

    const initiated = ticket.purchases.filter(
      (purchase) => purchase.status === "initiated"
    );

    return {
      status: "reviewed" as const,
      successfulPayments: successful,
      failedPayments: failed,
      pendingPayments: initiated,
      totalSuccessfulAmount: successful.reduce(
        (sum, purchase) => sum + purchase.amount_inr,
        0
      ),
      appOpensSinceRenewal: ticket.appOpensSinceRenewal,
      requiresInvestigation: initiated.length > 0,
    };
  },
});