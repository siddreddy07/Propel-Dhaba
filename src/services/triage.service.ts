import { and, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { refunds, tickets } from "../db/schema.js";
import { classifyTicket, generateReply, type RefundDecision } from "./ai.service.js";
import { claimTicket, getExistingTriage } from "./ticket.service.js";
import {
  triageResponseSchema,
  type Ticket,
  type TriageResponse,
} from "../schemas/triage.schema.js";

export const triageService = async (
  ticket: Ticket
): Promise<TriageResponse> => {
  const existing = await getExistingTriage(ticket.id);
  if (existing) return triageResponseSchema.parse(existing);

  const claimed = await claimTicket(ticket);

  if (!claimed) {
    const completed = await getExistingTriage(ticket.id);
    if (completed) return triageResponseSchema.parse(completed);

    throw new Error("Ticket is already being processed.");
  }

  try {
    const { classification, refundDecision } = await classifyTicket(ticket);

const refund: RefundDecision = refundDecision ?? {
  approved: false,
  amount: 0,
  reason: classification.refund_required
    ? "Refund evaluation was not completed."
    : "No refund required.",
  needsHuman: classification.category === "billing",
};

const needsHuman = classification.needs_human || refund.needsHuman;
    const replyDraft = await generateReply(ticket, refund);

    const response = triageResponseSchema.parse({
      ...classification,
      refund: {
        approved: refund.approved,
        amount: refund.amount,
        reason: refund.reason,
      },
      reply_draft: replyDraft,
      needs_human: needsHuman,
    });

    await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(tickets)
        .set({
          category: response.category,
          severity: response.severity,
          replyDraft: response.reply_draft,
          needsHuman: response.needs_human,
          confidence: response.confidence,
          status: "completed",
        })
        .where(
          and(
            eq(tickets.id, ticket.id),
            eq(tickets.status, "processing")
          )
        )
        .returning({ id: tickets.id });

      if (!updated) throw new Error("Ticket processing state changed.");

      await tx
        .insert(refunds)
        .values({
          ticketId: ticket.id,
          approved: response.refund.approved,
          amount: response.refund.amount,
          reason: response.refund.reason,
        })
        .onConflictDoUpdate({
          target: refunds.ticketId,
          set: {
            approved: response.refund.approved,
            amount: response.refund.amount,
            reason: response.refund.reason,
          },
        });
    });

    return response;
  } catch (error) {
    await db
      .update(tickets)
      .set({ status: "failed" })
      .where(
        and(
          eq(tickets.id, ticket.id),
          eq(tickets.status, "processing")
        )
      );

    console.error("Triage failed:", ticket.id, error);
    throw error;
  }
};