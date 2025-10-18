import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    location: String,
    category: {
      type: String,
      enum: ["academic", "social", "club", "sports", "other"],
      default: "other",
    },
    date: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
