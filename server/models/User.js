const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    profileImagePath: {
      type: String,
      default: "",
    },
    
    wishList: {
      type: Array,
      default: [],
    },
    
    bookList: {
      type: Array,
      default: [],
    },
    
    role: {
      type: String,
      enum: ["user", "admin"],// Restrict values to 'user' or 'admin'
      default: "user", // Default role is 'user'
    },
  },
  { timestamps: true }
)

const User = mongoose.model("User", UserSchema)
module.exports = User