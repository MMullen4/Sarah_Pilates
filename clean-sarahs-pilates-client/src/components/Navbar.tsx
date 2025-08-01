import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, REGISTER_USER } from "../graphql/mutations";

const Navbar: React.FC = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );

  const [loginUser] = useMutation(LOGIN_USER);
  const [registerUser] = useMutation(REGISTER_USER);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Always build the input object
      const input = {
        email: form.email,
        password: form.password,
        ...(isRegistering && { username: form.username }),
      };

      console.log("Sending auth variables:", input);

      const response = await (isRegistering
        ? registerUser({ variables: { input } })
        : loginUser({ variables: { input } }));

      console.log("Full mutation response:", response);

      const authData = isRegistering
        ? response.data?.register
        : response.data?.login;

      if (!authData || !authData.token) {
        console.error("❌ Token not returned by GraphQL mutation");
        return;
      }

      localStorage.setItem("token", authData.token);
      console.log("✅ Stored token:", authData.token);
      setToken(authData.token);

      setForm({ username: "", email: "", password: "" });
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-orange-600">
          Pilates With Sarah
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

        <div className="ml-6">
          {token ? (
            <button
              onClick={handleLogout}
              className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
            >
              Logout
            </button>
          ) : (
            <form onSubmit={handleAuth} className="flex items-center space-x-2">
              {isRegistering && (
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="border p-1 rounded"
                />
              )}
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Email"
                required
                className="border p-1 rounded"
              />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Password"
                required
                className="border p-1 rounded"
              />
              <button
                type="submit"
                className="bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
              >
                {isRegistering ? "Sign Up" : "Login"}
              </button>
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                className="text-sm underline text-blue-600 hover:text-blue-800"
              >
                {isRegistering ? "Switch to Login" : "Switch to Sign Up"}
              </button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
