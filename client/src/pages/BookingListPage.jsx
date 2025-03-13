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
  const userId = useSelector((state) => state.user?._id);
  const [bookings, setBookingsState] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    if (!token || !userId) {
      setBookingsState([]);
      setCategoryCounts({});
      return;
    }

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3001/api/bookings/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (Array.isArray(data)) {
          setBookingsState(data);
          dispatch(setBookingList(data.map((booking) => booking._id)));

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

  useEffect(() => {
    if (statusFilter === "All") {
      setFilteredBookings(bookings);
    } else {
      setFilteredBookings(bookings.filter((booking) => booking.bookingStatus === statusFilter));
    }
  }, [statusFilter, bookings]);

  return (
    <div>
      <Navbar />
      <div className="booking-list-container">
        <h2>Your Bookings</h2>

        {/* Status Filter */}
        <div className="filter-container">
          <label htmlFor="statusFilter">Filter by Status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Category Summary */}
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

        {/* Booking List */}
        {filteredBookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          filteredBookings.map((booking) => (
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

              <h3>ExpertName: {booking.serviceExpertId?.listingId?.fullName || "Unknown Expert"}</h3>
              <p>Service Date: {new Date(booking.serviceDate).toLocaleDateString()}</p>
              <p>Status: <span className={`status-tag ${booking.bookingStatus.toLowerCase()}`}> {booking.bookingStatus}</span></p>

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
