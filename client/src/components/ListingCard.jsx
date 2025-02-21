import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom"; 
import axios from "axios"; // For API requests
import "../styles/ListingCard.scss";

const Card = ({ listing, isLiked, onToggleWishList }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [averageRating, setAverageRating] = useState(0); // State to store average rating
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/ratings/${listing._id}`);
        setAverageRating(response.data.averageRating); // Set average rating from API
      } catch (error) {
        console.error("Failed to fetch rating:", error);
      }
    };

    fetchRating();
  }, [listing._id]);


  const handleToggle = (e) => {
    e.stopPropagation(); 
    onToggleWishList(listing);
  };

  const nextPhoto = (e) => {
    e.stopPropagation(); 
    if (listing.photos?.length > 1) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % listing.photos.length);
    }
  };

  const prevPhoto = (e) => {
    e.stopPropagation(); 
    if (listing.photos?.length > 1) {
      setCurrentPhotoIndex((prevIndex) => (prevIndex - 1 + listing.photos.length) % listing.photos.length);
    }
  };

  const handleNavigation = () => {
    navigate(`/book/${listing._id}`); 
  };

  // Function to render the stars based on average rating
  const renderStars = () => {
    const fullStars = Math.floor(averageRating);
    const halfStar = averageRating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    return (
      <>
        {Array.from({ length: fullStars }).map((_, index) => (
          <span key={`full-${index}`} className="star filled">★</span>
        ))}
        {halfStar && <span key="half-star" className="star half-filled">★</span>}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <span key={`empty-${index}`} className="star">★</span>
        ))}
      </>
    );
    
  };

  return (
    <div className="card" onClick={handleNavigation}>
      {/* Wishlist Heart Icon */}
      <div className={`heart-icon ${isLiked ? "liked" : ""}`} onClick={handleToggle}>
        {isLiked ? "❤️" : "🤍"}
      </div>

      <div className="photo-container">
        {listing.photos?.length > 1 && (
          <button className="arrow left-arrow" onClick={prevPhoto}>{"<"}</button>
        )}

        <img
          src={`http://localhost:3001/uploads/${listing.photos?.[currentPhotoIndex]}`}
          alt={`Photo ${currentPhotoIndex + 1}`}
          className="card-image"
        />

        {listing.photos?.length > 1 && (
          <button className="arrow right-arrow" onClick={nextPhoto}>{">"}</button>
        )}
      </div>

      <div className="card-content">
        <p className="card-owner">
          {listing.listingId?.fullName || "Unknown"} <span className="card-place">{listing.place || "Unknown Place"}</span>
        </p>
        <p className="card-categories">
          <span className="prof">Proficiency: </span>
          {listing.categories?.map((cat, index) => (
  <span key={index} className="category">{cat.label}</span>
))}

        </p>
      </div>
      <div className="card-footer">
  <span className="availability">
    {listing.listingId?.available ? "Available" : "Unavailable"}
  </span>
  <div className="rating">
    {renderStars()}
  </div>
</div>

    </div>
  );
};

Card.propTypes = {
  listing: PropTypes.object.isRequired,
  isLiked: PropTypes.bool.isRequired,
  onToggleWishList: PropTypes.func.isRequired,
};

export default Card;
