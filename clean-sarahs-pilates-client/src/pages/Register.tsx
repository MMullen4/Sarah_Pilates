import React, { useState } from "react";
import { useMutation } from "@apollo/client";
import { REGISTER_USER } from "../graphql/mutations";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [register, { loading, error }] = useMutation(REGISTER_USER);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const { data } = await register({
      variables: {
        input: {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        },
      },
    });

    const token = data.register.token;
    localStorage.setItem("token", token);
    alert("🎉 Registration successful!");
  } catch (err) {
    console.error("Register error:", err);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <input
        name="username"
        placeholder="Username"
        required
        onChange={handleChange}
        className="w-full border p-2 rounded"
      />
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
        className="bg-green-500 text-white py-2 px-4 rounded"
      >
        Register
      </button>
      {error && <p className="text-red-600">Registration failed.</p>}
    </form>
  );
};

export default Register;
