import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { OpenAIEmbeddings } from "@langchain/openai";
import { FAISS_DIR } from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const embeddings = new OpenAIEmbeddings({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
    model: "text-embedding-3-small"
  });

  const filePath = path.resolve(__dirname, "yoga_knowledge.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const articles = JSON.parse(raw);

  const texts = [];
  const metadatas = [];

  // Simple chunking: whole article per chunk; you can refine later.
  for (const art of articles) {
    texts.push(art.text);
    metadatas.push({
      id: art.id,
      title: art.title,
      source: art.source
    });
  }

  const store = await FaissStore.fromTexts(texts, metadatas, embeddings);
  const dirPath = path.resolve(__dirname, "..", FAISS_DIR);
  await store.save(dirPath);
  console.log("Seeded FAISS index at", dirPath);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
