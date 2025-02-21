import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import {
  Card,
  CardContent,
  Typography,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Avatar,
  Grid,
  Button,
} from "@mui/material";
import { Link } from "react-router-dom";
import AdminNavbar from "../components/AdminNavbar"; // Import the Admin Navbar
import "../styles/Admin.scss";

const AdminPage = () => {
  const token = useSelector((state) => state.token);
  const [profiles, setProfiles] = useState([]);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, [filter]);

  const fetchProfiles = async () => {
    const url = filter
      ? `http://localhost:3001/api/admin/listings/filter/${filter}`
      : "http://localhost:3001/api/admin/listings";
    try {
      const { data } = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfiles(data);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleAvailability = async (id, available) => {
    try {
      await axios.post(
        `http://localhost:3001/api/admin/listings/${id}/availability`,
        { available: !available },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProfiles();
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  return (
    <>
      {/* Admin Navbar */}
      <AdminNavbar />

      <Box sx={{ p: 3 }}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Filter Listings</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Filter Listings"
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="denied">Denied</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <Grid container spacing={3}>
          {profiles.map((profile) => (
            <Grid item xs={12} sm={6} md={4} key={profile._id}>
              <Link to={`/listings/${profile._id}`} style={{ textDecoration: "none" }}>
                <Card sx={{ height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>
                  <CardContent sx={{ flexGrow: 1, textAlign: "center" }}>
                    <Avatar
                      src={
                        profile.user.profileImagePath.includes("http")
                          ? profile.user.profileImagePath
                          : `http://localhost:3001/${profile.user.profileImagePath}`
                      }
                      alt={profile.user.fullName}
                      sx={{ width: 80, height: 80, mx: "auto", mb: 2 }}
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <Typography variant="h6">{profile.user.fullName}</Typography>
                    <Typography variant="body2">{profile.user.address}</Typography>
                    <Typography sx={{ mt: 1, color: "gray" }}>
                      Status: <strong>{profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}</strong>
                    </Typography>
                  </CardContent>

                  {/* Availability Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents the click from bubbling to the Link
                      e.preventDefault();  // Prevents default navigation behavior
                      handleAvailability(profile._id, profile.available);
                    }}
                    sx={{
                      position: "absolute",
                      bottom: "10px",
                      left: "10px",
                      fontSize: "12px",
                      borderRadius: "8px",
                      background: profile.available ? "green" : "red",
                      color: "white",
                      "&:hover": {
                        background: profile.available ? "#006400" : "#8B0000",
                      },
                    }}
                  >
                    {profile.available ? "Available" : "Unavailable"}
                  </Button>
                </Card>
              </Link>
            </Grid>
          ))}
        </Grid>
      </Box>
    </>
  );
};

export default AdminPage;
