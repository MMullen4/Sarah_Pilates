import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Schedule: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Booking submitted:", { ...formData, date });
    setSubmitted(true);
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
        Choose a date to schedule your personal Pilates session with Sarah.
      </p>

      <div className="flex justify-center mb-6">
        <Calendar
          onChange={(value) => setDate(value as Date)}
          value={date}
          minDate={new Date()}
          tileClassName={({ date }) =>
            date.toDateString() === new Date().toDateString()
              ? "bg-orange-100"
              : undefined
          }
          tileDisabled={({ date }) =>
            date < new Date(new Date().setHours(0, 0, 0, 0))
          }
        />
      </div>

      <p className="text-center mt-2 text-gray-600 mb-6">
        Selected Date: <strong>{date.toDateString()}</strong>
      </p>

      <form
        onSubmit={handleSubmit}
        className="bg-gray-100 p-6 rounded-lg shadow-md space-y-4"
      >
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleInputChange}
          required
          className="w-full p-2 border rounded"
        />
        <input
          type="email"
          name="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full p-2 border rounded"
        />
        <select
          name="time"
          value={formData.time}
          onChange={handleInputChange}
          required
          className="w-full p-2 border rounded"
        >
          <option value="">Select Time</option>
          <option>9:00 AM</option>
          <option>11:00 AM</option>
          <option>1:00 PM</option>
          <option>3:00 PM</option>
          <option>5:00 PM</option>
        </select>

        <button
          type="submit"
          className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
        >
          Confirm Booking
        </button>

        {submitted && (
          <p className="text-green-600 mt-2 text-center">
            Booking submitted! We'll be in touch.
          </p>
        )}
      </form>
    </div>
  );
};

export default Schedule;

