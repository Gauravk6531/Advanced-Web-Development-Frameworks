function Header({ name, themeColor, isDarkMode, onToggleTheme }) {
  return (
    <header
      style={{
        backgroundColor: themeColor,
        color: "white",
        padding: "20px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1>{name}</h1>
          <p>AI & Machine Learning Student</p>
        </div>

        <button
          onClick={onToggleTheme}
          style={{
            padding: "8px 12px",
            borderRadius: "999px",
            border: "1px solid white",
            background: "transparent",
            color: "white",
            cursor: "pointer",
          }}
        >
          {isDarkMode ? "?? Light" : "?? Dark"}
        </button>
      </div>
    </header>
  );
}

export default Header;