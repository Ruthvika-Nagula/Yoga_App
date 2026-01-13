import express from "express";
import { runRagPipeline } from "./rag.js";
import { getCollections } from "./db.js";
import { checkSafety, buildUnsafeResponse } from "./safety.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query || !query.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const safety = checkSafety(query);
    const { QueryModel } = getCollections();

    let result;
    if (safety.isUnsafe) {
      result = {
        ...buildUnsafeResponse(query),
        sources: []
      };
    } else {
      result = await runRagPipeline(query);
    }

    await QueryModel.create({
      query,
      answer: result.answer,
      sources: result.sources,
      isUnsafe: safety.isUnsafe,
      safetyFlags: safety.flags
    });

    res.json({
      answer: result.answer,
      isUnsafe: safety.isUnsafe,
      safetyFlags: safety.flags,
      safetyMessage: result.safetyMessage || null,
      suggestion: result.suggestion || null,
      sources: result.sources
    });
  } catch (err) {
    console.error("Ask error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/feedback", async (req, res) => {
  try {
    const { query, rating, notes } = req.body;
    const { FeedbackModel } = getCollections();

    await FeedbackModel.create({
      query,
      rating,
      notes: notes || ""
    });

    res.json({ ok: true });
  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
