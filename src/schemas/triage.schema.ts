import { z } from "zod";

const purchaseSchema = z.object({
  id: z.string(),
  type: z.enum(["trial", "renewal"]),
  amount_inr: z.number().nonnegative(),
  status: z.enum(["initiated", "failed", "successful"]),
  at: z.iso.datetime({ offset: true }),
});

export const ticketSchema = z.object({
  id: z.string(),
  received_at: z.iso.datetime({ offset: true }),
  subject: z.string(),
  body: z.string(),
  purchases: z.array(purchaseSchema),
  app_opens_since_renewal: z.number().int().nonnegative(),
});

export type Ticket = z.infer<typeof ticketSchema>;




export const triageResponseSchema = z.object({
  category: z.enum([
    "billing",
    "technical",
    "account",
    "cancellation",
    "feature_request",
    "general",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  refund: z.object({
    approved: z.boolean(),
    amount: z.number().nonnegative(),
    reason: z.string(),
  }),
  reply_draft: z.string(),
  needs_human: z.boolean(),
  confidence: z.number().min(0).max(1),
});

export type TriageResponse = z.infer<typeof triageResponseSchema>;



export const classificationSchema = z.object({
  category: z.enum([
    "billing",
    "technical",
    "account",
    "cancellation",
    "feature_request",
    "general",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  needs_human: z.boolean(),
  refund_required: z.boolean(),
  confidence: z.number().min(0).max(1),
});