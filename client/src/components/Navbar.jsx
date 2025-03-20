import { IconButton } from "@mui/material";
import { Search, Person, Menu } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import "../styles/Navbar.scss";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";

const Navbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const [search, setSearch] = useState(""); // State for search input
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dropdownRef = useRef(null); // Ref for the dropdown menu
  const dropdownButtonRef = useRef(null); // Ref for the dropdown button

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) && 
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setDropdownMenu(false); // Close dropdown if clicked outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Function to handle search and redirect to the category page
  const handleSearch = () => {
    if (search.trim()) {
      const formattedSearch = encodeURIComponent(search.trim().toLowerCase()); // Case-insensitive & URL safe
      navigate(`/experts/category/${formattedSearch}`);
    }
  };
  

  return (
    <div className="navbar">
      <a href="/">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      <div className="navbar_search">
        <input
          type="text"
          placeholder="Search Categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <IconButton disabled={search === ""} onClick={handleSearch}>
          <Search sx={{ color: variables.pinkred }} />
        </IconButton>
      </div>

      <div className="navbar_right">
        {user ? (
          <a href="/create-listing" className="host">
            Publish your service profile
          </a>
        ) : (
          <a href="/login" className="host">
            Publish your service profile
          </a>
        )}

        <button
          ref={dropdownButtonRef} 
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            <img
              src={`http://localhost:3001/${user.profileImagePath}`}
              alt="profile photo"
              style={{ objectFit: "cover", borderRadius: "50%" }}
            />
          )}
        </button>

        {dropdownMenu && (
          <div className="navbar_right_accountmenu" ref={dropdownRef}>
            {!user ? (
              <>
                <Link to="/login">Log In</Link>
                <Link to="/register">Sign Up</Link>
              </>
            ) : (
              <>
                <Link to={`/${user._id}/wishList`}>Wish List ❤️</Link>
                <Link to={`/${user._id}/bookinglist`}>Booking List 💌</Link>
                <Link to="/create-listing">Publish your service profile ✨</Link>
                <Link to="/">Home 🍁</Link>

                <Link
                  to="/login"
                  onClick={() => {
                    dispatch(setLogout());
                  }}
                >
                  Log Out 📤
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
