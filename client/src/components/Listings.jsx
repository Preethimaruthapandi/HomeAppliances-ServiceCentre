import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setWishList } from "../redux/state";
import "../styles/Listings.scss";
import { categories } from "../data";
import Card from "../components/ListingCard";

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [filteredCategory, setFilteredCategory] = useState("All");
  const dispatch = useDispatch();
  
  const token = useSelector((state) => state.token) || localStorage.getItem("token");
  const wishList = useSelector((state) => state.wishList) || [];
  
  console.log("Redux wishList after update:", wishList);

  useEffect(() => {
    fetchApprovedListings();
    if (token) {
      fetchWishList();
    } else {
      console.warn("fetchWishList skipped: No token.");
    }
  }, [token]);

  const fetchApprovedListings = async () => {
    try {
      const { data } = await axios.get("http://localhost:3001/api/admin/approved");
      const validListings = data.filter((listing) => listing?._id);
      console.log("Approved Listings:", validListings);
      setListings(validListings);
    } catch (error) {
      console.error("Error fetching approved listings:", error);
    }
  };

  const fetchWishList = async () => {
    if (!token) return;

    try {
      console.log("Fetching wishlist with token:", token);
      const response = await axios.get("http://localhost:3001/users/allwishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && Array.isArray(response.data.wishlist)) {
        const wishListIds = response.data.wishlist
          .map((item) => item?._id || item) // Ensure IDs
          .filter(Boolean); // Remove invalid/null values

        console.log("Updated Wishlist IDs:", wishListIds);
        dispatch(setWishList(wishListIds)); // Store only IDs
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    }
  };

  const toggleWishList = async (listing) => {
    if (!listing?._id || !token) return;

    const isInWishList = wishList.includes(listing._id);
    
    console.log("Toggling Wishlist:", listing._id, "Currently in wishlist:", isInWishList);

    try {
      const response = await axios.put(
        "http://localhost:3001/users/wishlist",
        { listingId: listing._id, action: isInWishList ? "remove" : "add" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Wishlist update response:", response.data);

      dispatch(setWishList(
        isInWishList
          ? wishList.filter((id) => id !== listing._id) // Remove ID
          : [...wishList, listing._id] // Add ID
      ));

    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  const filterListings = (category) => setFilteredCategory(category);

  const displayedListings =
    filteredCategory === "All"
      ? listings
      : listings.filter((listing) =>
          listing.categories?.some((cat) => cat.label === filteredCategory)
        );

  return (
    <div className="homepage-container">
      <div className="categories-container">
        <button
          className={`category-btn ${filteredCategory === "All" ? "active" : ""}`}
          onClick={() => filterListings("All")}
        >
          All
        </button>
        {categories.map((category, index) => (
          <button
            key={index}
            className={`category-btn ${filteredCategory === category.label ? "active" : ""}`}
            onClick={() => filterListings(category.label)}
          >
            {category.icon}
            <span>{category.label}</span>
          </button>
        ))}
      </div>

      <div className="cards-container">
        {displayedListings.map((listing) => (
          <Card
            key={listing?._id}
            listing={listing}
            isLiked={wishList.includes(listing._id)}
            onToggleWishList={toggleWishList}
          />
        ))}
      </div>
    </div>
  );
};

export default Listings;
