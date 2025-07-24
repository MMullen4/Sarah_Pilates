import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/studio", label: "Studio" },
    { path: "/schedule", label: "Schedule" },
    { path: "/services", label: "Services" },
    { path: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="text-xl font-bold text-orange-600">
          <Link to="/">Sarah's Pilates</Link>
        </div>
        <ul className="hidden md:flex space-x-6">
          {navLinks.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                className={\`\${location.pathname === path ? "font-bold text-orange-600" : "text-gray-700"} hover:text-orange-500 transition\`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)} className="text-gray-700">
            ☰
          </button>
        </div>
      </div>
      {menuOpen && (
        <ul className="md:hidden px-4 pb-4 space-y-2 bg-white">
          {navLinks.map(({ path, label }) => (
            <li key={path}>
              <Link
                to={path}
                onClick={() => setMenuOpen(false)}
                className={\`\${location.pathname === path ? "font-bold text-orange-600" : "text-gray-700"} block py-2 px-2 rounded hover:bg-orange-100\`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
