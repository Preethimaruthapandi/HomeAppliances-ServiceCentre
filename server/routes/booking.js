const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const ServiceExpert = require("../models/ServiceExpert");
const Booking = require("../models/Booking");
const { ensureAuthenticated } = require("../middleware/mauth");

// Ensure the upload directory exists
const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB per file
});

// API route for creating a new booking with file uploads
router.post(
  "/",
  ensureAuthenticated,
  upload.fields([
    { name: "applianceImages", maxCount: 5 },
    { name: "warrantyCard", maxCount: 1 },
    { name: "proofs", maxCount: 3 },
  ]),
  async (req, res) => {
    try {
      console.log("Request Body:", req.body);
      console.log("Uploaded Files:", req.files);

      // Extract user ID from JWT token
      const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const { categories, serviceDate, serviceExpertId, totalAmount } = req.body;

      // Parse categories safely
      let parsedCategories;
      try {
        parsedCategories = JSON.parse(categories);
      } catch (error) {
        return res.status(400).json({ error: "Invalid categories format" });
      }

      // **VALIDATE WARRANTY START DATE**
      parsedCategories.forEach((category) => {
        const warrantyStartDate = new Date(category.warrantyStartDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (warrantyStartDate > today) {
          return res.status(400).json({ error: "Warranty start date cannot be in the future." });
        }
      });

      // **VALIDATE SERVICE DATE**
      const selectedServiceDate = new Date(serviceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const minValidDate = new Date();
      minValidDate.setDate(today.getDate() + 3); // 3 days from today

      const maxValidDate = new Date();
      maxValidDate.setMonth(today.getMonth() + 1); // 1 month from today

      if (selectedServiceDate < minValidDate) {
        return res.status(400).json({ error: "Service date must be at least 3 days from today." });
      }

      if (selectedServiceDate > maxValidDate) {
        return res.status(400).json({ error: "Service date cannot be more than 1 month from today." });
      }

      // Store file paths in database
      const newBooking = new Booking({
        userId,
        categories: parsedCategories,
        serviceDate,
        serviceExpertId,
        totalAmount: Number(totalAmount),
        applianceImages: req.files.applianceImages
          ? req.files.applianceImages.map((file) => `/uploads/${file.filename}`)
          : [],
        warrantyCard: req.files.warrantyCard
          ? `/uploads/${req.files.warrantyCard[0].filename}`
          : null,
        proofs: req.files.proofs
          ? req.files.proofs.map((file) => `/uploads/${file.filename}`)
          : [],
      });

      const savedBooking = await newBooking.save();
      res.status(201).json(savedBooking);
    } catch (error) {
      console.error("Booking Error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

// Get categories for a specific service expert by ID
router.get("/categories/:id", ensureAuthenticated, async (req, res) => {
  try {
    const serviceExpert = await ServiceExpert.findById(req.params.id).select("categories");

    if (!serviceExpert) {
      return res.status(404).json({ message: "Service Expert not found" });
    }

    res.status(200).json(serviceExpert.categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Fetch all Pending & Confirmed Bookings for a user
router.get("/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure authenticated user is only fetching their own bookings
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const bookings = await Booking.find({
      userId: userId,
      bookingStatus: { $in: ["Pending", "Confirmed"] },
    })
      .populate({
        path: "serviceExpertId",
        populate: { path: "listingId", model: "Listing", select: "fullName" },
        
      })  .populate({
        path: "serviceExpertId",
        populate: {
          path: "listingId",
          populate: {
            path: "user",
            select: "profileImagePath", // Only fetch profileImagePath
          },
        },
      })// Fetch `profileImagePath` from `User`// Fetch `fullName` from `Listing`
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});




module.exports = router;
