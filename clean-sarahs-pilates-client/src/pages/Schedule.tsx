import React, { useEffect, useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useMutation, useQuery } from "@apollo/client";
import {
  BOOK_APPOINTMENT,
  UPDATE_BOOKING,
  DELETE_BOOKING,
} from "../graphql/mutations";
import { GET_BOOKINGS } from "../graphql/queries";

interface Booking {
  _id: string;
  name: string;
  email: string;
  date: string; // stored as Unix timestamp string (e.g. "1753772400000")
  time: string;
}

const formatTime12Hour = (time24: string) => {
  const [hourStr, minutes] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minutes}${ampm}`;
};

const Schedule: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({ name: "", email: "", time: "" });
  const [submitted, setSubmitted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  // State to hold confirmation message
  const [confirmation, setConfirmation] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  // Use a ref to reset the form after submission
  const formRef = useRef<HTMLFormElement>(null);

  const { data, loading: bookingsLoading, refetch } = useQuery(GET_BOOKINGS);
  const bookings: Booking[] = data?.getBookings || [];

  const [bookAppointment] = useMutation(BOOK_APPOINTMENT);
  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isoDate = date.getTime().toString(); // store as Unix timestamp string

      if (selectedBooking) {
        await updateBooking({
          variables: {
            id: selectedBooking._id,
            input: {
              name: formData.name,
              email: formData.email,
              date: isoDate,
              time: formData.time,
            },
          },
        });
        setSelectedBooking(null);
      } else {
        await bookAppointment({
          variables: {
            input: {
              name: formData.name,
              email: formData.email,
              date: isoDate,
              time: formData.time,
            },
          },
        });
      }

      setConfirmation({ date, time: formData.time });
      setSubmitted(true);
      setFormData({ name: "", email: "", time: "" });

      await refetch();
    } catch (err) {
      console.error("Booking error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBooking({ variables: { id } });
      await refetch();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setFormData({
      name: booking.name,
      email: booking.email,
      time: booking.time,
    });
    setDate(new Date(parseInt(booking.date))); // convert from Unix timestamp
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const isPastDate = (d: Date) => {
    const today = new Date();
    return d.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  const bookedTimes = bookings
    .filter((b) => isSameDay(new Date(parseInt(b.date)), date))
    .map((b) => b.time);

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
        <Calendar
          onChange={(value) => setDate(value as Date)}
          value={date}
          tileDisabled={({ date }) => isPastDate(date)}
        />
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
          onFocus={() => setSubmitted(false)}
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

        <select
          name="time"
          required
          value={formData.time}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Time</option>
          {Array.from({ length: 10 }, (_, i) => {
            const hour = 8 + i; // 8:00 to 17:00
            const timeString = `${hour.toString().padStart(2, "0")}:00`;
            const isBooked = bookedTimes.includes(timeString);
            return (
              <option key={timeString} value={timeString} disabled={isBooked}>
                {formatTime12Hour(timeString)} {isBooked ? " (Booked)" : ""}
              </option>
            );
          })}
        </select>

        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-2 px-4 rounded hover:bg-orange-600"
        >
          {selectedBooking ? "Update Booking" : "Book Appointment"}
        </button>

        {submitted && confirmation && (
          <p className="text-green-600 text-center mt-4">
            ✅ Appointment {selectedBooking ? "updated" : "booked"} for{" "}
            {confirmation.date.toDateString()} at{" "}
            {formatTime12Hour(confirmation.time)}!
          </p>
        )}
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-orange-700 text-center">
          Existing Bookings
        </h2>
        {bookings.map((booking) => (
          <div
            key={booking._id}
            className="border rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <p>
                📅{" "}
                <strong>
                  {new Date(parseInt(booking.date)).toDateString()}
                </strong>{" "}
                at <strong>{formatTime12Hour(booking.time)}</strong>
              </p>
              <p className="text-sm text-gray-600">
                {booking.name} ({booking.email})
              </p>
            </div>
            <div className="space-x-2">
              <button
                onClick={() => handleEdit(booking)}
                className="bg-yellow-400 px-3 py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(booking._id)}
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
