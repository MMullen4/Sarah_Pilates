import React, { useState, useRef } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useMutation } from "@apollo/client";
import { BOOK_APPOINTMENT } from "../utils/mutations";

const Schedule: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({ name: "", email: "", time: "" });
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [bookAppointment, { loading, error }] = useMutation(BOOK_APPOINTMENT);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await bookAppointment({
        variables: {
          input: {
            name: formData.name,
            email: formData.email,
            date: date.toISOString(),
            time: formData.time,
          },
        },
      });
      setSubmitted(true);
    } catch (err) {
      console.error("Booking failed:", err);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-3xl font-bold text-orange-600 mb-4 text-center">
        Schedule a Session
      </h1>
      <img
        src="https://as2.ftcdn.net/v2/jpg/05/85/94/75/1000_F_585947577_bzC0PesLqbJRpmCCnqnTngwX78o0ZStt.jpg"
        alt="Pilates class"
        className="rounded-lg mb-6 w-full object-cover h-64"
      />

      <p className="text-gray-700 text-center mb-4">
        Choose a date and submit the form below.
      </p>

      <div className="flex justify-center mb-6">
        <Calendar onChange={(value) => setDate(value as Date)} value={date} />
      </div>

      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="space-y-4 max-w-md mx-auto"
      >
        <input
          name="name"
          placeholder="Your Name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <input
          name="time"
          type="time"
          required
          value={formData.time}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
        >
          {loading ? "Booking..." : "Book Appointment"}
        </button>
        {submitted && (
          <p className="text-green-600 text-center mt-4">
            ✅ Appointment booked for {date.toDateString()} at {formData.time}!
          </p>
        )}
        {error && (
          <p className="text-red-600 text-center mt-4">❌ Booking failed.</p>
        )}
      </form>
    </div>
  );
};

export default Schedule;
