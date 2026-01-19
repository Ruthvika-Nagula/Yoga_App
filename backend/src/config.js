import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const MONGO_URI = process.env.MONGO_URI;
export const MONGODB_DB = process.env.MONGODB_DB;
export const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
export const PERPLEXITY_MODEL =
  process.env.PERPLEXITY_MODEL || "sonar-medium-online";
export const FAISS_DIR = process.env.FAISS_DIR || "./faiss_index";
