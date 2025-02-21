import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../styles/ManageBookings.scss"
import { setBookingList } from "../redux/state";
import Navbar from "../components/Navbar";


const ManageBooking = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    if (!token ) {
      setBookings([]);
      return;
    }

    const fetchBookings = async () => {
      try {
        console.log("token", token);
        const { data } = await axios.get(
          `http://localhost:3001/api/admin/bookings/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log("Fetched Bookings:", data);
        setBookings(data);
        dispatch(setBookingList(data.map((booking) => booking._id)));
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, [token]);

  const handleCancelBooking = async (bookingId) => {
    try {
      await axios.put(
        `http://localhost:3001/api/admin/bookings/cancel/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setBookings((prev) =>
        prev.map((booking) =>
          booking._id === bookingId ? { ...booking, bookingStatus: "Cancelled" } : booking
        )
      );
    } catch (error) {
      console.error("Error cancelling booking:", error);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="manage-booking-container">
        <h2>Manage Your Bookings</h2>

        {bookings.length === 0 ? (
          <p>No bookings available.</p>
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

              {/* Cancel Button */}
              {booking.bookingStatus !== "Cancelled" && (
                <button className="cancel-button" onClick={() => handleCancelBooking(booking._id)}>
                  Cancel Booking
                </button>
              )}
            </div>
          ))
        )}
      </div>
     
    </div>
  );
};

export default ManageBooking;
