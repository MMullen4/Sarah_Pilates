import React, { useEffect, useRef, useState } from "react"; // import React and hooks for state management
import Calendar from "react-calendar"; // gets the calendar component for date selection
import "react-calendar/dist/Calendar.css"; // gets the default styles for the calendar component
import { useMutation, useQuery } from "@apollo/client"; // gets the useMutation and useQuery hooks from Apollo Client
import {
  BOOK_APPOINTMENT,
  UPDATE_BOOKING,
  DELETE_BOOKING,
} from "../graphql/mutations"; // adjust the import path as needed
import { GET_BOOKINGS } from "../graphql/queries"; // import the query to get bookings

interface Booking {
  _id: string;
  name: string;
  email: string;
  date: string; // stored as Unix timestamp string (e.g. "1753772400000")
  time: string;
}

const formatTime12Hour = (time24: string) => {
  // converts 24-hour time to 12-hour format
  const [hourStr, minutes] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  if (hour > 12) hour -= 12;
  if (hour === 0) hour = 12;
  return `${hour}:${minutes}${ampm}`;
};

// Add this helper function that adds minutes to a time string in HH:MM format
const addMinutes = (time24: string, minutes: number) => {
  const [hourStr, minuteStr] = time24.split(":");
  const totalMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr) + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
};


const Schedule: React.FC = () => {
  // main component for scheduling appointments
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

  // GraphQL queries and mutations for managing bookings
  const { data, loading: bookingsLoading, refetch } = useQuery(GET_BOOKINGS);
  const bookings: Booking[] = data?.getBookings || [];

  const [bookAppointment] = useMutation(BOOK_APPOINTMENT);
  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  const handleChange = ( // handles input changes in the form
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => { // handles form submission for booking appointments
    e.preventDefault();
    try {
      const isoDate = date.getTime().toString(); // store as Unix timestamp string; will need to convert to ISO string if required by backend

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

      // Reset form and show confirmation
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

  const isSameDay = (d1: Date, d2: Date) => // checks if two dates are the same day
    d1.toDateString() === d2.toDateString();

  const isPastDate = (d: Date) => { // checks if a date is in the past
    const today = new Date();
    return d.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  // filter booked times for the selected date
  const bookedTimes = bookings
    .filter((b) => isSameDay(new Date(parseInt(b.date)), date)) // checks if the booking date matches the selected date
    .map((b) => b.time); // extracts the time from each booking

  return ( // renders the main scheduling component
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
          {Array.from({ length: 10 }, (_, i) => { // generates time options from 8:00am to 5:00pm
            const hour = 8 + i; // starts from 8am
            const timeString = `${hour.toString().padStart(2, "0")}:00`; // formats time as HH:MM
            const isBooked = bookedTimes.includes(timeString); // checks if the time is already booked
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

        {submitted && confirmation && ( // displays confirmation message after successful booking
          <p className="text-green-600 text-center mt-4">
            ✅ Appointment {selectedBooking ? "updated" : "booked"} for{" "}
            {confirmation.date.toDateString()} from{" "}
            {formatTime12Hour(confirmation.time)} to {formatTime12Hour(addMinutes(confirmation.time, 50))}!
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
