const express = require('express');
const multer = require('multer');
const path = require('path');
const validator = require('validator');
const Listing = require('../models/Listing');
const ServiceExpert = require('../models/ServiceExpert');
const { ensureAuthenticated } = require('../middleware/mauth');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Max 10 MB file size
  },
});

// Route to create a new listing
router.post(
  '/',
  ensureAuthenticated, // Ensure the user is authenticated before proceeding
  upload.fields([
    { name: 'degreeCertificate', maxCount: 1 },
    { name: 'experienceCertificate', maxCount: 1 },
    { name: 'technicalCertifications', maxCount: 5 },
    { name: 'serviceReports', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log('Decoded User:', req.user); 
      const { fullName, address, phoneNumber, email, dateOfBirth, educationalQualifications, workExperience, keySkills, userQuery } = req.body;

      // Validate required fields
      if (!fullName || !address || !phoneNumber || !email || !dateOfBirth || !educationalQualifications) {
        return res.status(400).json({ message: "Required fields are missing" });
      }

       // Validate Mobile Number
       const phoneRegex = /^[0-9]{10}$/;
       if (!phoneRegex.test(phoneNumber)) {
         return res.status(400).json({ message: 'Invalid phone number. It must be 10 digits.' });
       }
 
       // Validate Date of Birth (Age > 20)
       const birthDate = new Date(dateOfBirth);
       const age = new Date().getFullYear() - birthDate.getFullYear();
       const ageMonthCheck = new Date().getMonth() - birthDate.getMonth();
       if (age < 20 || (age === 20 && ageMonthCheck < 0)) {
         return res.status(400).json({ message: 'Invalid date of birth. Age must be above 20.' });
       }

       // Email validation
       if (!validator.isEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
      }

      // File paths for the uploaded files
      console.log("Uploaded Files:", req.files);
      const degreeCertificate = req.files.degreeCertificate?.[0]?.path || null;
      const experienceCertificate = req.files.experienceCertificate?.[0]?.path || null;
      const technicalCertifications = req.files.technicalCertifications?.map((file) => file.path) || [];
      const serviceReports = req.files.serviceReports?.[0]?.path || null;
      if (!serviceReports) {
        return res.status(400).json({ message: "Service Report is required." });
      }

      // Handle missing files
      if (!degreeCertificate || !experienceCertificate) {
        return res.status(400).json({ message: "Degree Certificate and Experience Certificate are required." });
      }


      // Create a new listing object
      const listing = new Listing({
        fullName,
        address,
        phoneNumber,
        email,
        dateOfBirth,
        educationalQualifications,
        degreeCertificate,
        experienceCertificate,
        technicalCertifications,
        serviceReports,
        workExperience,
        keySkills,
        userQuery,
        user: req.user.id, // Attach the authenticated user's ID
        available: false,
      });

      // Save the new listing to the database
      const savedListing = await listing.save();
      console.log(savedListing);

      // Return a success response
      res.status(201).json({ message: 'Listing created successfully', data: savedListing });
    } catch (error) {
      console.error('Error creating listing:', error.message);
      res.status(500).json({ message: 'Failed to create listing', error: error.message });
    }
  }
);


// Route to fetch approved service experts filtered by category
router.get("/approved", async (req, res) => {
  const { category } = req.query;

  try {
    const approvedListings = await ServiceExpert.find({
      status: "approved",
      categories: { $elemMatch: { label: category } }
    })
    .populate("listingId", "fulName")
    .exec();

    if (approvedListings.length === 0) {
      return res.status(404).json({ message: "No approved service experts found for this category" });
    }

    console.log(approvedListings); // Log to check available

    res.status(200).json(approvedListings);
  } catch (err) {
    console.error("Error fetching approved service experts:", err);
    res.status(500).json({ message: "Failed to fetch approved service experts" });
  }
});


// Route to check submission eligibility for the last 6 months
router.get('/check-submission/:userId', ensureAuthenticated, async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all listings submitted by the user
    const listings = await Listing.find({ user: userId }).sort({ createdAt: -1 });

    // If the user has no listings or has already submitted a listing within the last 6 months
    if (listings.length === 0 || (new Date() - listings[0].createdAt) > 6 * 30 * 24 * 60 * 60 * 1000) {
      return res.status(200).json({ message: 'You are eligible to submit a new application.' });
    } else {
      return res.status(400).json({ message: 'You have already submitted an application within the last 6 months.' });
    }
  } catch (error) {
    console.error('Error checking submission eligibility:', error.message);
    return res.status(500).json({ message: 'Failed to check submission eligibility', error: error.message });
  }
});


module.exports = router;
