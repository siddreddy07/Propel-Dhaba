import "dotenv/config";
import { createGroq } from "@ai-sdk/groq";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing");
}

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

export const aiModel = groq("openai/gpt-oss-20b");