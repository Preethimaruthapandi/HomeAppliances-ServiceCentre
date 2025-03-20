import React from "react";
import axios from "axios";

const RazorpayButton = ({ amount, onSuccess }) => {
  const handlePayment = async () => {
    try {
      const { data } = await axios.post("http://localhost:3001/api/payment/create-order", {
        amount: Number(amount),
        currency: "INR",
      });
  
      const options = {
        key: "rzp_test_SsEE5lqFcauHzT",
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId, // ✅ Fresh order every time
        name: "Home Appliance Services",
        description: "Booking Payment",
        prefill: {
          name: "John Doe",
          email: "johndoe@example.com",
          contact: "9876543210",
        },
        handler: async function (response) {
          await axios.post("http://localhost:3001/api/payment/verify-payment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
  
          alert("Payment Successful!");
          onSuccess(response.razorpay_payment_id); // ✅ Notify parent that payment was successful
        },
        theme: { color: "#3399cc" },
      };
  
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment Error:", error);
      alert("Payment Failed");
    }
  };
  

  return <button onClick={handlePayment}>Pay Now ₹{amount}</button>;
};

export default RazorpayButton;
