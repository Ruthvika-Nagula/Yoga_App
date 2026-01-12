import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FAISS_DIR } from "./config.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use OpenAI-compatible embeddings; replace with any embeddings provider you like.
const embeddings = new OpenAIEmbeddings({
  apiKey: process.env.OPENAI_API_KEY || "dummy",
  model: "text-embedding-3-small"
}); // Example setup [web:10].

let store;

export async function loadFaissStore() {
  if (store) return store;
  const dirPath = path.resolve(__dirname, "..", FAISS_DIR);
  if (fs.existsSync(dirPath)) {
    store = await FaissStore.load(dirPath, embeddings); // load persisted index [web:10].
  } else {
    store = await FaissStore.fromTexts([], [], embeddings);
    await store.save(dirPath);
  }
  return store;
}

export async function saveFaissStore() {
  if (!store) return;
  const dirPath = path.resolve(__dirname, "..", FAISS_DIR);
  await store.save(dirPath);
}
