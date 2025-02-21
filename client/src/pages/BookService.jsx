import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaStar } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import '../styles/BookService.scss';

const BookService = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the service ID from URL
  const token = useSelector((state) => state.token) || localStorage.getItem("token");

  let userId = null;
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
    } catch (error) {
      console.error("Invalid token", error);
    }
  }

  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [reviews, setReviews] = useState([]);

  // Fetch reviews based on service ID
  const fetchReviews = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/ratings/${id}`);
      const data = await response.json();
      if (response.ok) {
        setReviews(data.reviews || []);
      } else {
        console.error("Failed to fetch reviews", data.message);
      }
    } catch (error) {
      console.error("Error fetching reviews", error);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [id]);

  // Submit review with rating
  const handleSubmit = async () => {
    if (!userId) {
      alert("You must be logged in to submit a review.");
      return;
    }
    if (!rating) {
      alert("Please select a rating!");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3001/api/ratings/${id}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          rating,
          review,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("Your rating and review have been submitted!");
        setRating(0);
        setReview("");
        fetchReviews();
      } else {
        alert(data.message || "Failed to submit review");
      }
    } catch (error) {
      alert("Error submitting review");
    } finally {
      setLoading(false);
    }
  };

  // Handle booking
  const handleBooking = () => {
    navigate(`/booking/${id}`); // Navigate to the booking page with the service ID
  };

  return (
    <>
      <Navbar />
      <div className="book-service-container">
        <div className="rating-title">Rate your service experience</div>
        <div className="star-rating">
          {[...Array(5)].map((_, index) => {
            const currentRating = index + 1;
            return (
              <FaStar
                key={index}
                size={30}
                className={`star ${currentRating <= (hover || rating) ? "active" : ""}`}
                onClick={() => setRating(currentRating)}
                onMouseEnter={() => setHover(currentRating)}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </div>

        <textarea
          className="textarea"
          rows="4"
          placeholder="Write your review..."
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>

        <div className="button-container">
          <button className="submit-button" onClick={handleSubmit} disabled={loading}>
            {loading ? "Submitting..." : "Submit Review"}
          </button>
          <button className="book-button" onClick={handleBooking}>
            Book Service
          </button>
        </div>

        <div className="reviews-title">Customer Reviews</div>
        <hr />
        <div className="reviews-container">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <div key={review._id} className="review-item">
                <img 
                  src={review.userId?.profileImagePath 
                        ? `http://localhost:3001/${review.userId.profileImagePath}` 
                        : "/default-avatar.png"} 
                  alt={`${review.userId?.firstName || "User"} ${review.userId?.lastName || ""}`} 
                  className="profile-image" 
                />
                <div className="review-text">
                  <div className="user-name">
                    {review.userId?.firstName} {review.userId?.lastName}
                  </div>
                  <div className="review-content">{review.review}</div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-reviews">No reviews yet.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookService;
