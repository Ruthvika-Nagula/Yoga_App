import fetch from "node-fetch";
import { loadFaissStore } from "./faissStore.js";
import {
  PERPLEXITY_API_KEY,
  PERPLEXITY_MODEL
} from "./config.js";

// Simple helper to call Perplexity API [web:9][web:12].
async function callPerplexity(systemPrompt, userPrompt) {
  const resp = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: PERPLEXITY_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.2,
      max_tokens: 512,
      top_p: 0.95
    })
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Perplexity API error: ${resp.status} ${text}`);
  }
  const data = await resp.json();
  return data.choices[0].message.content;
}

export async function runRagPipeline(query) {
  const store = await loadFaissStore();
  const k = 4;
  const docs = await store.similaritySearch(query, k); // FAISS similarity search [web:10].

  const contextText = docs
    .map(
      (d, idx) =>
        `Source ${idx + 1} (id=${d.metadata?.id || idx + 1}, title=${d.metadata?.title || "NA"}):\n${d.pageContent}`
    )
    .join("\n\n");

  const systemPrompt =
    "You are a cautious yoga assistant. Answer only about yoga, asanas, pranayama, and general wellbeing. " +
    "Use the provided context, stay within it, and DO NOT give medical diagnosis. " +
    "If something is unclear or risky, advise consulting a doctor or certified yoga therapist.";

  const userPrompt =
    `User question:\n${query}\n\n` +
    `Context from yoga articles:\n${contextText}\n\n` +
    "Instructions:\n" +
    "- Answer in 3–6 short paragraphs or bullet points.\n" +
    "- Refer to the sources conceptually (e.g., 'one of the beginner pose guides explains…').\n" +
    "- If user asks for pose prescription with serious conditions, stay general and emphasize safety.\n";

  const answer = await callPerplexity(systemPrompt, userPrompt);

  const sources = docs.map((d, idx) => ({
    id: d.metadata?.id || `${idx + 1}`,
    title: d.metadata?.title || `Source ${idx + 1}`,
    chunkId: d.metadata?.chunkId || `${idx}`,
    snippet: d.pageContent.slice(0, 200)
  }));

  return { answer, sources, rawDocs: docs };
}
