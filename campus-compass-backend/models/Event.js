import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    // store geographic coordinates so events can be placed on the map
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    category: {
      type: String,
      // expanded to include custom user categories used by the frontend
      enum: [
        "academic",
        "social",
        "club",
        "sports",
        "other",
        "events",
        "water",
        "restrooms",
        "atms",
        "avoid",
        "bikes",
      ],
      default: "other",
    },
    // traits/features for the event (e.g., 'Outdoor', 'Family-friendly')
    features: { type: [String], default: [] },
    aiSummary: { type: String, default: '' },
    date: Date,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
