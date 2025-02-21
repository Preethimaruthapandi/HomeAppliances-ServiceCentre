const express = require("express");
const ServiceExpert = require("../models/ServiceExpert"); 
const router = express.Router();

/** 
 * @route   POST /api/ratings/:id/review
 * @desc    Submit a rating and review for a service expert
 */
router.post("/:id/review", async (req, res) => {
  try {
    const { userId, rating, review } = req.body;
    const { id } = req.params;

    if (!userId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Invalid rating or user ID" });
    }

    const serviceExpert = await ServiceExpert.findById(id);
    if (!serviceExpert) {
      return res.status(404).json({ message: "Service expert not found" });
    }

    // ✅ Allow multiple reviews from the same user
    serviceExpert.ratings.push({ userId, rating, createdAt: new Date() });
    serviceExpert.reviews.push({ userId, review, createdAt: new Date() });

    await serviceExpert.save();
    res.status(201).json({ message: "Review submitted successfully!", review: { userId, review, rating } });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

/** 
 * @route   GET /api/ratings/:id
 * @desc    Get all reviews and calculate the average rating
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const serviceExpert = await ServiceExpert.findById(id)
      .populate("reviews.userId", "firstName lastName profileImagePath")
      .populate("ratings.userId", "firstName lastName");

    if (!serviceExpert) {
      return res.status(404).json({ message: "Service expert not found" });
    }

    // Calculate Average Rating
    const totalRatings = serviceExpert.ratings.length;
    const averageRating = totalRatings
      ? serviceExpert.ratings.reduce((sum, r) => sum + r.rating, 0) / totalRatings
      : 0;

    res.status(200).json({
      averageRating: averageRating.toFixed(1),
      totalRatings,
      reviews: serviceExpert.reviews,
      ratings: serviceExpert.ratings
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
