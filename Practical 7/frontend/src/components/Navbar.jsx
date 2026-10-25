import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const baseLinks = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" }
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "#333",
        padding: "10px 20px",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        {baseLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            style={({ isActive }) => ({
              color: isActive ? "#ffd700" : "white",
              textDecoration: "none",
              fontWeight: "bold",
            })}
          >
            {link.label}
          </NavLink>
        ))}
        {isAuthenticated && (
          <NavLink
            to="/tasks"
            style={({ isActive }) => ({
              color: isActive ? "#ffd700" : "white",
              textDecoration: "none",
              fontWeight: "bold",
            })}
          >
            Tasks
          </NavLink>
        )}
      </div>

      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
        {isAuthenticated ? (
          <>
            <span style={{ color: "white", fontSize: "14px" }}>
              Welcome, <strong>{user?.email}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 12px",
                borderRadius: "4px",
                border: "1px solid #ffd700",
                backgroundColor: "#d33",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink
              to="/login"
              style={({ isActive }) => ({
                color: isActive ? "#ffd700" : "white",
                textDecoration: "none",
                fontWeight: "bold",
              })}
            >
              Login
            </NavLink>
            <NavLink
              to="/register"
              style={({ isActive }) => ({
                color: isActive ? "#ffd700" : "white",
                textDecoration: "none",
                fontWeight: "bold",
              })}
            >
              Register
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;