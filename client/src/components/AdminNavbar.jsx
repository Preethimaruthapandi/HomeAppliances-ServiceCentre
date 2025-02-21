import { Home, Logout, Menu } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { setLogout } from "../redux/state";
import { ListAlt } from "@mui/icons-material";
import "../styles/Navbar.scss";

const AdminNavbar = () => {
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !dropdownButtonRef.current.contains(event.target)
      ) {
        setDropdownMenu(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="navbar">
      <a href="/admin">
        <img src="/assets/logo.png" alt="logo" />
      </a>

      <div className="navbar_right">
        <span className="admin-title">Admin Panel</span>

        <button
          ref={dropdownButtonRef}
          className="navbar_right_account"
          onClick={() => setDropdownMenu(!dropdownMenu)}
        >
          <Menu sx={{ color: variables.darkgrey }} />
          <img
            src={`http://localhost:3001/${user?.profileImagePath || "default-avatar.png"}`}
            alt="profile"
            style={{ objectFit: "cover", borderRadius: "50%" }}
          />
        </button>

        {dropdownMenu && (
          <div className="navbar_right_accountmenu" ref={dropdownRef}>
            <Link to="/admin">
              <Home sx={{ marginRight: "5px" }} /> Home
            </Link>

            <Link to="/admin/manage-bookings">
  <ListAlt sx={{ marginRight: "5px" }} /> Manage Bookings
</Link>


            <Link
              to="/login"
              onClick={() => dispatch(setLogout())}
            >
              <Logout sx={{ marginRight: "5px" }} /> Logout
            </Link>

          </div>
        )}
      </div>
    </div>
  );
};

export default AdminNavbar;
