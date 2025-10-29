import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, REGISTER_USER } from "../graphql/mutations";

const Navbar: React.FC = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [loginUser] = useMutation(LOGIN_USER);
  const [registerUser] = useMutation(REGISTER_USER);

  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");
    if (message) {
      alert(message);
      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input = {
        email: form.email,
        password: form.password,
        ...(isRegistering && { username: form.username }),
      };

      const response = await (isRegistering
        ? registerUser({ variables: { input } })
        : loginUser({ variables: { input } }));

      const authData = isRegistering
        ? response.data?.register
        : response.data?.login;

      if (!authData || !authData.token) {
        console.error("❌ Token not returned by GraphQL mutation");
        return;
      }

      localStorage.setItem("token", authData.token);
      localStorage.setItem(
        "welcomeMessage",
        `✅ Welcome ${authData.user.username || authData.user.email}!`
      );
      setToken(authData.token);
      setForm({ username: "", email: "", password: "" });
      window.location.reload();
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow-md px-4 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center">
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="text-xl md:text-2xl font-bold text-orange-600"
            >
              Pilates With Sarah
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden text-gray-700 text-2xl"
            >
              ☰
            </button>
          </div>

          {/* Navigation and Auth - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
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
                <Link
                  to="/schedule"
                  className="hover:text-orange-600 transition"
                >
                  Schedule
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="hover:text-orange-600 transition"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-orange-600 transition"
                >
                  Contact
                </Link>
              </li>
            </ul>

            {token ? (
              <button
                onClick={handleLogout}
                className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
              >
                Logout
              </button>
            ) : (
              <form
                onSubmit={handleAuth}
                className="flex flex-wrap items-center gap-2"
              >
                {isRegistering && (
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Username"
                    required
                    className="border p-1 rounded text-sm"
                  />
                )}
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
                  className="border p-1 rounded text-sm"
                />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="border p-1 rounded text-sm"
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700 text-sm"
                >
                  {isRegistering ? "Sign Up" : "Login"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegistering(!isRegistering)}
                  className="text-xs underline text-blue-600 hover:text-blue-800"
                >
                  {isRegistering ? "Switch to Login" : "Switch to Sign Up"}
                </button>
              </form>
            )}
          </div>

          {/* Mobile/Tablet Menu */}
          {(isMobileMenuOpen || window.innerWidth < 1024) && (
            <div className="lg:hidden mt-4 space-y-4">
              <ul className="grid grid-cols-2 gap-2 text-center">
                <li>
                  <Link to="/" className="block py-2 hover:text-orange-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="block py-2 hover:text-orange-600"
                  >
                    About
                  </Link>
                </li>
                <li>
                  <Link
                    to="/studio"
                    className="block py-2 hover:text-orange-600"
                  >
                    Studio
                  </Link>
                </li>
                <li>
                  <Link
                    to="/schedule"
                    className="block py-2 hover:text-orange-600"
                  >
                    Schedule
                  </Link>
                </li>
                <li>
                  <Link
                    to="/services"
                    className="block py-2 hover:text-orange-600"
                  >
                    Services
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="block py-2 hover:text-orange-600"
                  >
                    Contact
                  </Link>
                </li>
              </ul>

              {token ? (
                <button
                  onClick={handleLogout}
                  className="w-full bg-orange-600 text-white py-2 rounded"
                >
                  Logout
                </button>
              ) : (
                <form onSubmit={handleAuth} className="space-y-2">
                  {isRegistering && (
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      placeholder="Username"
                      required
                      className="w-full border p-2 rounded"
                    />
                  )}
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Email"
                    required
                    className="w-full border p-2 rounded"
                  />
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Password"
                    required
                    className="w-full border p-2 rounded"
                  />
                  <button
                    type="submit"
                    className="w-full bg-orange-600 text-white py-2 rounded hover:bg-orange-700"
                  >
                    {isRegistering ? "Sign Up" : "Login"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRegistering(!isRegistering)}
                    className="w-full text-sm underline text-blue-600 hover:text-blue-800"
                  >
                    {isRegistering ? "Switch to Login" : "Switch to Sign Up"}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
