import { NavLink } from "react-router-dom";

function Navbar() {
  const links = [
    { to: "/", label: "Home" },
    { to: "/projects", label: "Projects" },
    { to: "/contact", label: "Contact" },
    { to: "/tasks", label: "Tasks" }   // <-- Add this
  ];

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        background: "#333",
        padding: "10px",
      }}
    >
      {links.map((link) => (
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
    </nav>
  );
}

export default Navbar;