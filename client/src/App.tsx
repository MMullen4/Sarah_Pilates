import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Studio from "./pages/Studio";
import Schedule from "./pages/Schedule";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

const App: React.FC = () => {
  return (
    <>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |
        <Link to="/studio">Studio</Link> | <Link to="/schedule">Schedule</Link>{" "}
        |<Link to="/services">Services</Link> |{" "}
        <Link to="/contact">Contact</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
};

export default App;
