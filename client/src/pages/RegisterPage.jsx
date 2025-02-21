import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Register.scss";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    role: "user", // Default role is user
  });

  const [tooltipMessage, setTooltipMessage] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipType, setTooltipType] = useState("error"); // "error" or "success"
  const [passwordMatch, setPasswordMatch] = useState(true);

  const navigate = useNavigate();

  // Update password match state on every change
  useEffect(() => {
    setPasswordMatch(
      formData.password === formData.confirmPassword || formData.confirmPassword === ""
    );
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: name === "profileImage" ? files[0] : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const registerForm = new FormData();

      for (const key in formData) {
        registerForm.append(key, formData[key]);
      }

      const response = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        body: registerForm,
      });

      if (response.ok) {
        setTooltipType("success");
        setTooltipMessage("Registration successful!");
        setShowTooltip(true);

        setTimeout(() => {
          setShowTooltip(false);
          navigate("/login");
        }, 3000); // Tooltip disappears after 3 seconds, then navigates
      } else {
        const errorData = await response.json();
        setTooltipType("error");
        setTooltipMessage(errorData.message || "Registration failed.");
        setShowTooltip(true);

        setTimeout(() => setShowTooltip(false), 3000); // Tooltip disappears after 3 seconds
      }
    } catch (err) {
      setTooltipType("error");
      setTooltipMessage("An error occurred. Please try again.");
      setShowTooltip(true);

      setTimeout(() => setShowTooltip(false), 3000);
    }
  };

  return (
    <div className="register">
      <div className="register_content">
        <form className="register_content_form" onSubmit={handleSubmit}>
          <input
            placeholder="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            placeholder="Password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
          <input
            placeholder="Confirm Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            type="password"
            required
          />
          {!passwordMatch && (
            <p style={{ color: "red" }}>Passwords do not match!</p>
          )}

          <input
            id="image"
            type="file"
            name="profileImage"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleChange}
            required
          />
          <label htmlFor="image" className="upload-label">
            <img src="/assets/addImage.png" alt="add profile photo" />
            <p>Upload Your Photo</p>
          </label>

          {formData.profileImage && (
            <img
              src={URL.createObjectURL(formData.profileImage)}
              alt="profile preview"
              style={{ maxWidth: "80px", borderRadius: "50%", marginTop: "10px" }}
            />
          )}


          <button type="submit" disabled={!passwordMatch}>
            REGISTER
          </button>
        </form>
        <a href="/login">Already have an account? Log In Here</a>
      </div>

      {/* Tooltip for error or success messages */}
      {showTooltip && (
        <div
          className={`tooltip ${
            tooltipType === "success" ? "tooltip-success" : "tooltip-error"
          }`}
        >
          {tooltipMessage}
        </div>
      )}
    </div>
  );
};

export default RegisterPage;
