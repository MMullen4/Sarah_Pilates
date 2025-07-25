import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Page components
import About from "./pages/About";
import Studio from "./pages/Studio";
import Schedule from "./pages/Schedule";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

const Home: React.FC = () => {
  return (
    <div className="p-10 max-w-3xl mx-auto text-center">
      <h1 className="text-4xl font-bold text-orange-600 mb-4">
        Welcome to Pilates With Sarah!
      </h1>
      <p className="text-lg text-gray-700">
        Empower and heal your mind and body through the strength of Pilates. Join us to
        improve posture, flexibility, and overall well-being.
      </p>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
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
