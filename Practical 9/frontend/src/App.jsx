import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Header from "./components/Header";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Skills from "./components/Skills";
import NotFound from "./components/NotFound";
import Footer from "./components/Footer";

const Projects = lazy(() => import("./pages/Projects"));
const Contact = lazy(() => import("./components/Contact"));
const Tasks = lazy(() => import("./pages/Tasks"));

function App() {
  return (
    <>
      <Header name="Kolhe Gaurav" themeColor="teal" />
      <Navbar />

      <main style={{ padding: "20px" }}>
        <Suspense
          fallback={
            <div className="route-loading" role="status" aria-live="polite">
              <span className="route-loading__spinner" aria-hidden="true" />
              Loading page...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/tasks" element={<Tasks />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>

      <Footer email="gauravkolhe019@google.com" />
    </>
  );
}

export default App;