import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";
import router from "./routes.js";

async function main() {
  await connectDB();

  const app = express();

  app.use(cors({
    origin: [
      "https://yogaapp.streamlit.app",
      "http://localhost:8501"
    ],
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }));

  app.options("*", cors());
  app.use(bodyParser.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", router);

  app.listen(PORT, () => {
    console.log(`Yoga RAG backend listening on port ${PORT}`);
  });
}

main().catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});