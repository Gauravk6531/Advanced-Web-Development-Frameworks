import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Projects from "./components/Projects";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const rootElement = document.getElementById("root");

    if (rootElement) {
      rootElement.classList.toggle("theme-dark", isDarkMode);
      rootElement.classList.toggle("theme-light", !isDarkMode);
    }
  }, [isDarkMode]);

  return (
    <>
      <Header
        name="Kolhe Gaurav"
        themeColor={isDarkMode ? "#2b2b2b" : "teal"}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode((prev) => !prev)}
      />
      <Navbar />

      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer email="gauravkolhe019@google.com" />
    </>
  );
}

export default App;