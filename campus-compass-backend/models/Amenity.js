import mongoose from "mongoose";

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["study", "food", "recreation", "other"],
      default: "other",
    },
    features: [String],
    aiSummary: String,
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    reviews: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    hours: String,
    crowdLevel: String,
  },
  { timestamps: true }
);

export default mongoose.model("Amenity", amenitySchema);
