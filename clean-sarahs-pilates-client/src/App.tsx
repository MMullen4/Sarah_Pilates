import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import RouteSEO from "./components/RouteSEO";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import About from "./pages/About";
import Schedule from "./pages/Schedule";
import Services from "./pages/Services";
import Contact from "./pages/Contact";

const App: React.FC = () => {
  const [bookingReady, setBookingReady] = React.useState(false); // State to track if the booking component is ready
  return (
    <div className="site-shell min-h-screen">
      <RouteSEO />
      <Navbar bookingReady={bookingReady} />

      {/* Toaster must NOT be inside <Routes> */}
      <Toaster position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route
          path="/schedule"
          element={<Schedule onBookingReadyChange={setBookingReady} />}
        />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </div>
  );
};

export default App;
