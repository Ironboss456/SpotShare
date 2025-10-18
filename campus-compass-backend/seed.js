import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" }); // make sure it loads from backend folder

// ✅ Import models
import User from "./models/User.js";
import Event from "./models/Event.js";
import Review from "./models/Review.js";

// ✅ Get URI from .env
const MONGO_URI = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Review.deleteMany({});

    console.log("🧹 Existing data cleared");

    // Create sample users
    const users = await User.insertMany([
      { username: "alice", email: "alice@example.com", password: "password" },
      { username: "bob", email: "bob@example.com", password: "password" },
    ]);

    console.log(
      "✅ Seeded users:",
      users.map((u) => u.username)
    );

    // Create sample events
    const events = await Event.insertMany([
      {
        title: "Campus Picnic",
        description: "A fun outdoor picnic for all students!",
        location: "Central Park",
        date: new Date("2025-11-01"),
        createdBy: users[0]._id,
      },
      {
        title: "Tech Talk",
        description: "Discussing AI trends in 2025",
        location: "Auditorium A",
        date: new Date("2025-11-05"),
        createdBy: users[1]._id,
      },
    ]);

    console.log(
      "✅ Seeded events:",
      events.map((e) => e.title)
    );

    // Create sample reviews
    const reviews = await Review.insertMany([
      {
        user: users[0]._id,
        event: events[0]._id,
        rating: 5,
        comment: "Loved the picnic!",
      },
      {
        user: users[1]._id,
        event: events[1]._id,
        rating: 4,
        comment: "Great talk, learned a lot!",
      },
    ]);

    console.log("✅ Seeded reviews:", reviews.length);

    console.log("🎉 All seed data inserted successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await seedData();
};

run();
