import "./App.css";

import Header from "./components/Header";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Skills from "./components/Skills";
import Projects from "./components/Projects";
import Footer from "./components/Footer";

function App() {
  const skills = [
    "React",
    "JavaScript",
    "Python",
    "Machine Learning",
    "SQL",
    "Git",
  ];

  return (
    <>
      <Header
        name="Kolhe Gaurav"
        themeColor="teal"
      />

      <Navbar activeSection="About" />

      <About college="CHARUSAT University" />

      <Skills skillList={skills} />

      <Projects />

      <Footer email="gaurav@example.com" />
    </>
  );
}

export default App;