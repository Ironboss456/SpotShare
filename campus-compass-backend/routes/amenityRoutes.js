import express from "express";
import Amenity from "../models/Amenity.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const data = await Amenity.find();
  res.json(data);
});

router.post("/", async (req, res) => {
  const newAmenity = new Amenity(req.body);
  await newAmenity.save();
  res.status(201).json(newAmenity);
});

router.put("/:id", async (req, res) => {
  const updated = await Amenity.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(updated);
});

router.delete("/:id", async (req, res) => {
  await Amenity.findByIdAndDelete(req.params.id);
  res.json({ message: "Amenity deleted" });
});

export default router;
