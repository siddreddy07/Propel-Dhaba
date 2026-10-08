import type { Ticket } from "../schemas/triage.schema.js";

type DisputeType =
  | "standard_refund"
  | "unauthorized_charge"
  | "duplicate_charge"
  | "payment_not_confirmed"
  | "other";

type RefundDecision = {
  approved: boolean;
  amount: number;
  reason: string;
  needsHuman: boolean;
};

export const evaluateRefund = (
  ticket: Ticket,
  disputeType: DisputeType
): RefundDecision => {
  // Disputed payments should not be automatically refunded.
  if (disputeType !== "standard_refund") {
    return {
      approved: false,
      amount: 0,
      reason: "Payment issue requires human investigation.",
      needsHuman: true,
    };
  }

  // Sort by payment date, not array position.
  const latestRenewal = ticket.purchases
    .filter((purchase) => purchase.type === "renewal")
    .sort(
      (a, b) =>
        new Date(b.at).getTime() - new Date(a.at).getTime()
    )[0];

  if (!latestRenewal || latestRenewal.status !== "successful") {
    return {
      approved: false,
      amount: 0,
      reason: "Latest renewal payment is not confirmed successful.",
      needsHuman: true,
    };
  }

  const daysSinceRenewal =
    (new Date(ticket.received_at).getTime() -
      new Date(latestRenewal.at).getTime()) /
    86_400_000;

  // Assumed assignment policy: 7-day unused-renewal window.
  if (
    !Number.isFinite(daysSinceRenewal) ||
    daysSinceRenewal < 0 ||
    daysSinceRenewal > 7
  ) {
    return {
      approved: false,
      amount: 0,
      reason: "Renewal is outside the assumed 7-day refund window.",
      needsHuman: true,
    };
  }

  if (ticket.app_opens_since_renewal !== 0) {
    return {
      approved: false,
      amount: 0,
      reason: "App usage after renewal requires manual review.",
      needsHuman: true,
    };
  }

  return {
    approved: true,
    amount: latestRenewal.amount_inr,
    reason: "Eligible under the assumed 7-day unused-renewal policy.",
    needsHuman: false,
  };
};