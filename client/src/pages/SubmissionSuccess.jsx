import React from 'react';
import { useNavigate } from 'react-router-dom';
import "../styles/SubmissionSuccess.scss";

const SubmissionSuccess = () => {
  const navigate = useNavigate();

  return (
    <div className="submission-success">
      <div className="success-banner">
        <h1>Thank You! 🎉</h1>
        <p>Your application has been submitted successfully!</p>
        <img 
  src="/assets/successapply.jpg" 
  alt="Success" 
  className="success-image" 
/>
        <h3>Good Luck with Your Career Journey!</h3>
      </div>

      <div className="info-section">
        <p>
          Our team will review your application shortly. Once verified, you will receive a confirmation email with further details.
        </p>
        <p>If you have any queries, feel free to contact us <a>sreesaienterprisespttk@gmail.com</a>.</p>
      </div>
      <button 
        className="home-btn"
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>
    </div>
  );
};

export default SubmissionSuccess;
