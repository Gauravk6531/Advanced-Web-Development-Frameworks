function Footer({ email }) {
  return (
    <footer
      id="footer"
      style={{
        background: "#222",
        color: "white",
        padding: "15px",
        textAlign: "center",
      }}
    >
      <p>Email: {email}</p>

      <p>© 2026 Student Portfolio</p>
    </footer>
  );
}

export default Footer;