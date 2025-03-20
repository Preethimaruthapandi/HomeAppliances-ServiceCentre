import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Typography, Box } from "@mui/material";
import {jwtDecode} from "jwt-decode";
import { useSelector } from "react-redux";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


const ThankYouPage = () => {
  const navigate = useNavigate();
    const token = useSelector((state) => state.token);
    const decodedToken = jwtDecode(token);
    const userId = decodedToken.id;

  return (
    <>
    <Navbar />
    <Box
      sx={{
        textAlign: "center",
        mt: 5,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
    
    <img src="/assets/thankyou.jpg" alt="Thank You" width="350px" />


      <Typography variant="h4" color="primary" gutterBottom>
        🎉 Thank You for Booking!
      </Typography>

      <Typography variant="h6" color="textSecondary" sx={{ maxWidth: "600px", mb: 3 }}>
        Your booking has been confirmed. Our service experts will update the status soon.  
        You can check your <strong>Booking List</strong> for updates.
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        📞 For any queries, contact us at: <strong>+91 98765 43210</strong>
      </Typography>
      <Button 
  variant="contained" 
  sx={{ backgroundColor: "#F8395A", color: "white" }}
  onClick={() => navigate(`/${userId}/bookinglist`)} // ✅ Pass userId in the URL
>
  View Booking List
</Button>


      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => navigate("/")}>
        Go to Home
      </Button>
    </Box>
    <Footer />
    </>
  );
};

export default ThankYouPage;
