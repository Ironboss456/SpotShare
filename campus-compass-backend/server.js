// server.js - Complete Backend for Campus Compass
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ============ CONFIGURATION ============
const MONGODB_URI = process.env.MONGODB_URI || "your-mongodb-uri-here";
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-here";
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// ============ DATABASE CONNECTION ============
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((e) => console.error("❌ MongoDB Error:", e));

// ============ SCHEMAS ============
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    points: { type: Number, default: 0 },
    contributions: { type: Number, default: 0 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ["study", "food", "wellness", "tech", "social"],
      required: true,
    },
    location: { x: Number, y: Number },
    rating: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    features: [String],
    aiSummary: { type: String, default: "No summary yet." },
    reviews: { type: Number, default: 0 },
    contributions: { type: Number, default: 1 },
    hours: { type: String, default: "Hours not specified" },
    crowdLevel: {
      type: String,
      enum: ["low", "moderate", "high", "unknown"],
      default: "unknown",
    },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    upvotes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const reviewSchema = new mongoose.Schema(
  {
    amenity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenity",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    crowdLevel: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Amenity = mongoose.model("Amenity", amenitySchema);
const Review = mongoose.model("Review", reviewSchema);

// ============ MIDDLEWARE ============
const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const admin = (req, res, next) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only" });
  next();
};

// ============ USER ROUTES ============
app.post("/api/users/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res.status(400).json({ success: false, message: "User exists" });

    const user = await User.create({ username, email, password });
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res
      .status(201)
      .json({
        success: true,
        data: { _id: user._id, username, email, points: 0, token },
      });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email,
        points: user.points,
        role: user.role,
        token,
      },
    });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.get("/api/users/profile", auth, async (req, res) => {
  res.json({ success: true, data: req.user });
});

app.get("/api/users/stats", auth, async (req, res) => {
  res.json({
    success: true,
    data: { points: req.user.points, contributions: req.user.contributions },
  });
});

// ============ AMENITY ROUTES ============
app.get("/api/amenities", async (req, res) => {
  try {
    const { category, verified } = req.query;
    let query = {};
    if (category && category !== "all") query.category = category;
    if (verified) query.verified = verified === "true";

    const amenities = await Amenity.find(query)
      .populate("submittedBy", "username")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: amenities.length, data: amenities });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/amenities/:id", async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id).populate(
      "submittedBy",
      "username points"
    );
    if (!amenity)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: amenity });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/amenities", auth, async (req, res) => {
  try {
    const amenity = await Amenity.create({
      ...req.body,
      submittedBy: req.user._id,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 5, contributions: 1 },
    });
    res
      .status(201)
      .json({ success: true, message: "+5 points earned!", data: amenity });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.put("/api/amenities/:id", auth, async (req, res) => {
  try {
    let amenity = await Amenity.findById(req.params.id);
    if (!amenity)
      return res.status(404).json({ success: false, message: "Not found" });
    if (
      amenity.submittedBy.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ success: true, data: amenity });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.delete("/api/amenities/:id", auth, admin, async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity)
      return res.status(404).json({ success: false, message: "Not found" });
    await amenity.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/amenities/:id/upvote", auth, async (req, res) => {
  try {
    const amenity = await Amenity.findByIdAndUpdate(
      req.params.id,
      { $inc: { upvotes: 1 } },
      { new: true }
    );
    if (!amenity)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: amenity });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.put("/api/amenities/:id/verify", auth, admin, async (req, res) => {
  try {
    const amenity = await Amenity.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    if (!amenity)
      return res.status(404).json({ success: false, message: "Not found" });
    if (amenity.submittedBy)
      await User.findByIdAndUpdate(amenity.submittedBy, {
        $inc: { points: 10 },
      });
    res.json({
      success: true,
      message: "Verified! +10 points to submitter",
      data: amenity,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.get("/api/amenities/search", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q)
      return res
        .status(400)
        .json({ success: false, message: "Query required" });
    const amenities = await Amenity.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { features: { $in: [new RegExp(q, "i")] } },
      ],
    }).limit(20);
    res.json({ success: true, count: amenities.length, data: amenities });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============ REVIEW ROUTES ============
app.get("/api/reviews/amenity/:amenityId", async (req, res) => {
  try {
    const reviews = await Review.find({ amenity: req.params.amenityId })
      .populate("user", "username points")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, data: reviews });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

app.post("/api/reviews", auth, async (req, res) => {
  try {
    const { amenity, rating, comment, crowdLevel } = req.body;
    const amenityExists = await Amenity.findById(amenity);
    if (!amenityExists)
      return res
        .status(404)
        .json({ success: false, message: "Amenity not found" });

    const review = await Review.create({
      amenity,
      user: req.user._id,
      rating,
      comment,
      crowdLevel,
    });

    const reviews = await Review.find({ amenity });
    const avgRating =
      reviews.reduce((acc, r) => r.rating + acc, 0) / reviews.length;
    await Amenity.findByIdAndUpdate(amenity, {
      rating: avgRating,
      reviews: reviews.length,
    });
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: 2, contributions: 1 },
    });

    res
      .status(201)
      .json({ success: true, message: "+2 points earned!", data: review });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.delete("/api/reviews/:id", auth, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ success: false, message: "Not found" });
    if (
      review.user.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }
    await review.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============ ROOT & ERROR HANDLING ============
app.get("/", (req, res) => {
  res.json({
    message: "🧭 Campus Compass API",
    version: "1.0.0",
    endpoints: {
      amenities: "/api/amenities",
      users: "/api/users",
      reviews: "/api/reviews",
    },
  });
});

app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" })
);

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
