import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { loadFaissStore } from "./faissStore.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const filePath = path.resolve(__dirname, "yoga_knowledge.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const articles = JSON.parse(raw);

  // Convert knowledge into LangChain docs
  const docs = articles.map(a => ({
    pageContent: a.text,
    metadata: {
      id: a.id,
      title: a.title,
      source: a.source
    }
  }));

  // Chunking for better RAG
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 100
  });

  const chunks = await splitter.splitDocuments(docs);

  // Build FAISS using FREE embeddings
  await loadFaissStore(chunks);

  console.log("FAISS vector database created successfully");
}

main().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
