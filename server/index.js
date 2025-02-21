const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Routes
const authRoutes = require("./routes/auth.js");
const listingRoutes = require("./routes/listing.js");
const bookingRoutes = require("./routes/booking.js");
const userRoutes = require("./routes/user.js");
const adminRoutes = require("./routes/admin.js");
const ratingRoutes = require("./routes/ratingandreview.js");

const app = express();

// Middleware for security and logging
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(helmet()); // Adds security headers to protect against common vulnerabilities
app.use(morgan("dev")); // Logs all incoming requests (use "combined" in production for more detailed logs)

/* ROUTES */
app.use("/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/users", userRoutes); // This will use the routes defined in user.js
app.use("/api/admin", adminRoutes);
app.use("/api/ratings", ratingRoutes);


/* MONGOOSE SETUP */
const PORT = process.env.PORT || 3001;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error("MongoDB URL not found in environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGO_URL, { dbName: "Service_Centre" })
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

/* Global error handler */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "An internal server error occurred", error: err.message });
});
