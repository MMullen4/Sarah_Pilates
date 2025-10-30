import React, { useRef, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useMutation, useQuery } from "@apollo/client";
import toast from "react-hot-toast";

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
  date: string;
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

const addMinutes = (time24: string, minutes: number) => {
  const [hourStr, minuteStr] = time24.split(":");
  const totalMinutes = parseInt(hourStr) * 60 + parseInt(minuteStr) + minutes;
  const newHour = Math.floor(totalMinutes / 60);
  const newMinute = totalMinutes % 60;
  return `${newHour.toString().padStart(2, "0")}:${newMinute
    .toString()
    .padStart(2, "0")}`;
};

const Schedule: React.FC = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmation, setConfirmation] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  const { data, loading: bookingsLoading, refetch } = useQuery(GET_BOOKINGS);
  const bookings: Booking[] = data?.getBookings || [];

  const [bookAppointment] = useMutation(BOOK_APPOINTMENT);
  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  // Get current user info from JWT
  const currentUser = React.useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return { id: null, email: null };
    try {
      const payload = JSON.parse(atob(token.split(".")[1] || ""));
      return {
        id: payload?.id,
        email: payload?.email,
        role: payload?.role,
        username: payload?.username,
      };
    } catch {
      return { id: null, email: null };
    }
  }, []);

  const isAdmin = currentUser?.role === "admin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please log in to book appointments");
      return;
    }

    const isoDate = date.getTime().toString();

    try {
      if (selectedBooking) {
        await updateBooking({
          variables: {
            id: selectedBooking._id,
            input: {
              date: isoDate,
              time: time,
            },
          },
        });
        toast.success("Appointment updated");
        setSelectedBooking(null);
      } else {
        await bookAppointment({
          variables: {
            input: {
              date: isoDate,
              time: time,
            },
          },
        });
        toast.success("Appointment booked");
      }

      setConfirmation({ date, time });
      setSubmitted(true);
      setTime("");
      await refetch();
    } catch (err: any) {
      // Surface the backend message (e.g., "You can only update your own appointments")
      const msg = err?.message || "Something went wrong while booking";
      toast.error(msg);
      console.error("Booking error:", err);
    }
  };

  const handleDelete = async (booking: Booking) => {
    try {
      await deleteBooking({ variables: { id: booking._id } });
      await refetch();
      toast.success("Appointment removed");
    } catch (err: any) {
      const msg = err?.message || "Failed to remove appointment";
      toast.error(msg);
      console.error("Delete failed:", err);
    }
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setTime(booking.time);
    setDate(new Date(parseInt(booking.date)));
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

  const upcomingSorted = React.useMemo(() => {
    const toMinutes = (t: string) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };
    const isFutureOrToday = (timestamp: number) => {
      const d = new Date(timestamp);
      const today = new Date();
      d.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      return d.getTime() >= today.getTime();
    };

    return (bookings || [])
      .filter((b) => {
        const ts = parseInt(b.date);
        return !Number.isNaN(ts) && isFutureOrToday(ts);
      })
      .sort((a, b) => {
        const da = parseInt(a.date),
          db = parseInt(b.date);
        if (da !== db) return da - db;
        const ma = toMinutes(a.time),
          mb = toMinutes(b.time);
        return ma - mb;
      });
  }, [bookings]);

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white shadow-md rounded-lg mt-10">
      <h1 className="text-4xl md:text-4xl lg:text-3xl font-bold text-orange-600 mb-4 text-center">
        Schedule a Session
      </h1>

      <img
        src="https://as2.ftcdn.net/v2/jpg/05/85/94/75/1000_F_585947577_bzC0PesLqbJRpmCCnqnTngwX78o0ZStt.jpg"
        alt="Pilates class"
        className="rounded-lg mb-6 sm:mb-8 md:mb-12 lg:mb-6 w-2/3 mx-auto object-cover h-64"
      />

      <p className="text-gray-700 text-center mb-4">
        Choose a date and time below.
      </p>

      <div className="flex justify-center mb-6 md:mb-12 lg:mb-6">
        <div className="scale-110 sm:scale-125 md:scale-125 lg:scale-125 my-3 sm:my-7 md:my-8 lg:my-8">
          <Calendar
            onChange={(value) => setDate(value as Date)}
            value={date}
            tileDisabled={({ date }) => isPastDate(date)}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
        <select
          name="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Time</option>
          {Array.from({ length: 10 }, (_, i) => {
            const hour = 8 + i;
            const timeString = `${hour.toString().padStart(2, "0")}:00`;
            const isBooked = bookedTimes.includes(timeString);
            return (
              <option key={timeString} value={timeString} disabled={isBooked}>
                {formatTime12Hour(timeString)} {isBooked ? "(Booked)" : ""}
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
            {confirmation.date.toDateString()} from{" "}
            {formatTime12Hour(confirmation.time)} to{" "}
            {formatTime12Hour(addMinutes(confirmation.time, 50))}!
          </p>
        )}
      </form>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4 text-orange-700 text-center">
          Existing Bookings
        </h2>

        {upcomingSorted.map((booking) => (
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
              {(isAdmin || booking.email === currentUser?.email) && (
                <>
                  <button
                    onClick={() => handleEdit(booking)}
                    className="bg-yellow-400 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(booking)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Schedule;
