import express from "express";
import { runRagPipeline } from "./rag.js";
import { getCollections } from "./db.js";
import { checkSafety, buildUnsafeResponse } from "./safety.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {
    const { query, question } = req.body;
    const userQuery = query || question;

    if (!userQuery || !userQuery.trim()) {
      return res.status(400).json({ error: "Query is required" });
    }

    const safety = checkSafety(userQuery);
    const { QueryModel } = getCollections();

    let result;

    if (safety.isUnsafe) {
      result = {
        ...buildUnsafeResponse(userQuery),
        sources: []
      };
    } else {
      result = await runRagPipeline(userQuery);
    }

    await QueryModel.create({
      query: userQuery,
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
    console.error("ASK ROUTE ERROR:", err.message);
    res.status(500).json({
      error: "Failed to process query",
      details: err.message
    });
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
    console.error("FEEDBACK ERROR:", err.message);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

export default router;