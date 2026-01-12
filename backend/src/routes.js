import express from "express";
import { getCollections } from "./db.js";
import { runRagPipeline } from "./rag.js";
import { checkSafety, buildUnsafeResponse } from "./safety.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const { queries, feedback } = await getCollections();
    const safety = checkSafety(query);
    const createdAt = new Date();

    let ragResult = null;
    if (safety.isUnsafe) {
      ragResult = { ...buildUnsafeResponse(query), sources: [], rawDocs: [] };
    } else {
      ragResult = await runRagPipeline(query);
    }

    const dbRecord = {
      query,
      answer: ragResult.answer,
      isUnsafe: safety.isUnsafe,
      safetyFlags: safety.flags,
      sources: ragResult.sources,
      createdAt
    };

    await queries.insertOne({
      ...dbRecord,
      retrievedChunks: ragResult.rawDocs.map(d => ({
        content: d.pageContent,
        metadata: d.metadata
      }))
    });

    res.json({
      answer: ragResult.answer,
      isUnsafe: safety.isUnsafe,
      safetyFlags: safety.flags,
      safetyMessage: ragResult.safetyMessage || null,
      suggestion: ragResult.suggestion || null,
      sources: ragResult.sources
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { query, rating, notes } = req.body;
    const { feedback } = await getCollections();
    await feedback.insertOne({
      query,
      rating,
      notes: notes || "",
      createdAt: new Date()
    });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
