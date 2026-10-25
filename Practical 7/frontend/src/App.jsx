import { Routes, Route } from "react-router-dom";
import "./App.css";
import Projects from "./pages/Projects";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";
import Tasks from "./pages/Tasks";
import Login from "./components/Login";
import Register from "./components/Register";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Header name="Kolhe Gaurav" themeColor="teal" />
      <Navbar />

      <main style={{ padding: "20px" }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/tasks" element={<Tasks />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer email="gauravkolhe019@google.com" />
    </AuthProvider>
  );
}

export default App;