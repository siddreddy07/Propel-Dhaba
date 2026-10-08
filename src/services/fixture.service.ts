import { readFile } from "node:fs/promises";
import { classificationSchema, type Ticket } from "../schemas/triage.schema.js";
import { evaluateRefund } from "./refund.service.js";

export const classifyFixture = async (ticket: Ticket) => {
  const fixtures = JSON.parse(
    await readFile("fixtures/classifications.json", "utf8")
  );

  console.log("Classifying ticket using fixture data:", ticket.id);

const fixture = fixtures.find(
  (item: { id: string }) => item.id === ticket.id
);

  if (!fixture) {
    throw new Error(`Missing fixture for ${ticket.id}`);
  }

  const classification = classificationSchema.parse(fixture);

  const refundDecision = classification.refund_required
    ? evaluateRefund(ticket, fixture.dispute_type ?? "other")
    : undefined;

  return { classification, refundDecision };
};