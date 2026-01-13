import mongoose from "mongoose";

let QueryModel;
let FeedbackModel;

export async function connectDB() {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) throw new Error("MONGO_URI not defined");

    await mongoose.connect(uri);
    console.log("MongoDB connected");

    const querySchema = new mongoose.Schema({
      query: String,
      answer: String,
      sources: Array,
      isUnsafe: Boolean,
      safetyFlags: [String],
      createdAt: { type: Date, default: Date.now }
    });

    const feedbackSchema = new mongoose.Schema({
      query: String,
      rating: String,
      notes: String,
      createdAt: { type: Date, default: Date.now }
    });

    QueryModel = mongoose.models.Query || mongoose.model("Query", querySchema);
    FeedbackModel = mongoose.models.Feedback || mongoose.model("Feedback", feedbackSchema);
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  }
}

export function getCollections() {
  if (!QueryModel || !FeedbackModel) {
    throw new Error("MongoDB not initialized");
  }
  return { QueryModel, FeedbackModel };
}
