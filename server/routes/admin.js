const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const Listing = require("../models/Listing");
const ServiceExpert = require("../models/ServiceExpert");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");
const { verifyAdmin } = require("../middleware/verifyadmin");

// Configure Multer for file uploads
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created:", uploadsDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });


const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587, // Use 587 for TLS
      secure: false, // Set to false for TLS
      auth: {
        user: process.env.EMAIL_USER, // Load from .env
        pass: process.env.EMAIL_PASS,  // Replace with your email password (use app password if 2FA is enabled)
      },
      tls: {
        rejectUnauthorized: false, // Bypass SSL certificate issues
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Route: Get all listings
router.get("/listings", verifyAdmin, async (req, res) => {
  try {
    const listings = await Listing.find().populate("user");
    res.status(200).json(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ message: "Unable to fetch listings" });
  }
});

// Route: Get a specific listing by ID
router.get("/listings/:id", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id).populate("user");
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }
    res.status(200).json(listing);
  } catch (err) {
    console.error("Error fetching listing by ID:", err);
    res.status(500).json({ message: "Unable to fetch listing" });
  }
});

// Route: Filter Listings by Status
router.get("/listings/filter/:status", verifyAdmin, async (req, res) => {
  try {
    const { status } = req.params;
    const validStatuses = ["pending", "approved", "denied"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status filter" });
    }

    const listings = await Listing.find({ status }).populate("user");
    res.status(200).json(listings);
  } catch (err) {
    console.error("Error filtering listings:", err);
    res.status(500).json({ message: "Unable to filter listings" });
  }
});

// Route: Approve or Deny Listing and Send Email
router.post("/listings/:id/status", verifyAdmin, upload.array("photos", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, place, categories } = req.body;

    if (!["approved", "denied", "pending"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    let parsedCategories = [];
    if (["approved", "pending"].includes(status)) {
      try {
        parsedCategories = JSON.parse(categories);
        if (!Array.isArray(parsedCategories)) {
          return res.status(400).json({ message: "Categories must be an array" });
        }
      } catch (err) {
        console.error("Error parsing categories:", err);
        return res.status(400).json({ message: "Invalid categories format" });
      }
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // Update listing status
    listing.status = status;
    listing.place = status === "approved" ? place : null;
    listing.categories = status === "approved" || status === "pending" ? parsedCategories : [];
    const photoPaths = req.files.map((file) => `${file.filename}`);

    listing.photos = photoPaths;

    await listing.save();

    if (status === "approved") {
      // Check if ServiceExpert already exists
      let serviceExpert = await ServiceExpert.findOne({ listingId: id });

      if (!serviceExpert) {
        // Create new ServiceExpert if not exists
        serviceExpert = new ServiceExpert({
          listingId: id,
          categories: parsedCategories,
          photos: photoPaths,
          place: place,
          status: "approved",
        });
      } else {
        // Update existing ServiceExpert
        serviceExpert.status = "approved";
        serviceExpert.categories = parsedCategories;
        serviceExpert.photos = photoPaths;
        serviceExpert.place = place;
      }

      await serviceExpert.save();

      await sendEmail(
        listing.email,
        "Your Profile Has Been Approved",
        `Dear ${listing.fullName},\n\nYour profile as a service expert has been published successfully.\n\nBest Regards,\nAdmin Team`
      );
    } else if (status === "denied") {
      // Update ServiceExpert status to denied if it exists
      await ServiceExpert.updateOne({ listingId: id }, { $set: { status: "denied" } });

      listing.available = false;
      await listing.save();

      await sendEmail(
        listing.email,
        "Your Profile Has Been Denied",
        `Dear ${listing.fullName},\n\nUnfortunately, your profile has been denied. Please contact support for more information.\n\nBest Regards,\nAdmin Team`
      );
    }

    res.status(200).json({
      message: `Listing has been ${status} successfully and email notification sent.`,
      listing,
    });
  } catch (err) {
    console.error("Error updating listing status:", err);
    res.status(500).json({ message: "Failed to update listing status", error: err.message });
  }
});


router.get("/approved", async (req, res) => {
  try {
    const approvedListings = await ServiceExpert.find({ status: "approved" })
      .populate({
        path: "listingId",
        select: "fullName available", // Ensure only necessary fields are fetched
      })
      .lean(); // Convert Mongoose documents to plain JavaScript objects

    // Filter out records where `listingId` is null or missing
    const validListings = approvedListings.filter(
      (listing) => listing.listingId && listing.listingId._id
    );

    res.status(200).json(validListings);
  } catch (err) {
    console.error("Error fetching approved service experts:", err);
    res.status(500).json({ message: "Failed to fetch approved service experts" });
  }
});

// Update availability of an expert
router.post("/listings/:id/availability", verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    let { available } = req.body;

    // Fetch the listing to check its status
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: "Listing not found" });
    }

    // If status is 'denied', force availability to false
    if (listing.status === "denied") {
      available = false;
    }


    // Update the listing's availability
    listing.available = available;
    await listing.save();

    res.json({ message: "Availability updated successfully", listing });
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


// Route: Get all bookings (for ManageBooking page)
router.get("/bookings/all", verifyAdmin, async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: "serviceExpertId",
        populate: { path: "listingId", populate: { path: "user", select: "fullName profileImagePath" } },
      })
      .populate({ path: "userId", select: "firstName lastName email" })
      .lean();

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Error fetching bookings:", err);
    res.status(500).json({ message: "Unable to fetch bookings" });
  }
});

// Route: Cancel a booking
router.put("/bookings/cancel/:bookingId", verifyAdmin, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.bookingStatus === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.bookingStatus = "Cancelled";
    await booking.save();

    res.status(200).json({ message: "Booking cancelled successfully", booking });
  } catch (err) {
    console.error("Error cancelling booking:", err);
    res.status(500).json({ message: "Unable to cancel booking" });
  }
});



module.exports = router;
