const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  serviceExpertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceExpert",
    required: true,
  },
  categories: [
    {
      label: { type: String, required: true },
      count: { type: Number, required: true },
      cost: { type: Number, required: true },
      warrantyStartDate: { type: Date },
      warrantyYears: { type: Number },
      warrantyStatus: { type: String, enum: ["Valid", "Expired", ""] },
      isPrestige: { type: Boolean, default: false },
    },
  ],
  applianceImages: [{ type: String, required: true}], // Store image URLs or file paths
  serviceDate: { type: Date, required: true },
  warrantyCard: { type: String }, // URL or path of the uploaded warranty card
  proofs: [{ type: String }], // URLs or paths of additional proof images
  totalAmount: { type: Number, required: true },
  mobileNo: { type: String, required: true }, // Added mobile number
  address: { type: String, required: true }, // Added address
  bookingStatus: {
    type: String,
    enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
    default: "Pending",
  },
  paymentId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
