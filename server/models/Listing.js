const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    address: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    educationalQualifications: { type: String, required: true },
    degreeCertificate: { type: String, required: true }, // Single file path or URL
    technicalCertifications: { type: [String] }, // Array of file paths or URLs
    workExperience: { type: String, required: true }, // Updated to match textarea input from form
    experienceCertificate: { type: String, required: true }, // Single file path or URL
    keySkills: { type: String }, // Updated to match textarea input from form
    serviceReports: { type: String, required: true }, // Array of file paths or URLs for multiple uploads
    userQuery: { type: String }, // To handle the query section in the form
    status: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user who submitted the form
    available: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Listing = mongoose.models.Listing || mongoose.model('Listing', listingSchema);

module.exports = Listing;
