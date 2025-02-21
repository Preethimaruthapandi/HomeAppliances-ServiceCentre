import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { Box, TextField, Button, Typography,  IconButton  } from "@mui/material";
import {jwtDecode} from "jwt-decode";
import { Delete } from "@mui/icons-material";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { categories as predefinedCategories } from "../data";
import "../styles/Booking.scss";

const BookingPage = () => {
  const { id } = useParams();
  const token = useSelector((state) => state.token);
  const serviceExpertId = id;
  const decodedToken = jwtDecode(token);
  const userId = decodedToken.id;
  const warrantyInputRef = useRef(null);
  const proofsInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState({});
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [serviceDate, setServiceDate] = useState("");
  const [warrantyStartDate, setWarrantyStartDate] = useState("");
  const [warrantyYears, setWarrantyYears] = useState("");
  const [warrantyCard, setWarrantyCard] = useState(null);
  const [proofs, setProofs] = useState([]);
  const [warrantyMessage, setWarrantyMessage] = useState("");
  const [warrantyStatus, setWarrantyStatus] = useState("");

  const [isPrestige, setIsPrestige] = useState(false);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/bookings/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const mappedCategories = response.data.map((cat) => {
          const matchedCategory = predefinedCategories.find((c) => c.label === cat.label);
          return {
            ...cat,
            icon: matchedCategory ? matchedCategory.icon : "🔧",
            cost: matchedCategory ? matchedCategory.cost : 0,
          };
        });

        console.log("fetched categories",mappedCategories);

        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [id, token]);

  useEffect(() => {
    const status = calculateWarrantyStatus();
    setWarrantyStatus(status);
  }, [warrantyStartDate, warrantyYears]);

  const calculateWarrantyStatus = (startDate, years) => {
    if (!startDate || !years) return "";
  
    const start = new Date(startDate);
    const current = new Date();
    const warrantyEndDate = new Date(start.setFullYear(start.getFullYear() + parseInt(years)));
  
    return current <= warrantyEndDate ? "Valid" : "Expired";
  };
   
  const calculateTotalServiceCharge = () => {
    let totalCost = 0;
  
    Object.values(selectedCategories).forEach((cat) => {
      console.log("Category Object:", cat); // Check the full object
      console.log("Cost:", cat.cost); 
      let itemCost = Number(cat.cost) || 0; 
      let itemCount = Number(cat.count) || 1; 
  
      let totalItemCost = itemCost * itemCount;
  
      if (cat.warrantyStatus === "Valid") {
        totalItemCost = 0; // Free service if warranty is valid
      }
  
      if (cat.warrantyStatus === "Expired" && cat.isPrestige) {
        totalItemCost *= 0.8; // 20% discount
      }
  
      totalCost += totalItemCost;
    });
  
    return totalCost.toFixed(2);
  };
  
  
  const getTotalSelectedCount = () => {
    return Object.values(selectedCategories).reduce((acc, cat) => acc + cat.count, 0);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategories((prev) => {
      const newSelected = { ...prev };

      console.log("Category clicked:", category);

  
      if (newSelected[category.label]) {
        delete newSelected[category.label];
      } else {
        newSelected[category.label] = { 
          ...category, 
          count: 1, 
          cost: Number(category.cost) || 0, // Ensure cost is always included
          warrantyStartDate: "", 
          warrantyYears: "", 
          warrantyStatus: "",
          isPrestige: false // Default to false, user must select manually
        };
      }

    console.log("Updated Selected Categories:", newSelected);
      return newSelected;
    });
  };
  
  
  

  const handleCategoryCountChange = (category, action) => {
    setSelectedCategories((prev) => {
      const newSelected = { ...prev };
      const totalSelectedCount = getTotalSelectedCount();

      if (newSelected[category.label]) {
        if (action === "increase" && totalSelectedCount < 2) {
          newSelected[category.label].count += 1;
        } else if (action === "decrease") {
          if (newSelected[category.label].count > 1) {
            newSelected[category.label].count -= 1;
          } else {
            delete newSelected[category.label];
          }
        } else {
          alert("Total count cannot exceed 2.");
        }
      }
      return newSelected;
    });
  };

  

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedPhotos((prev) => [...prev, ...files.slice(0, 5 - prev.length)]);
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleWarrantyChange = (e) => {
    const file = e.target.files[0];
    if (file) setWarrantyCard(file);
  };

  const handleProofsChange = (e) => {
    const files = Array.from(e.target.files);
    setProofs(files);
  };

  const removeWarrantyCard = () => {
    setWarrantyCard(null);
    if (warrantyInputRef.current) warrantyInputRef.current.value = "";
  };

  const removeProof = (index) => {
    const updatedProofs = proofs.filter((_, i) => i !== index);
    setProofs(updatedProofs);
    if (updatedProofs.length === 0 && proofsInputRef.current) {
      proofsInputRef.current.value = "";
    }
  };


  const handleBooking = async () => {
  if (!Object.keys(selectedCategories).length || uploadedPhotos.length === 0 || !serviceDate) {
    alert("Please fill all the required fields");
    return;
  }

  if (warrantyStatus === "Valid" && (!warrantyCard || proofs.length === 0)) {
    alert("Please upload warranty card and required proofs for free service.");
    return;
  }

  let discount = 0;
  if (warrantyStatus === "Expired" && isPrestige) {
    discount = 0.2; // 20% discount
  }

  const totalServiceCharge = calculateTotalServiceCharge();
  const formData = new FormData();

  formData.append("categories", JSON.stringify(Object.values(selectedCategories).map(cat => ({
    label: cat.label,
    count: cat.count,
    warrantyStartDate: cat.warrantyStartDate,
    warrantyYears: Number(cat.warrantyYears),
    warrantyStatus: cat.warrantyStatus,
    cost: cat.cost,
  }))));
  console.log(token);
  formData.append("userId", userId);  // Ensure token.id is properly set
  formData.append("serviceDate", serviceDate);
  formData.append("serviceExpertId", serviceExpertId);
  formData.append("totalAmount", Number(totalServiceCharge));

  // Append images
  uploadedPhotos.forEach((photo) => {
    formData.append("applianceImages", photo);
  });

  if (warrantyCard) {
    formData.append("warrantyCard", warrantyCard);
  }

  proofs.forEach((proof) => {
    formData.append("proofs", proof);
  });

  try {
    const response = await axios.post("http://localhost:3001/api/bookings", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    if (response.status === 201) {
      setIsBookingConfirmed(true);
      alert("Service booking confirmed!");
    }
  } catch (error) {
    console.error("Error booking service:", error);
  }
};

  return (
    <>
      <Navbar />

      <Box sx={{ p: 3 }} className="booking-container">
        <Typography variant="h4" gutterBottom className="booking-header">
          Book a Service
        </Typography>

        <Typography variant="h6" gutterBottom>Select Categories</Typography>
        <div className="categories-container">
          {categories.map((category, index) => (
            <div
              key={index}
              className={`category-card ${selectedCategories[category.label] ? "selected" : ""}`}
              onClick={() => handleCategoryClick(category)}
            >
              <span className="category-icon">{category.icon}</span>
              <span>{category.label}</span>

              {selectedCategories[category.label] && (
                <div className="count-controls">
                  <button className="count-btn" onClick={(e) => { e.stopPropagation(); handleCategoryCountChange(category, "decrease"); }}>-</button>
                  <span className="category-count">{selectedCategories[category.label].count}</span>
                  <button className="count-btn" onClick={(e) => { e.stopPropagation(); handleCategoryCountChange(category, "increase"); }}>+</button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Typography variant="h6" gutterBottom>Upload Appliance Photos</Typography>
        <div className="uploaded-photos-grid">
          {uploadedPhotos.map((photo, index) => (
            <div key={index} className="photo-container">
              <img src={URL.createObjectURL(photo)} alt={`Uploaded ${index}`} className="uploaded-photo" />
              <button className="remove-photo-button" onClick={() => handleRemovePhoto(index)}>🗑️</button>
            </div>
          ))}
          {uploadedPhotos.length < 5 && (
            <label className="upload-photo-box">
              <span>Upload from your device</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} hidden />
            </label>
          )}
        </div>

        
        <Typography variant="h6">Warranty is applicable only for Prestige appliances. Even if your warranty has expired, please enter the warranty details.</Typography>
        <br></br>
        {Object.entries(selectedCategories).map(([key, cat]) => (
  <Box key={key} sx={{ border: "1px solid #ddd", p: 2, mb: 2, borderRadius: "8px" }}>
    <Typography variant="h6">{cat.label}</Typography>
    <br></br>

    <TextField
  fullWidth
  label="Warranty Start Date"
  type="date"
  value={cat.warrantyStartDate}
  onChange={(e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates

    if (selectedDate > today) {
      alert("Enter a valid Warranty start date.");
      return;
    }

    setSelectedCategories((prev) => {
      const updatedCategories = {
        ...prev,
        [key]: { 
          ...prev[key], 
          warrantyStartDate: e.target.value,
          warrantyStatus: calculateWarrantyStatus(e.target.value, prev[key].warrantyYears),
        },
      };
      return updatedCategories;
    });
  }}
  sx={{ mb: 2 }}
  InputLabelProps={{ shrink: true }}
/>



    <TextField
      fullWidth
      label="Years of Warranty"
      type="number"
      value={cat.warrantyYears}
      onChange={(e) => {
        setSelectedCategories((prev) => {
          const updatedCategories = {
            ...prev,
            [key]: { 
              ...prev[key], 
              warrantyYears: e.target.value,
              warrantyStatus: calculateWarrantyStatus(prev[key].warrantyStartDate, e.target.value),
            },
          };
      
          return updatedCategories;
        });
      }}
      
      sx={{ mb: 2 }}
    />

{cat.warrantyStatus && (
  <Typography variant="h6">
    Warranty Status: {cat.warrantyStatus}
  </Typography>
)}

{cat.warrantyStatus === "Expired" && (
  <>
    <Typography variant="h6">Is this a Prestige Appliance?</Typography>
    <Button
  variant="contained"
  color={cat.isPrestige ? "success" : "primary"}
  onClick={() => {
    setSelectedCategories((prev) => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        isPrestige: !prev[key].isPrestige // Toggle for this specific category
      },
    }));
  }}
>
  {cat.isPrestige ? "Yes" : "No"}
</Button>

    {cat.isPrestige && <Typography variant="h6">20% Discount Applied!</Typography>}
  </>
)}

{cat.warrantyStatus === "Valid" && (
  <>
    <Typography variant="h6" color="green">
      ✅ Warranty is Valid! Free service available.
    </Typography>

    <div className="file-upload-container">
      {/* Warranty Card Upload */}
      <Typography variant="h6" className="upload-label">
        Upload Warranty Card
      </Typography>
      <label className="custom-file-label">
        <input
          type="file"
          accept="image/*, application/pdf"
          onChange={handleWarrantyChange}
          ref={warrantyInputRef}
          hidden
        />
        <Button variant="contained" component="span" className="upload-button">
          Choose File
        </Button>
        
      </label>
      {warrantyCard && (
        <div className="file-preview">
          {warrantyCard && <span className="file-name">{warrantyCard.name}</span>}
          <IconButton onClick={removeWarrantyCard} size="small">
            <Delete color="error" />
          </IconButton>
        </div>
      )}

      {/* Additional Proofs Upload */}
      <Typography variant="h6" className="upload-label">
        Upload Additional Proofs
      </Typography>
      <label className="custom-file-label">
        <input
          type="file"
          accept="image/*, application/pdf"
          multiple
          onChange={handleProofsChange}
          ref={proofsInputRef}
          hidden
        />
        <Button variant="contained" component="span" className="upload-button">
          Choose Files
        </Button>
      </label>
      {proofs.length > 0 && (
        <div className="file-list">
          {proofs.map((file, index) => (
            <div key={index} className="file-preview">
              <span className="file-name">{file.name}</span>
              <IconButton onClick={() => removeProof(index)} size="small">
                <Delete color="error" />
              </IconButton>
            </div>
          ))}
        </div>
      )}
    </div>

    <br></br>

    {(!warrantyCard || proofs.length === 0) && (
      <Typography color="red">
        ⚠️ Please upload warranty card and proofs for free service.
      </Typography>
    )}
  </>
)}



  </Box>
))}


       

        <br></br>
        <Typography variant="h6">Service dates within the next 3 days and beyond one month are not allowed. </Typography>
        <br></br>

        <TextField
  fullWidth
  label="Service Date"
  type="date"
  value={serviceDate}
  onChange={(e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to compare only dates

    const minValidDate = new Date();
    minValidDate.setDate(today.getDate() + 3); // At least 3 days from today

    const maxValidDate = new Date();
    maxValidDate.setMonth(today.getMonth() + 1); // 1 month from today

    if (selectedDate < minValidDate) {
      alert("Service date must be at least 3 days from today.");
      return;
    }

    if (selectedDate > maxValidDate) {
      alert("Service date cannot be more than 1 month from today.");
      return;
    }

    setServiceDate(e.target.value);
  }}
  sx={{ mb: 3 }}
  InputLabelProps={{ shrink: true }}
/>


<Typography variant="h6" color="textSecondary">
  Service Timing: 9:00 AM - 6:00 PM
</Typography>
<br></br>
        <Typography variant="h6">
  {`Total Service Charge: ₹${Number(calculateTotalServiceCharge()) || 0}`}
</Typography>

<br></br>
        <Button variant="contained" color="primary" onClick={handleBooking} className="booking-button">Book Service</Button>
      </Box>

      <Footer />
    </>
  );
};

export default BookingPage;
