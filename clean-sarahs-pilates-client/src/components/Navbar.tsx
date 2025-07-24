import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-orange-600">
          Sarah's Pilates
        </Link>
        <ul className="flex space-x-6 text-gray-700 font-medium">
          <li>
            <Link to="/" className="hover:text-orange-600 transition">
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-orange-600 transition">
              About
            </Link>
          </li>
          <li>
            <Link to="/studio" className="hover:text-orange-600 transition">
              Studio
            </Link>
          </li>
          <li>
            <Link to="/schedule" className="hover:text-orange-600 transition">
              Schedule
            </Link>
          </li>
          <li>
            <Link to="/services" className="hover:text-orange-600 transition">
              Services
            </Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-orange-600 transition">
              Contact
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
