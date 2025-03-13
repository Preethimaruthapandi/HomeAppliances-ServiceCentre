require("dotenv").config();
const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Payment Order
router.post("/create-order", async (req, res) => {
  try {
    const { amount, currency } = req.body;

    const options = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `order_rcptid_${Date.now()}`,
      payment_capture: 1, // Auto-capture payment
    };

    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    console.error("Razorpay Order Error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/verify-payment", (req, res) => {
  console.log("Payment Verification Request:", req.body); // ✅ Log the incoming request

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: "Missing payment details" });
  }

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  console.log("Expected Signature:", expectedSignature);
  console.log("Received Signature:", razorpay_signature);

  if (expectedSignature === razorpay_signature) {
    return res.json({ success: true, message: "Payment verified successfully!" });
  } else {
    return res.status(400).json({ success: false, message: "Invalid payment signature" });
  }
});



module.exports = router;
