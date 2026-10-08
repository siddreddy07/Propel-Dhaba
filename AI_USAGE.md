# AI Usage

## 1. Tools I Used

I used ChatGPT and OpenCode while building this assignment. I estimate around 80 - 85 % of the code was AI-generated.

I mainly used ChatGPT to discuss implementation decisions, understand the Vercel AI SDK, and debug issues. OpenCode helped with the agent and tool-calling implementation.

I worked through the project in smaller parts instead of generating everything at once. I reviewed the code, checked how the different pieces worked together, and ran the provided tickets to catch problems.

## 2. My Best Prompt

This was the prompt I prepared for OpenCode while working on the tool-calling flow:

> I'm building a customer support ticket triage system using Node.js, TypeScript, Groq, and the Vercel AI SDK.
>
> I was going through the Vercel AI SDK documentation and found `ToolLoopAgent`. I think it would be a good fit here instead of manually handling tool calls with `generateText`.
>
> Here's how I want the flow to work:
>
> The agent receives a customer ticket and classifies its category, severity, confidence, and whether human intervention is needed.
>
> I want two tools:
>
> 1. `reviewTicket` — fetch the ticket and its purchase history from PostgreSQL.
> 2. `evaluateRefund` — check whether the customer qualifies for a refund.
>
> One important thing: I don't want the AI to approve refunds based on its own reasoning. The refund policy should be implemented separately in TypeScript, and the tool should execute those rules. The agent should only decide when to call the tool.
>
> I'm using Drizzle ORM with Neon PostgreSQL and Zod for validation.
>
> Can you help me implement this using Vercel AI SDK's `ToolLoopAgent` with structured output?
>
> Keep the architecture simple. Separate the agent, tools, and refund policy into their own files. Don't introduce unnecessary abstractions or extra dependencies.
>
> First, review the existing project structure and the relevant Vercel AI SDK API. Then explain the changes you recommend before modifying any files. Don't rewrite working code unnecessarily.

## 3. One Thing AI Got Wrong

One problem I caught was during reply generation.

A customer had requested a GST invoice, and the AI generated a reply saying the invoice had already been emailed. But my application doesn't generate invoices or send emails, so that wasn't true.

I noticed it while running the replay script and going through the responses for the 12 test tickets.

I updated the reply-generation instructions and added checks to catch unsupported claims. If a generated reply fails those checks, the system can use a safer fallback instead.

I also ran into an issue with refund tool results. The agent could classify a ticket as needing a refund evaluation, but that didn't always mean the refund tool had returned a decision. I handled this by checking the actual tool results and sending cases without a required refund decision for human review.

## 4. What I Did Myself

I used AI to write most of the code, but the decisions about how the system should work were mine.

While reading the Vercel AI SDK docs, I found `ToolLoopAgent` and suggested using it instead of manually handling tool calls. I explained how I wanted the agent to classify tickets, fetch purchase details, and call the refund tool. AI helped me implement it, and I made changes whenever something didn't work as expected.

I also decided to keep the refund rules separate from the AI, since I didn't want the model making those decisions on its own.

Another thing I worked on was the batch testing. Initially, I was sending all 12 tickets through the live AI, but the classification calls kept hitting Groq's free-tier rate limit. So I decided to split them into batches of 3, with a 30-second gap between each batch. This way, I could still test all 12 tickets using the actual AI without hitting the limit every time.

I didn't write all this code manually, but I understood what I wanted to build, explained the requirements, checked the output, and made changes based on what I found during testing.