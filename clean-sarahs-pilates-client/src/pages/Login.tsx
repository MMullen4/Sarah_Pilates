import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN_USER } from "../graphql/mutations";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [login, { loading, error }] = useMutation(LOGIN_USER);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { ...formData } });
      const token = data.login.token;
      localStorage.setItem("token", token);
      alert("✅ Login successful!");
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        required
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        Login
      </button>
      {error && <p className="text-red-600">Login failed.</p>}
    </form>
  );
};

export default Login;
