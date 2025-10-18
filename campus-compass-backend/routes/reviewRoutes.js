// routes/reviewRoutes.js
import express from "express";
import Review from "../models/Review.js";

const router = express.Router();

router.get("/", async (req, res) =>
  res.json(await Review.find().populate("user amenity"))
);

router.post("/", async (req, res) => {
  const newReview = new Review(req.body);
  await newReview.save();
  res.status(201).json(newReview);
});

router.put("/:id", async (req, res) => {
  const updated = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Review.findByIdAndDelete(req.params.id);
  res.json({ message: "Review deleted" });
});

export default router;
