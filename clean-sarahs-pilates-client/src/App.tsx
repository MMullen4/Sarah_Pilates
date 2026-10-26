import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import About from "./pages/About";
import Studio from "./pages/Studio";
import Schedule from "./pages/Schedule";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

const App: React.FC = () => {
  return (
    <div className="site-shell min-h-screen">
      <Navbar />

      {/* Toaster must NOT be inside <Routes> */}
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/studio" element={<Studio />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
};

export default App;
