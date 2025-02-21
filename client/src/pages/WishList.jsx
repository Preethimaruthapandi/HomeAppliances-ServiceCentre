import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Card from "../components/ListingCard";
import "../styles/Wishlist.scss";
import { setWishList } from "../redux/state";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const WishList = () => {
  const dispatch = useDispatch();
  const wishListIds = useSelector((state) => state.wishList); // Redux stores only listing IDs
  const token = useSelector((state) => state.token);

  const [wishList, setWishListState] = useState([]); // Local state for full listing objects

  useEffect(() => {
    if (!token || wishListIds.length === 0) {
      setWishListState([]);
      return;
    }

    const fetchWishListDetails = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:3001/users/wishlist-details",
          { wishListIds },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Wishlist API response:", data); // Debugging

        if (Array.isArray(data)) {
          setWishListState(
            data.map((item) => ({
              ...item,
              listingId: item.listingId || { fullName: "Unknown" }, // Ensure listingId exists
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching wishlist details:", error);
      }
    };

    fetchWishListDetails();
  }, [token, wishListIds]);

  const toggleWishList = async (listingId) => {
    if (!listingId || !token) return;

    const isInWishList = wishListIds.includes(listingId);

    try {
      // API call to update wishlist
      const { data } = await axios.put(
        "http://localhost:3001/users/wishlist",
        { listingId, action: isInWishList ? "remove" : "add" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Updated Wishlist Data:", data.wishlist);

      // Update Redux store with new list
      dispatch(setWishList(data.wishlist)); // Assuming the response contains the updated wishlist

      // Update local state to reflect the changes
      setWishListState((prev) =>
        prev.filter((item) => item._id !== listingId)
      );
    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  return (
    <>
      <Navbar />
      <div className="wishlist-container">
        <h1 className="wishlist-title">Your Wish List</h1>
        {wishList.length === 0 ? (
          <p className="empty-wishlist">No items in your wishlist.</p>
        ) : (
          <div className="cards-container">
            {wishList.map((listing) => (
              <Card
                key={listing._id}
                listing={{
                  ...listing,
                  listingId: listing.listingId || { fullName: "Unknown" }, // Ensure fullName exists
                }}
                isLiked={wishListIds.includes(listing._id)}
                onToggleWishList={() => toggleWishList(listing._id)}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default WishList;
