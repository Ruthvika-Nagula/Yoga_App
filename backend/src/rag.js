import { loadFaissStore } from "./faissStore.js";
import { checkSafety, buildUnsafeResponse } from "./safety.js";
import Groq from "groq-sdk";

if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing");
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function runRagPipeline(query) {
  const safety = checkSafety(query);

  let docs = [];
  let sources = [];

  try {
    const store = await loadFaissStore();
    docs = await store.similaritySearch(query, 4);

    sources = docs.map((d, i) => ({
      id: i + 1,
      title: d.metadata?.title || "Yoga Knowledge",
      snippet: d.pageContent.slice(0, 200)
    }));
  } catch (err) {
    console.warn("FAISS unavailable, continuing without retrieval");
  }

  if (safety.isUnsafe) {
    const safe = buildUnsafeResponse(query);
    return {
      answer: safe.answer,
      safetyMessage: safe.safetyMessage,
      suggestion: safe.suggestion,
      sources,
      isUnsafe: true,
      rawDocs: docs
    };
  }

  const context = docs.length
    ? docs.map(d => d.pageContent).join("\n\n")
    : "General yoga and wellness knowledge.";

  const prompt = `
You are a certified yoga and wellness assistant.

Answer the user's question using ONLY the context provided below.
If the context does not fully answer the question, give a cautious, general yoga-based response.
Avoid medical diagnosis. Encourage professional consultation when appropriate.

Context:
${context}

Question:
${query}
`;

  const completion = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    temperature: 0.4,
    messages: [
      { role: "system", content: "You are a helpful yoga assistant." },
      { role: "user", content: prompt }
    ]
  });

  const answer = completion.choices[0].message.content;

  return {
    answer,
    sources,
    isUnsafe: false,
    rawDocs: docs
  };
}