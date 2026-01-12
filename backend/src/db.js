import { MongoClient } from "mongodb";
import { MONGODB_URI, MONGODB_DB } from "./config.js";

let client;
let db;

export async function connectDB() {
  if (db) return db;
  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(MONGODB_DB);
  return db;
}

export async function getCollections() {
  const database = await connectDB();
  return {
    queries: database.collection("queries"),
    feedback: database.collection("feedback")
  };
}
