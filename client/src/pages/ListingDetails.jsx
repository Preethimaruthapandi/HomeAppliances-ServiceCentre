import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { categories } from "../data";
import AdminNavbar from "../components/AdminNavbar"; 
import "../styles/ListingDetails.scss";

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.token);//get token from redux store
  const [profile, setProfile] = useState(null);
  const [place, setPlace] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isDenied, setIsDenied] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isReApprove, setIsReApprove] = useState(false); // New state for re-approve form

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await axios.get(`http://localhost:3001/api/admin/listings/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include token in the Authorization header
        },
      });
      setProfile(data);
      setSelectedCategories(data.categories || []);
      setPlace(data.place || "");
      setIsDenied(data.status === "denied");
      setIsApproved(data.status === "approved");
      setIsPending(data.status === "pending");
      setIsReApprove(data.status === "denied"); // Mark re-approve if status is denied
    } catch (error) {
      console.error("Error fetching profile details:", error);
      if (error.response?.status === 403) {
        alert("Access denied. Please log in as an admin.");
        navigate("/login");
      }
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.find((c) => c.label === category.label)
        ? prev.filter((c) => c.label !== category.label)
        : [...prev, category]
    );
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files.length + uploadedPhotos.length > 5) {
      alert("You can upload up to 5 photos only.");
      return;
    }
    setUploadedPhotos([...uploadedPhotos, ...Array.from(e.target.files)]);
  };

  const handleRemovePhoto = (index) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (status) => {
    const formData = new FormData();
    formData.append("status", status);

    if (status !== "denied") {
      formData.append("place", place);
    } else {
      formData.append("place", null); // For denied, set place to null
    }

    formData.append("categories", JSON.stringify(selectedCategories));
    uploadedPhotos.forEach((photo) => formData.append("photos", photo));

    try {
      const response = await axios.post(
        `http://localhost:3001/api/admin/listings/${id}/status`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // Include token in the Authorization header
          },
        }
      );
      alert(`Listing has been ${status}.`);
      navigate("/admin");
    } catch (error) {
      console.error("Error updating listing:", error);
      alert("Error: " + (error.response?.data?.message || "Unknown error"));
    }
  };

  if (!profile) {
    return <div className="loading-text">Loading...</div>;
  }

  return (
    <div>
      <AdminNavbar />
    <div className="listing-details-container">
      
      <div className="profile-card">
        <img
          className="profile-avatar"
          src={`http://localhost:3001/${profile.user.profileImagePath}`}
          alt={profile.fullName}
        />
        <h2 className="profile-name">{profile.fullName}</h2>
        <p className="profile-email">{profile.email}</p>
      </div>

      <div className="details-section">
        <h2 className="section-title">Details</h2>
        <p><strong>Address:</strong></p>
        <p>{profile.address}</p>
        <hr />
        <p><strong>Phone:</strong></p> 
        <p>{profile.phoneNumber}</p>
        <hr />
        <p><strong>Email:</strong></p> 
        <p>{profile.email}</p>
        <hr />
        <p><strong>Date of Birth: </strong>{new Date(profile.dateOfBirth).toLocaleDateString()}</p>
        <hr />
        <p><strong>Educational Qualifications:</strong></p> 
        <p>{profile.educationalQualifications}</p>
        <hr />
        <p><strong>Key Skills:</strong></p> 
        <p>{profile.keySkills}</p>
        <hr />
        <p><strong>Work Experience:</strong></p> 
        <p>{profile.workExperience}</p>
        <hr />
      </div>

      <div className="files-section">
        <h2 className="section-title">Files</h2>
        {[{ label: "Degree Certificate", path: profile.degreeCertificate },
          { label: "Experience Certificate", path: profile.experienceCertificate },
          profile.serviceReports && { label: "Service Report", path: profile.serviceReports }, // Handle single file path
          ...(profile.technicalCertifications || []).map((filePath, i) => ({ label: `Technical Certification ${i + 1}`, path: filePath })),
        ]
          .filter(Boolean) // Filter out any null or undefined values
          .map((file, index) => (
            <a
              className="file-link"
              key={index}
              href={`http://localhost:3001/uploads/${file.path.split("\\").pop()}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {file.label}
            </a>
          ))}
      </div>

      <div className="approval-section">
        {isPending && (
          <>
            <textarea
              className="place-input"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Enter place"
            ></textarea>

            <h2 className="section-title">Select Categories</h2>
            <div className="categories-container">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`category-card ${selectedCategories.find((c) => c.label === category.label) ? "selected" : ""}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span>{category.label}</span>
                </div>
              ))}
            </div>

            <h2 className="section-title">Upload Photos</h2>
            <div className="uploaded-photos-grid">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="photo-container">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Uploaded ${index}`}
                    className="uploaded-photo"
                  />
                  <button
                    className="remove-photo-button"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <label className="upload-photo-box">
                <span>Upload from your device</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  hidden
                />
              </label>
            </div>

            <div className="action-buttons">
              <button className="approve-button" onClick={() => handleSubmit("approved")}>Approve</button>
              <button className="deny-button" onClick={() => handleSubmit("denied")}>Deny</button>
            </div>
          </>
        )}

        {isApproved && (
          <div className="action-buttons">
            <button className="deny-button" onClick={() => handleSubmit("denied")}>Deny</button>
          </div>
        )}

        {isDenied && isReApprove && (
          <div className="approval-reform-section">
            <h2 className="section-title">Re-Approve Listing</h2>
            <textarea
              className="place-input"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Enter place"
            ></textarea>

            <h2 className="section-title">Select Categories</h2>
            <div className="categories-container">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className={`category-card ${selectedCategories.find((c) => c.label === category.label) ? "selected" : ""}`}
                  onClick={() => handleCategoryChange(category)}
                >
                  <span className="category-icon">{category.icon}</span>
                  <span>{category.label}</span>
                </div>
              ))}
            </div>

            <h2 className="section-title">Upload Photos</h2>
            <div className="uploaded-photos-grid">
              {uploadedPhotos.map((photo, index) => (
                <div key={index} className="photo-container">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Uploaded ${index}`}
                    className="uploaded-photo"
                  />
                  <button
                    className="remove-photo-button"
                    onClick={() => handleRemovePhoto(index)}
                  >
                    🗑️
                  </button>
                </div>
              ))}
              <label className="upload-photo-box">
                <span>Upload from your device</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  hidden
                />
              </label>
            </div>

            <div className="action-buttons">
              <button className="approve-button" onClick={() => handleSubmit("approved")}>Re-Approve</button>
              <button className="deny-button" onClick={() => handleSubmit("denied")}>Deny Again</button>
            </div>
          </div>
        )}
      </div>
      
    </div>
    </div>
  );
};

export default ListingDetails;
