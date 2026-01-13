import fetch from "node-fetch";
import { loadFaissStore } from "./faissStore.js";
import { checkSafety, buildUnsafeResponse } from "./safety.js";

async function callOllama(prompt) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error("Ollama error: " + text);
  }

  const data = await res.json();
  return data.response;
}

export async function runRagPipeline(query) {
  // ---- SAFETY CHECK ----
  const safety = checkSafety(query);

  // ---- FAISS RETRIEVAL ----
  const store = await loadFaissStore();
  const docs = await store.similaritySearch(query, 4);

  const context = docs.map(d => d.pageContent).join("\n\n");

  // ---- UNSAFE FLOW ----
  if (safety.isUnsafe) {
    const safe = buildUnsafeResponse(query);

    const sources = docs.map((d, i) => ({
      id: i + 1,
      title: d.metadata?.title || "Yoga Knowledge",
      snippet: d.pageContent.slice(0, 200)
    }));

    return {
      answer: safe.answer,
      safetyMessage: safe.safetyMessage,
      suggestion: safe.suggestion,
      sources,
      isUnsafe: true
    };
  }

  // ---- NORMAL RAG FLOW ----
  const prompt = `
You are a yoga assistant.
Use ONLY the context below to answer.
Do not give medical diagnosis.

Context:
${context}

User question:
${query}

Give a clear, helpful yoga-based answer.
`;

  const answer = await callOllama(prompt);

  const sources = docs.map((d, i) => ({
    id: i + 1,
    title: d.metadata?.title || "Yoga Knowledge",
    snippet: d.pageContent.slice(0, 200)
  }));

  return { answer, sources, isUnsafe: false };
}
