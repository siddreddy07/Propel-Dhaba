import { eq, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { refunds, tickets } from "../db/schema.js";
import type { Ticket } from "../schemas/triage.schema.js";

export const saveTicket = async (ticket: Ticket) => {
  const [savedTicket] = await db
    .insert(tickets)
    .values({
      id: ticket.id,
      receivedAt: new Date(ticket.received_at),
      subject: ticket.subject,
      body: ticket.body,
      purchases: ticket.purchases,
      appOpensSinceRenewal: ticket.app_opens_since_renewal,
    })
    .onConflictDoNothing({
      target: tickets.id,
    })
    .returning();

  return savedTicket;
};


export const getExistingTriage = async (ticketId: string) => {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(eq(tickets.id, ticketId))
    .limit(1);

  if (!ticket || ticket.status !== "completed") {
    return null;
  }

  const [refund] = await db
    .select()
    .from(refunds)
    .where(eq(refunds.ticketId, ticketId))
    .limit(1);

  if (!refund) return null;

  return {
    category: ticket.category,
    severity: ticket.severity,
    refund: {
      approved: refund.approved,
      amount: refund.amount,
      reason: refund.reason,
    },
    reply_draft: ticket.replyDraft,
    needs_human: ticket.needsHuman,
    confidence: ticket.confidence,
  };
};


export const claimTicket = async (ticket: Ticket) => {
  const [claimed] = await db
    .insert(tickets)
    .values({
      id: ticket.id,
      receivedAt: new Date(ticket.received_at),
      subject: ticket.subject,
      body: ticket.body,
      purchases: ticket.purchases,
      appOpensSinceRenewal: ticket.app_opens_since_renewal,
      status: "processing",
    })
    .onConflictDoUpdate({
      target: tickets.id,
      set: { status: "processing" },
      setWhere: inArray(tickets.status, ["pending", "failed"]),
    })
    .returning({ id: tickets.id });

  return Boolean(claimed);
};