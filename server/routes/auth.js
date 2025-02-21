const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const axios = require("axios");
const validator = require("validator");
const User = require("../models/User");
const fs = require("fs");
const path = require("path");

// Ensure the 'uploads' directory exists
const uploadDirectory = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Ensures unique file names by appending timestamp
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Ensure only image files are allowed
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Mailboxlayer API Key (Replace with your actual API key)
const MAILBOXLAYER_API_KEY = process.env.MAILBOXLAYER_API_KEY;

// USER REGISTER
router.post("/register", upload.single("profileImage"), async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Input validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check email validity using Mailboxlayer
    const emailValidationUrl = `http://apilayer.net/api/check?access_key=${MAILBOXLAYER_API_KEY}&email=${email}&smtp=1&format=1`;

    const mailboxResponse = await axios.get(emailValidationUrl);
    const { format_valid, smtp_check, disposable } = mailboxResponse.data;

    if (!format_valid || !smtp_check || disposable) {
      return res.status(400).json({ message: "Invalid or disposable email address." });
    }

    // Check password length
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const profileImage = req.file;
    if (!profileImage) {
      return res.status(400).json({ message: "Profile image is required." });
    }

    const profileImagePath = profileImage.path
      .replace(/\\/g, "/") // Replace backslashes with forward slashes
      .replace(/^.*\/uploads\//, "uploads/"); // Keep only the relative path after "uploads/"

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists!" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImagePath,
      role,
    });

    await newUser.save();
    res.status(200).json({ message: "User registered successfully!", user: newUser });
  } catch (err) {
    console.error("Error during registration:", err);
    res.status(500).json({ message: "Registration failed!", error: err.message });
  }
});

// USER LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User doesn't exist!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials!" });
    }

    // Create access token only
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1h" }); // Access token (1 hour)

    // Exclude password from the response
    const { password: _, ...userWithoutPassword } = user._doc;

    // Return access token only
    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ message: "Login failed!", error: err.message });
  }
});





module.exports = router;
