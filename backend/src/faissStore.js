import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/hf_transformers";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FAISS_DIR } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storePath = path.resolve(__dirname, "..", FAISS_DIR);
const indexFile = path.join(storePath, "faiss.index");

const embeddings = new HuggingFaceTransformersEmbeddings({
  modelName: "Xenova/all-MiniLM-L6-v2"
});

let store = null;

export async function loadFaissStore(docs = null) {
  if (store) return store;

  // Only load if actual index exists
  if (fs.existsSync(indexFile)) {
    store = await FaissStore.load(storePath, embeddings);
    return store;
  }

  // If index doesn't exist, build it
  if (!docs) {
    throw new Error("FAISS index not found. Run seed_knowledge.js first.");
  }

  if (!fs.existsSync(storePath)) {
    fs.mkdirSync(storePath, { recursive: true });
  }

  store = await FaissStore.fromDocuments(docs, embeddings);
  await store.save(storePath);
  return store;
}
