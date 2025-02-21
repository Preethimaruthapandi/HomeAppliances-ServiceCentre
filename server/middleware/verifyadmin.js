const jwt = require("jsonwebtoken");
const User = require("../models/User");

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access only" });
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ message: "Forbidden: Invalid or missing token" });
  }
};

module.exports = { verifyAdmin };
