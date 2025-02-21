const mongoose = require("mongoose");

const serviceExpertSchema = new mongoose.Schema(
  {
    listingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Listing", 
      required: true,
      unique: true // Enforce uniqueness of the listingId
    },
    categories: [
      {
        label: { type: String, required: true },
        description: { type: String },
        img: { type: String },
      },
    ],
    photos: [{ type: String }], // Array of photo file paths
    place: { type: String, default: null },
    status: { type: String, enum: ["approved", "denied"], required: true },

    // Ratings - Each user can provide a rating (1 to 5)
    ratings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        rating: { type: Number, min: 1, max: 5, required: true }
      }
    ],

    // Reviews - Each user can provide a review
    reviews: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        review: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ],

  },
  { timestamps: true }
);

module.exports = mongoose.model("ServiceExpert", serviceExpertSchema);
