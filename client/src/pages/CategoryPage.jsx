import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/CategoryPage.scss";
import Card from "../components/ListingCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { setWishList } from "../redux/state";

const CategoryPage = () => {
  const { category } = useParams();
  const [listings, setListings] = useState([]);
  const dispatch = useDispatch();
  const wishListIds = useSelector((state) => state.wishList); // Redux wishlist IDs
  const token = useSelector((state) => state.token);
  const [wishList, setWishListState] = useState([]); // Local state for wishlist details

  // Fetch approved listings for the category
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const encodedCategory = encodeURIComponent(category.trim());
        const { data } = await axios.get(
          `http://localhost:3001/api/listings/approved?category=${encodedCategory}`
        );
        setListings(data);
      } catch (error) {
        console.error("Error fetching approved service experts:", error);
      }
    };

    fetchListings();
  }, [category]);

  // Fetch full wishlist details from the backend
  useEffect(() => {
    if (!token || wishListIds.length === 0) return;

    const fetchWishListDetails = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:3001/users/wishlist-details",
          { wishListIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Ensure listingId is always an object
        const updatedWishlist = data.map((item) => ({
          ...item,
          listingId: typeof item.listingId === "string"
            ? { _id: item.listingId, fullName: "Unknown" }
            : item.listingId,
        }));

        setWishListState(updatedWishlist);
      } catch (error) {
        console.error("Error fetching wishlist details:", error);
      }
    };

    fetchWishListDetails();
  }, [token, wishListIds]);

  // Toggle wishlist (Add/Remove)
  const toggleWishList = async (listingId) => {
    if (!listingId || !token) return;

    const isInWishList = wishListIds.includes(listingId);

    try {
      const { data } = await axios.put(
        "http://localhost:3001/users/wishlist",
        { listingId, action: isInWishList ? "remove" : "add" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update Redux and local state
      dispatch(setWishList(data.wishlist));

      // Remove from local wishlist if unliked
      setWishListState((prev) => prev.filter((item) => item._id !== listingId));
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="category-page">
        <h3>Experts specializing in {category}</h3>
        <div className="cards-container">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <Card
                key={listing._id}
                listing={listing}
                isLiked={wishListIds.includes(listing._id)}
                onToggleWishList={() => toggleWishList(listing._id)}
              />
            ))
          ) : (
            <p>No service experts found for this category</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default CategoryPage;
