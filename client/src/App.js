import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails.jsx";
import WishList from "./pages/WishList";
import CategoryPage from "./pages/CategoryPage"; // Import CategoryPage
import AdminPage from "./pages/Admin";
import SubmissionSuccess from "./pages/SubmissionSuccess.jsx";
import BookService from "./pages/BookService.jsx";
import BookingPage from "./pages/Booking.jsx";
import BookingListPage from "./pages/BookingListPage.jsx";
import ManageBookings from "./pages/ManageBooking.jsx";
import ThankYouPage from "./pages/ThankYouPage";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/experts/category/:category" element={<CategoryPage />} />
          <Route path="/:userId/wishList" element={<WishList />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/listings/:id" element={<ListingDetails />} />
          <Route path="/submission-success" element={<SubmissionSuccess />} />
          <Route path="/book/:id" element={<BookService />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/:userId/bookinglist" element={<BookingListPage />} />
          <Route path="/thank-you" element={<ThankYouPage />} />
          <Route path="/admin/manage-bookings" element={<ManageBookings />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
