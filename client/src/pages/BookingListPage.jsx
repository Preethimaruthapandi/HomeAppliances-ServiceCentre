import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../styles/BookingListPage.scss";
import { setBookingList } from "../redux/state";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BookingList = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const userId = useSelector((state) => state.user?._id); // Get userId from Redux
  const [bookings, setBookingsState] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});

  useEffect(() => {
    if (!token || !userId) {
      setBookingsState([]);
      setCategoryCounts({});
      return;
    }

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3001/api/bookings/${userId}`, // Fetch bookings using userId from Redux
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Booking API response:", data);

        if (Array.isArray(data)) {
          setBookingsState(data);
          dispatch(setBookingList(data.map((booking) => booking._id))); // Store IDs in Redux

          // Count categories
          const categoryCounter = {};
          data.forEach((booking) => {
            booking.categories?.forEach((category) => {
              categoryCounter[category.label] = (categoryCounter[category.label] || 0) + 1;
            });
          });
          setCategoryCounts(categoryCounter);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      }
    };

    fetchBookings();
  }, [token, userId, dispatch]);

  return (
    <div>
      <Navbar />
      <div className="booking-list-container">
        <h2>Your Bookings</h2>

        {/* Display category count */}
        <div className="category-summary">
          <h3>Category Summary</h3>
          {Object.keys(categoryCounts).length === 0 ? (
            <p>No categories found.</p>
          ) : (
            <ul>
              {Object.entries(categoryCounts).map(([category, count]) => (
                <li key={category}>
                  <strong>{category}</strong>: {count}
                </li>
              ))}
            </ul>
          )}
        </div>

        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          bookings.map((booking) => (
            <div className="booking-card" key={booking._id}>
              <img
                src={
                  booking.serviceExpertId?.listingId?.user?.profileImagePath
                    ? `http://localhost:3001/${booking.serviceExpertId.listingId.user.profileImagePath}`
                    : "/default-avatar.png"
                }
                alt={booking.serviceExpertId?.listingId?.fullName || "Service Expert"}
                className="profile-image"
              />

              <h3>Name: {booking.serviceExpertId?.listingId?.fullName || "Unknown Expert"}</h3>
              <p>Service Date: {new Date(booking.serviceDate).toLocaleDateString()}</p>
              <p>Status: {booking.bookingStatus}</p>

              {/* Display Categories */}
              {booking.categories?.length > 0 && (
                <div className="category-list">
                  <h4>Categories:</h4>
                  <ul>
                    {booking.categories.map((category) => (
                      <li key={category._id}>{category.label}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <Footer />
    </div>
  );
};

export default BookingList;
