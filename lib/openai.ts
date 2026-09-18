import OpenAI from "openai";

// Reused across calls instead of constructing a new client per request —
// mirrors the connection-singleton pattern used for MongoDB in lib/mongodb.ts.
let client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable in .env.local");
  }

  if (!client) {
    client = new OpenAI({
      apiKey,
      timeout: 30_000,
    });
  }

  return client;
}
