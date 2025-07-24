import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

// Dummy pages for now — we’ll build them next
const Home = () => (
  <div className="p-10 text-center text-2xl">Welcome to Sarah's Pilates!</div>
);
const About = () => <div className="p-10 text-center text-2xl">About Us</div>;
const Studio = () => (
  <div className="p-10 text-center text-2xl">Our Studio</div>
);
const Schedule = () => (
  <div className="p-10 text-center text-2xl">Schedule a Class</div>
);
const Services = () => (
  <div className="p-10 text-center text-2xl">Our Services</div>
);
const Contact = () => (
  <div className="p-10 text-center text-2xl">Contact Us</div>
);

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

