function Navbar({ activeSection }) {
  const sections = ["About", "Skills", "Projects", "Footer"];

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
      {sections.map((section) => (
        <a
          key={section}
          href={`#${section.toLowerCase()}`}
          style={{
            color: activeSection === section ? "yellow" : "white",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          {section}
        </a>
      ))}
    </nav>
  );
}

export default Navbar;