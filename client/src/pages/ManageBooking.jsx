import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import "../styles/ManageBookings.scss";
import { setBookingList } from "../redux/state";
import Navbar from "../components/AdminNavbar";

const ManageBooking = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const [bookings, setBookings] = useState([]);
  const [expandedBooking, setExpandedBooking] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All"); // ✅ Status Filter

  useEffect(() => {
    if (!token) {
      setBookings([]);
      return;
    }

    const fetchBookings = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:3001/api/admin/bookings/all`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
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

  const toggleExpand = (bookingId) => {
    setExpandedBooking(expandedBooking === bookingId ? null : bookingId);
  };

  const filteredBookings = statusFilter === "All"
    ? bookings
    : bookings.filter((booking) => booking.bookingStatus === statusFilter);

  return (
    <div>
      <Navbar />
      <div className="manage-booking-container">
        <h2>Manage Bookings</h2>

        {/* ✅ Status Filter */}
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

        {filteredBookings.length === 0 ? (
          <p>No bookings available.</p>
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

              <div className="booking-info">
                <h3>Expert Name: {booking.serviceExpertId?.listingId?.fullName || "Unknown Expert"}</h3>
                <p>Service Date: {new Date(booking.serviceDate).toLocaleDateString()}</p>
                <p>Status: {booking.bookingStatus}</p>
                <p>User: {booking.userId.firstName} {booking.userId.lastName}</p>
                <p>Email: {booking.userId.email}</p>
                <p><strong>Payment ID:</strong> {booking.paymentId || "N/A"}</p> {/* ✅ Payment ID */}
              </div>

              {/* Expand Details Button */}
              <button className="expand-button" onClick={() => toggleExpand(booking._id)}>
                {expandedBooking === booking._id ? "Hide Details" : "View Details"}
              </button>

              {/* Expanded Booking Details */}
              {expandedBooking === booking._id && (
                <div className="expanded-section">
                  <h4>Appliance Details</h4>
                  <ul>
                    {booking.categories.map((category, index) => (
                      <li key={index}>
                        <strong>{category.label}</strong> - {category.count} Units - ₹{category.cost}
                        {category.warrantyStartDate && (
                          <p>
                            Warranty: {category.warrantyYears} Years ({category.warrantyStatus})
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Appliance Images */}
                  <div className="image-grid">
                    {booking.applianceImages.map((image, index) => (
                      <img key={index} src={`http://localhost:3001/${image}`} alt="Appliance" className="appliance-image" />
                    ))}
                  </div>

                  {/* Warranty Card */}
                  {booking.warrantyCard && (
                    <div className="warranty-card">
                      <h4>Warranty Card</h4>
                      <a href={`http://localhost:3001/${booking.warrantyCard}`} target="_blank" rel="noopener noreferrer">
                        View Warranty Card
                      </a>
                    </div>
                  )}

                  {/* Proofs Section */}
                  {booking.proofs.length > 0 && (
                    <div className="proof-section">
                      <h4>Proofs</h4>
                      <div className="proof-grid">
                        {booking.proofs.map((proof, index) => {
                          const fileUrl = `http://localhost:3001/${proof}`;
                          const isPdf = proof.toLowerCase().endsWith(".pdf");

                          return (
                            <div key={index} className="proof-item">
                              {isPdf ? (
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="pdf-link">
                                  📄 View PDF
                                </a>
                              ) : (
                                <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                  <img src={fileUrl} alt="Proof" className="proof-image" />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p><strong>Mobile:</strong> {booking.mobileNo}</p>
                  <p><strong>Address:</strong> {booking.address}</p>
                  <p><strong>Total Amount:</strong> ₹{booking.totalAmount}</p>

                  
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManageBooking;
