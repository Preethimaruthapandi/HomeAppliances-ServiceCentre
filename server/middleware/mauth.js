const jwt = require('jsonwebtoken');

const ensureAuthenticated = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user data to the request object
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);

    // Handle specific error cases
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Catch other JWT errors (e.g., invalid signature, malformed token)
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { ensureAuthenticated };
