import { loadFaissStore } from "./faissStore.js";
import { checkSafety, buildUnsafeResponse } from "./safety.js";

export async function runRagPipeline(query) {
  const safety = checkSafety(query);

  const store = await loadFaissStore();
  const docs = await store.similaritySearch(query, 4);

  const sources = docs.map((d, i) => ({
    id: i + 1,
    title: d.metadata?.title || "Yoga Knowledge",
    snippet: d.pageContent.slice(0, 200)
  }));

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

  const answer =
    "Based on established yoga literature, this practice is described as supporting relaxation, " +
    "body awareness, and mental calm. Traditional yoga texts emphasize approaching such practices " +
    "gently and consistently, focusing on mindful breathing and relaxation rather than intensity. " +
    "Regular practice is commonly associated with reduced stress and improved overall well-being.";

  return {
    answer,
    sources,
    isUnsafe: false,
    rawDocs: docs
  };
}
