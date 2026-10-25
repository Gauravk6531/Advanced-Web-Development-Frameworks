function Header({ name, themeColor }) {
  return (
    <header
      style={{
        backgroundColor: themeColor,
        color: "white",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <h1>{name}</h1>
      <p>AI & Machine Learning Student</p>
    </header>
  );
}

export default Header;