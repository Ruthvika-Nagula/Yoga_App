import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { PORT } from "./config.js";
import { connectDB } from "./db.js";
import router from "./routes.js";

async function main() {
  await connectDB();

  const app = express();
  app.use(cors());
  app.use(bodyParser.json());

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/api", router);

  app.listen(PORT, () => {
    console.log(`Yoga RAG backend listening on http://localhost:${PORT}`);
  });
}

main().catch(err => {
  console.error("Failed to start server", err);
  process.exit(1);
});
