import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import "../styles/CreateListing.scss";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CreateListing = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    educationalQualifications: '',
    workExperience: '',
    keySkills: '',
    userQuery: '',
  });

  const [files, setFiles] = useState({
    degreeCertificate: null,
    technicalCertifications: [],
    experienceCertificate: null,
    serviceReports: null,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const token = useSelector((state) => state.token); // Get token from Redux store

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;

    if (name === 'technicalCertifications') {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: [...prevFiles[name], ...Array.from(uploadedFiles)],
      }));
    } else {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: uploadedFiles[0],
      }));
    }
  };

  const handleRemoveFile = (name, index = null) => {
    if (index !== null) {
      setFiles((prevFiles) => ({
        ...prevFiles,
        [name]: prevFiles[name].filter((_, i) => i !== index),
      }));
    } else {
      setFiles((prevFiles) => ({ ...prevFiles, [name]: null }));
    }
  };

  const checkEligibility = async () => {
    if (!token) {
      alert("You must be logged in to submit this form.");
      return false;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.id || decodedToken._id;

      const response = await fetch(`http://localhost:3001/api/listings/check-submission/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {            
        return true; // Eligible to submit
      } else {
        const result = await response.json();
        alert(result.message || "You are not eligible to submit a new application yet, Try six months after from the date of your last application.");
        return false;
      }
    } catch (error) {
      console.error("Error checking submission eligibility:", error);
      alert("An error occurred while checking your eligibility. Please try again.");
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check submission eligibility
    const isEligible = await checkEligibility();
    if (!isEligible) return;

    // Validate Mobile Number
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      alert('Invalid phone number. It must be 10 digits.');
      return;
    }

    // Validate Date of Birth (Age > 20)
    const birthDate = new Date(formData.dateOfBirth);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const ageMonthCheck = new Date().getMonth() - birthDate.getMonth();
    if (age < 20 || (age === 20 && ageMonthCheck < 0)) {
      alert('Invalid date of birth. Age must be above 20.');
      return;
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      alert('Please enter a valid email address.');
      return;
    }

    // Check if required files are present
    if (!files.degreeCertificate) {
      alert('Degree Certificate is required.');
      return;
    }

    if (!files.experienceCertificate) {
      alert('Experience Certificate is required.');
      return;
    }

    if (!files.serviceReports) {
      alert('Service Report is required.');
      return;
    }

    // Prepare FormData
    const data = new FormData();
    Object.keys(formData).forEach((key) => data.append(key, formData[key]));

    // Dynamically append files
    const fileFields = [
      { key: 'degreeCertificate', file: files.degreeCertificate },
      { key: 'experienceCertificate', file: files.experienceCertificate },
      { key: 'technicalCertifications', files: files.technicalCertifications },
      { key: 'serviceReports', file: files.serviceReports },
    ];

    fileFields.forEach(({ key, file, files }) => {
      if (file) {
        data.append(key, file);
      } else if (Array.isArray(files) && files.length > 0) {
        files.forEach((file) => data.append(key, file));
      }
    });

    try {
      const response = await fetch("http://localhost:3001/api/listings", {
        method: "POST",
        body: data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (response.ok) {
        alert("Application submitted successfully!");
        navigate("/submission-success");
      } else {
        console.log("Error submitting form:", result.message);
        alert(result.message || "Failed to submit the form.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("An error occurred while submitting the form. Please try again.");
    }
  };
  


  return (
    <>
    <Navbar />
    <div className="create-listing">
    <h1 style={{ color: '#F8395A', textAlign: 'center' }}>List Yourself as a Service Expert</h1>

{!isSubmitted ? (
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* Personal Details Section */}
        <div className="form-section">
          <label className="section-title">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            required
          />
        </div>

        <div className="form-section">
          <label className="section-title">Address (Must currently reside in Madurai)</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter your address"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="form-section">
          <label className="section-title">Phone Number</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            required
          />
        </div>

        <div className="form-section">
          <label className="section-title">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="form-section">
          <label className="section-title">Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-section">
          <label className="section-title">Educational Qualifications</label>
          <textarea
            name="educationalQualifications"
            value={formData.educationalQualifications}
            onChange={handleInputChange}
            placeholder="List your qualifications"
            rows="3"
            required
          ></textarea>
        </div>

        <div className="form-section">
          <label className="section-title">Work Experience</label>
          <textarea
            name="workExperience"
            value={formData.workExperience}
            onChange={handleInputChange}
            placeholder="Describe your experience"
            rows="3"
          ></textarea>
        </div>

        <div className="form-section">
          <label className="section-title">Key Skills</label>
          <textarea
            name="keySkills"
            value={formData.keySkills}
            onChange={handleInputChange}
            placeholder="List your key skills"
            rows="3"
          ></textarea>
        </div>

       {/* Degree Certificate */}
<div className="form-section">
  <label className="section-title">Degree Certificate</label>
  <div className="file-upload">
    <label htmlFor="degreeCertificate" className="upload-label">
      <i className="upload-icon fas fa-cloud-upload-alt"></i>
      <span className="upload-text">Upload File</span>
    </label>
    <input
      id="degreeCertificate"
      type="file"
      name="degreeCertificate"
      onChange={handleFileChange}
      accept=".pdf,.jpg,.png"
      className="hidden-input"
    />
  </div>
  {files.degreeCertificate && (
    <div className="file-preview-box">
      <span className="file-name">{files.degreeCertificate.name}</span>
      <button
        className="remove-btn"
        onClick={() => handleRemoveFile('degreeCertificate')}
      >
        ✖
      </button>
    </div>
  )}
</div>

{/* Technical Certifications */}
<div className="form-section">
  <label className="section-title">Technical Certifications (if any)</label>
  <div className="file-upload">
    <label htmlFor="technicalCertifications" className="upload-label">
      <i className="upload-icon fas fa-cloud-upload-alt"></i>
      <span className="upload-text">Upload Files</span>
    </label>
    <input
      id="technicalCertifications"
      type="file"
      name="technicalCertifications"
      onChange={handleFileChange}
      accept=".pdf,.jpg,.png"
      multiple
      className="hidden-input"
    />
  </div>
  <div className="file-preview-list">
    {files.technicalCertifications.map((file, index) => (
      <div key={index} className="file-preview-box">
        <span className="file-name">{file.name}</span>
        <button
          className="remove-btn"
          onClick={() => handleRemoveFile('technicalCertifications', index)}
        >
          ✖
        </button>
      </div>
    ))}
  </div>
</div>

{/* Experience Certificate */}
<div className="form-section">
  <label className="section-title">Experience Certificate</label>
  <div className="file-upload">
    <label htmlFor="experienceCertificate" className="upload-label">
      <i className="upload-icon fas fa-cloud-upload-alt"></i>
      <span className="upload-text">Upload File</span>
    </label>
    <input
      id="experienceCertificate"
      type="file"
      name="experienceCertificate"
      onChange={handleFileChange}
      accept=".pdf,.jpg,.png"
      className="hidden-input"
    />
  </div>
  {files.experienceCertificate && (
    <div className="file-preview-box">
      <span className="file-name">{files.experienceCertificate.name}</span>
      <button
        className="remove-btn"
        onClick={() => handleRemoveFile('experienceCertificate')}
      >
        ✖
      </button>
    </div>
  )}
</div>

{/* Service Reports */}
<div className="form-section">
  <label className="section-title">Service Report</label>
  <div className="file-upload">
    <label htmlFor="serviceReports" className="upload-label">
      <i className="upload-icon fas fa-cloud-upload-alt"></i>
      <span className="upload-text">Upload File</span>
    </label>
    <input
      id="serviceReports"
      type="file"
      name="serviceReports"
      onChange={handleFileChange}
      accept=".pdf,.jpg,.png"
      className="hidden-input"
    />
  </div>
  {files.serviceReports && (
    <div className="file-preview-box">
      <span className="file-name">{files.serviceReports.name}</span>
      <button
        className="remove-btn"
        onClick={() => handleRemoveFile('serviceReports')}
      >
        ✖
      </button>
    </div>
  )}
</div>


{/* Submission Message and Query Section */}
<div className="form-section">
  <div className="submission-message">
    <p>
      After your profile is verified by the admin, your profile will be published.
    </p>
  </div>
</div>

{/* Query Section */}
<div className="form-section">
  <label className="section-title">Have Any Queries?</label>
  <textarea
  name="userQuery"
  value={formData.userQuery || ''}
  onChange={handleInputChange}
  placeholder="Enter your queries here..."
  rows="4"
  className="query-textarea"
></textarea>

</div> 


        <button type="submit" className="submit-btn">Create Listing</button>
      </form>
) : null}
    </div>
  
    <Footer />
    </>
     
  );
};

export default CreateListing;
