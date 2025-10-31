// src/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_USER, REGISTER_USER } from "../graphql/mutations";

const Navbar: React.FC = () => {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token")
  );
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);

  const [loginUser, { loading: loggingIn }] = useMutation(LOGIN_USER);
  const [registerUser, { loading: registering }] = useMutation(REGISTER_USER);

  // Show one-time welcome message after redirect/reload
  useEffect(() => {
    const message = localStorage.getItem("welcomeMessage");
    if (message) {
      alert(message);
      localStorage.removeItem("welcomeMessage");
    }
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!isMenuOpen) return;
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [isMenuOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const input: any = {
        email: form.email,
        password: form.password,
      };
      if (isRegistering) input.username = form.username;

      const res = await (isRegistering
        ? registerUser({ variables: { input } })
        : loginUser({ variables: { input } }));

      const authData = isRegistering ? res.data?.register : res.data?.login;

      if (!authData?.token) {
        console.error("❌ Token not returned by GraphQL mutation");
        return;
      }

      // Persist auth, set welcome, reset UI
      localStorage.setItem("token", authData.token);
      localStorage.setItem(
        "welcomeMessage",
        `✅ Welcome ${authData.user?.username || authData.user?.email}!`
      );
      setToken(authData.token);
      setForm({ username: "", email: "", password: "" });
      setIsMenuOpen(false); // close dropdown

      // Reload to refresh any auth-gated UI
      window.location.reload();
    } catch (err) {
      console.error("Auth error:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setIsMenuOpen(false);
    window.location.reload();
  };

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="bg-white shadow-md px-4 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl md:text-3xl lg:text-2xl font-bold text-orange-600"
          onClick={closeMenu}
        >
          Pilates With Sarah
        </Link>

        <div className="relative">
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="text-gray-700 text-4xl md:text-5xl lg:text-3xl focus:outline-none"
          >
            ☰
          </button>

          {isMenuOpen && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-lg shadow-lg border z-50"
            >
              <div className="p-4 space-y-3">
                {/* Navigation Links */}
                <div className="space-y-2">
                  <Link
                    to="/"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Home
                  </Link>
                  <Link
                    to="/about"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    About
                  </Link>
                  <Link
                    to="/studio"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Studio
                  </Link>
                  <Link
                    to="/schedule"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Schedule
                  </Link>
                  <Link
                    to="/services"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Services
                  </Link>
                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Contact
                  </Link>
                </div>

                <hr className="border-gray-200" />

                {/* Auth Section */}
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="w-full bg-orange-600 text-white py-3 px-4 rounded hover:bg-orange-700 text-lg"
                  >
                    Logout
                  </button>
                ) : (
                  <form onSubmit={handleAuth} className="space-y-3">
                    {isRegistering && (
                      <input
                        type="text"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Username"
                        required
                        className="w-full border p-3 rounded text-base"
                        autoComplete="username"
                      />
                    )}
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="Email"
                      required
                      className="w-full border p-3 rounded text-base"
                      autoComplete="email"
                    />
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Password"
                      required
                      className="w-full border p-3 rounded text-base"
                      autoComplete={
                        isRegistering ? "new-password" : "current-password"
                      }
                    />
                    <button
                      type="submit"
                      disabled={loggingIn || registering}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded hover:bg-orange-700 text-lg disabled:opacity-60"
                    >
                      {isRegistering
                        ? registering
                          ? "Signing Up..."
                          : "Sign Up"
                        : loggingIn
                        ? "Logging In..."
                        : "Login"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRegistering((v) => !v)}
                      className="w-full text-blue-600 hover:text-blue-800 underline text-base"
                    >
                      {isRegistering ? "Switch to Login" : "Switch to Sign Up"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
