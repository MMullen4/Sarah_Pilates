// src/components/Navbar.tsx
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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

  useEffect(() => {
    if (!isMenuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        menuRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="site-nav" aria-label="Main navigation">
      <div className="site-nav-inner">
        <Link
          to="/"
          className="site-brand"
          onClick={closeMenu}
        >
          Pilates with Sarah
        </Link>

        <div className="site-navigation">
          <div className="desktop-links">
            <NavLink to="/services">Services</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/contact">Contact</NavLink>
          </div>
          <Link to="/schedule" className="book-button">Book now</Link>
        <div className="account-menu-wrap" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
            className="account-menu-button" aria-controls="account-navigation"
          >
            <span className="account-menu-icon" aria-hidden="true">{isMenuOpen ? "✕" : "☰"}</span><span className="account-menu-label">{isMenuOpen ? "Close" : token ? "Account / Menu" : "Sign in / Menu"}</span>
          </button>

          {isMenuOpen && (
            <div
              id="account-navigation"
              className="account-dropdown"
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
                    to="/services"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Services
                  </Link>
                  <Link
                    to="/about"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    About
                  </Link>
                  <Link
                    to="/contact"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Contact
                  </Link>
                  <Link
                    to="/schedule"
                    onClick={closeMenu}
                    className="block text-lg md:text-xl py-2 px-3 hover:bg-orange-50 hover:text-orange-600 rounded transition"
                  >
                    Schedule
                  </Link>
                </div>

                <hr className="border-gray-200" />

                {/* Auth Section */}
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="account-logout-button"
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
                      className="account-auth-submit"
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
                      className="account-auth-switch"
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
      </div>
    </nav>
  );
};

export default Navbar;
