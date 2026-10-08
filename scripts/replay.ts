import "dotenv/config";
import { readFile } from "node:fs/promises";
import { ticketSchema } from "../src/schemas/triage.schema.js";

const file = await readFile(
  "./fixtures/dhaba_tickets.json",
  "utf-8"
);

const data = JSON.parse(file);

const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const BATCH_SIZE = process.env.TRIAGE_MODE === "fixture" ? 6 : 3;
const BATCH_DELAY = process.env.TRIAGE_MODE === "fixture" ? 0 : 30_000;

const results = [];

for (let i = 0; i < data.tickets.length; i += BATCH_SIZE) {
  const batch = data.tickets.slice(i, i + BATCH_SIZE);

  for (const rawTicket of batch) {
    const ticket = ticketSchema.parse(rawTicket);

    try {
      const response = await fetch("http://localhost:8000/api/triage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticket),
      });

      const result = await response.json();

      if (!response.ok) {
  results.push({
    id: ticket.id,
    status: response.status,
    error: result.error ?? "Triage failed",
  });

  continue;
}

      results.push({
  id: ticket.id,
  status: response.status,
  category: result.category,
  severity: result.severity,
  refundApproved: result.refund?.approved,
  refundAmount: result.refund?.amount,
  needsHuman: result.needs_human,
  confidence: result.confidence,
});


    } catch (error) {
      results.push({
        id: ticket.id,
        error:
          error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  console.log(`Completed ${Math.min(i + BATCH_SIZE, data.tickets.length)} tickets`);

  if (i + BATCH_SIZE < data.tickets.length) {
    console.log("Waiting 30 seconds before next batch...");
    await sleep(BATCH_DELAY);
  }
}


console.table(results);