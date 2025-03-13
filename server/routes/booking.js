const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const ServiceExpert = require("../models/ServiceExpert");
const Booking = require("../models/Booking");
const nodemailer = require("nodemailer");
const sharp = require("sharp");
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

const imageBaseUrl = "http://localhost:3001";

async function getBase64Image(imagePath) {
  try {
    const compressedBuffer = await sharp(imagePath)
      .resize({ width: 200 }) // Resize to 200px width
      .jpeg({ quality: 60 }) // Reduce quality
      .toBuffer();

    return `data:image/jpeg;base64,${compressedBuffer.toString("base64")}`;
  } catch (error) {
    console.error("Error converting image to Base64:", error);
    return null;
  }
}



// Nodemailer setup
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

      const token = req.headers.authorization?.split(" ")[1];
      if (!token) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const { categories, serviceDate, serviceExpertId, totalAmount,  mobileNo, address } = req.body;

      let parsedCategories;
      try {
        parsedCategories = JSON.parse(categories);
      } catch (error) {
        return res.status(400).json({ error: "Invalid categories format" });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      parsedCategories.forEach((category) => {
        const warrantyStartDate = new Date(category.warrantyStartDate);
        if (warrantyStartDate > today) {
          return res.status(400).json({ error: "Warranty start date cannot be in the future." });
        }
      });

      const selectedServiceDate = new Date(serviceDate);
      const minValidDate = new Date();
      minValidDate.setDate(today.getDate() + 3);
      const maxValidDate = new Date();
      maxValidDate.setMonth(today.getMonth() + 1);

      if (selectedServiceDate < minValidDate) {
        return res.status(400).json({ error: "Service date must be at least 3 days from today." });
      }

      if (selectedServiceDate > maxValidDate) {
        return res.status(400).json({ error: "Service date cannot be more than 1 month from today." });
      }

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
        mobileNo,
        address
      });

      const savedBooking = await newBooking.save();
      await savedBooking.populate("userId", "firstName lastName email");

      const serviceExpert = await ServiceExpert.findById(serviceExpertId)
        .populate({ path: "listingId", select: "email" })
        .lean();
     // email content 

     if (serviceExpert?.listingId?.email) {
      const imageBasePath = path.join(__dirname, "..", "public", "uploads");
      let attachments = [];
      let applianceImagesHtml = "";



await Promise.all(
  savedBooking.applianceImages.map(async (img, index) => {
    const fileName = img.replace(/^\/uploads\//, "");
    const fullImagePath = path.join(imageBasePath, fileName);

    if (fs.existsSync(fullImagePath)) {
      const cid = `image${index}@example.com`;
      attachments.push({
        filename: fileName,
        path: fullImagePath, // Attach actual file path
        cid: cid, // Content-ID to reference in email
      });
      applianceImagesHtml += `<img src="cid:${cid}" width="200" style="margin:5px;" />`;
    } else {
      applianceImagesHtml += `<p>Image not found: ${fileName}</p>`;
    }
  })
);

await transporter.sendMail({ 
  from: process.env.EMAIL_USER,
  to: serviceExpert.listingId.email,
  subject: "New Booking Assigned",
  html: `
    <h3>New Booking Assigned</h3>
    <p><strong>Booking ID:</strong> ${savedBooking._id}</p>
    <p><strong>Service Date:</strong> ${new Date(serviceDate).toLocaleDateString()}</p>
    <p><strong>Total Amount:</strong> ₹${totalAmount}</p>
    <p><strong>Categories:</strong></p>
    <ul>
      ${parsedCategories
        .map(
          (cat) =>
            `<li>${cat.label} - Count: ${cat.count}, Warranty: ${cat.warrantyYears ? cat.warrantyYears + " years" : "N/A"}</li>`
        )
        .join("")}
    </ul>
    <p><strong>Appliance Images:</strong></p>
    ${applianceImagesHtml || "<p>No appliance images</p>"}
    <p>UserName: ${savedBooking.userId?.firstName || "Unknown"} ${savedBooking.userId?.lastName || ""}</p>
<p>Usermail: ${savedBooking.userId?.email || "Unknown"}</p>
<p>Mobile: ${savedBooking?.mobileNo || "Unknown"}</p>
<p>Address: ${savedBooking?.address || "Unknown"}</p>

    <p><strong>Proofs:</strong></p>
${
  savedBooking.proofs.length > 0
    ? savedBooking.proofs
        .map((proof) => {
          if (proof.endsWith(".pdf")) {
            return `<p><a href="${imageBaseUrl}${proof}" target="_blank">View Proof (PDF)</a></p>`;
          } else {
            return `<img src="${imageBaseUrl}${proof}" width="100" style="margin:5px;" />`;
          }
        })
        .join("") // Join array elements as a string
    : "<p>No proofs attached</p>"
}
${
  savedBooking.warrantyCard
    ? savedBooking.warrantyCard.endsWith(".pdf")
      ? `<p><a href="${imageBaseUrl}${savedBooking.warrantyCard}" target="_blank">View Warranty Card (PDF)</a></p>`
      : `<p><strong>Warranty Card:</strong><br><img src="${imageBaseUrl}${savedBooking.warrantyCard}" width="100" /></p>`
    : "<p>No warranty card attached</p>"
}


    <br></br>

    <a href="http://localhost:3001/api/bookings/confirm/${savedBooking._id}" 
       style="padding: 10px; background: green; color: white; text-decoration: none; border-radius: 5px;">
       Confirm
    </a>
    <a href="http://localhost:3001/api/bookings/complete/${savedBooking._id}" 
       style="padding: 10px; background: blue; color: white; text-decoration: none; border-radius: 5px; margin-left: 10px;">
       Complete
    </a>
  `,
  attachments,
})


      console.log(
        "Appliance Image URLs:",
        savedBooking.applianceImages.map((img) => `${imageBaseUrl}/${img.replace(/^\//, "")}`)
      );

      res.status(201).json(savedBooking);
    } }catch (error) {
      console.error("Booking Error:", error);
      res.status(400).json({ error: error.message });
    }
  }
);
router.get("/confirm/:bookingId", async (req, res) => {
  try {
    console.log("Confirm Booking Request:", req.params.bookingId);

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId, 
      { bookingStatus: "Confirmed" }, 
      { new: true }
    );

    if (!updatedBooking) {
      console.error("Booking not found:", req.params.bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking Confirmed:", updatedBooking);
    res.send("Booking Confirmed!");
  } catch (error) {
    console.error("Error confirming booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/complete/:bookingId", async (req, res) => {
  try {
    console.log("Complete Booking Request:", req.params.bookingId);

    const updatedBooking = await Booking.findByIdAndUpdate(
      req.params.bookingId, 
      { bookingStatus: "Completed" }, 
      { new: true }
    );

    if (!updatedBooking) {
      console.error("Booking not found:", req.params.bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log("Booking Completed:", updatedBooking);
    res.send("Booking Completed!");
  } catch (error) {
    console.error("Error completing booking:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


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
