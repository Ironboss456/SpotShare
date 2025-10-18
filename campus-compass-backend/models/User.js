import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    points: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Amenity" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
