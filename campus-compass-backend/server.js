// server.js - Complete Backend for Campus Compass
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// load .env from backend folder
dotenv.config({ path: "./.env" });
import Event from "./models/Event.js";

// ============ CONFIGURATION ============
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://campus_admin:Cj3oFdkY1jjZUsG7@cluster0.tayggd6.mongodb.net/campus-compass?retryWrites=true&w=majorityappName=Cluster0";
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-here";
const PORT = process.env.PORT || 5001;
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
      // expanded to accept frontend categories (water, restrooms, atms, avoid, bikes, events)
      enum: ["study", "food", "wellness", "tech", "social", "water", "restrooms", "atms", "avoid", "bikes", "events"],
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

// Simple request logger to aid debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.url);
  next();
});

// Debug route to list registered routes (GET /debug/routes)
app.get('/debug/routes', (req, res) => {
  try {
    const routes = [];
    const stack = app._router && app._router.stack ? app._router.stack : [];
    stack.forEach((middleware) => {
      try {
        if (middleware.route) {
          const methods = Object.keys(middleware.route.methods || {}).map(m => m.toUpperCase()).join(',');
          routes.push({ path: middleware.route.path, methods });
        } else if (middleware.name === 'router' && middleware.handle && Array.isArray(middleware.handle.stack)) {
          middleware.handle.stack.forEach((handler) => {
            if (handler && handler.route) {
              const methods = Object.keys(handler.route.methods || {}).map(m => m.toUpperCase()).join(',');
              routes.push({ path: handler.route.path, methods });
            }
          });
        }
      } catch (inner) {
        // ignore malformed middleware entries
      }
    });
    res.json({ routes });
  } catch (e) {
    console.error('Error listing routes', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

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
    res.json({ success: true, data: amenity });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============ EVENT ROUTES ============
app.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json({ success: true, count: events.length, data: events });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// authenticated event creation
app.post('/api/events', auth, async (req, res) => {
  try {
    const ev = await Event.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, data: ev });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// public event creation (convenience for demo)
app.post('/api/events/public', async (req, res) => {
  try {
    console.log('Public event create payload:', req.body);
    const payload = { ...req.body };

    // Normalize location: accept { lat, lng } or legacy { x, y }
    if (payload.location && typeof payload.location === 'object') {
      const loc = payload.location;
      if (loc.x != null && loc.y != null && (loc.lat == null || loc.lng == null)) {
        payload.location = { lat: Number(loc.x), lng: Number(loc.y) };
      } else if (loc.lat != null && loc.lng != null) {
        payload.location = { lat: Number(loc.lat), lng: Number(loc.lng) };
      }
    }

    // Ensure required coordinates exist for Event model
    if (!payload.location || payload.location.lat == null || payload.location.lng == null) {
      return res.status(400).json({ success: false, message: 'Event must include location with lat and lng' });
    }

    const ev = await Event.create(payload);
    res.status(201).json({ success: true, data: ev });
  } catch (e) {
    console.error('Public event create error:', e);
    // surface validation errors if present
    if (e.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: e.message, errors: e.errors });
    }
    res.status(400).json({ success: false, message: e.message });
  }
});

// authenticated event deletion
app.delete('/api/events/:id', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Not found' });
    // only allow owner or admin to delete
    if (ev.createdBy && req.user && ev.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await ev.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// public delete (convenience for demo) - deletes without auth
app.delete('/api/events/public/:id', async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ success: false, message: 'Not found' });
    await ev.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// Public amenity creation (convenience for demo) - accepts similar payloads as authenticated route
app.post('/api/amenities/public', async (req, res) => {
  try {
    console.log('Public amenity create payload:', req.body);
    const payload = { ...req.body };

    // Normalize location if client sent { lat, lng } or legacy { x, y }
    if (payload.location && typeof payload.location === 'object') {
      const loc = payload.location;
      if (loc.lat != null && loc.lng != null && (loc.x == null || loc.y == null)) {
        // map lat/lng -> x/y (backend stores x/y for amenities)
        payload.location = { x: Number(loc.lat), y: Number(loc.lng) };
      } else if (loc.x != null && loc.y != null) {
        // ensure numeric
        payload.location = { x: Number(loc.x), y: Number(loc.y) };
      }
    }

    // Ensure at least a name and location exist
    if (!payload.name) {
      return res.status(400).json({ success: false, message: 'Amenity must include a name' });
    }
    if (!payload.location || payload.location.x == null || payload.location.y == null) {
      return res.status(400).json({ success: false, message: 'Amenity must include location with x and y' });
    }

    // Validate/normalize category to one of allowed values; fallback to 'study'
    const allowed = ["study", "food", "wellness", "tech", "social", "water", "restrooms", "atms", "avoid", "bikes", "events"];
    if (!payload.category || !allowed.includes(payload.category)) {
      payload.category = 'study';
    }

    const amenity = await Amenity.create(payload);
    // don't increment user points because this is a public/demo create without auth
    res.status(201).json({ success: true, message: '+5 points (demo)', data: amenity });
  } catch (e) {
    console.error('Public amenity create error:', e);
    if (e.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: e.message, errors: e.errors });
    }
    res.status(400).json({ success: false, message: e.message });
  }
});

// Public amenity deletion (convenience for demo)
app.delete('/api/amenities/public/:id', async (req, res) => {
  try {
    const amenity = await Amenity.findById(req.params.id);
    if (!amenity) return res.status(404).json({ success: false, message: 'Not found' });
    await amenity.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (e) {
    console.error('Public amenity delete error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
