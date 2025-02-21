const router = require("express").Router();
const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const User = require("../models/User");
const Listing = require("../models/Listing");
const ServiceExpert = require("../models/ServiceExpert");
const { ensureAuthenticated } = require('../middleware/mauth');

/* GET TRIP LIST */
router.get("/:userId/trips", async (req, res) => {
  try {
    const { userId } = req.params;
    const trips = await Booking.find({ customerId: userId }).populate("customerId hostId listingId");
    res.status(202).json(trips);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Can not find trips!", error: err.message });
  }
});

/* GET PROPERTY LIST */
router.get("/:userId/properties", async (req, res) => {
  try {
    const { userId } = req.params;
    const properties = await Listing.find({ creator: userId }).populate("creator");
    res.status(202).json(properties);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Can not find properties!", error: err.message });
  }
});

/* GET RESERVATION LIST */
router.get("/:userId/reservations", async (req, res) => {
  try {
    const { userId } = req.params;
    const reservations = await Booking.find({ hostId: userId }).populate("customerId hostId listingId");
    res.status(202).json(reservations);
  } catch (err) {
    console.log(err);
    res.status(404).json({ message: "Can not find reservations!", error: err.message });
  }
});

// Get Wishlist for a specific user

router.post("/wishlist-details", ensureAuthenticated, async (req, res) => {
  try {
    const { wishListIds } = req.body;

    if (!wishListIds || wishListIds.length === 0) {
      return res.json([]); // Return an empty array if no wishlist items
    }

    const listings = await ServiceExpert.find({ _id: { $in: wishListIds } }).populate("listingId","fullName");
    
    console.log(listings);
    res.json(listings);
  } catch (error) {
    console.error("Error fetching wishlist details:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get('/allwishlist', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id; // Access the user id from the token payload
    console.log(userId);
    // Find the user in the database using the decoded user ID
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Respond with the user's wishlist
    res.json({ wishlist: user.wishList || [] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});


// Add/Remove from Wishlist for a specific user
router.put('/wishlist', ensureAuthenticated, async (req, res) => {
  const { listingId, action } = req.body;

  // Log the incoming data
  console.log('Received data:', { listingId, action });

  const userId = req.user.id;  // Get userId from token
  
  console.log(userId);

  // Validate userId and listingId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  if (!mongoose.Types.ObjectId.isValid(listingId)) {
    return res.status(400).json({ message: 'Invalid listingId' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Ensure the wishlist does not contain null or invalid values
    user.wishList = user.wishList.filter(Boolean); // Removes null/undefined values

    // Add to wishlist
    if (action === 'add') {
      if (!user.wishList.includes(listingId)) {
        user.wishList.push(listingId);
      }
    }
    // Remove from wishlist
    else if (action === 'remove') {
      user.wishList = user.wishList.filter(item => item.toString() !== listingId.toString());
    }

    await user.save();

    res.json({
      message: action === 'add' ? 'Item added to wishlist' : 'Item removed from wishlist',
      wishlist: user.wishList,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});



module.exports = router;
