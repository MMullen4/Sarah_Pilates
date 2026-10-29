import React, { useState } from "react";
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
  const [showSignInPrompt, setShowSignInPrompt] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [bookingPending, setBookingPending] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmation, setConfirmation] = useState<{
    date: Date;
    time: string;
  } | null>(null);

  const { data, loading: bookingsLoading, error: bookingsError, refetch } = useQuery(GET_BOOKINGS, {
    fetchPolicy: "network-only",
    nextFetchPolicy: "network-only",
    pollInterval: 30000,
  });
  const bookings: Booking[] = data?.getBookings || [];

  const [bookAppointment] = useMutation(BOOK_APPOINTMENT);
  const [updateBooking] = useMutation(UPDATE_BOOKING);
  const [deleteBooking] = useMutation(DELETE_BOOKING);

  // Get current user info from JWT
  const currentUser = React.useMemo(() => {
    const token = localStorage.getItem("token");
    if (!token) return { id: null, email: null, role: null };
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
  const showAuthPrompt = () => {
    setShowSignInPrompt(true);
  };
  const changeDate = (next: Date) => {
    setDate(next);
    setTime("");
    setSubmitted(false);
    setShowSignInPrompt(false);
  };
  const availableHours = Array.from({ length: 10 }, (_, i) => `${String(i + 8).padStart(2, "0")}:00`);
  const isPastSlot = (slot: string) => {
    const [hours, minutes] = slot.split(":").map(Number);
    const at = new Date(date);
    at.setHours(hours, minutes, 0, 0);
    return at.getTime() < Date.now();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      showAuthPrompt();
      return;
    }

    if (!time) {
      toast.error("Please select an available date and time.");
      return;
    }
    if (bookingPending) return;
    const isoDate = date.getTime().toString();
    setBookingPending(true);

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
    } finally {
      setBookingPending(false);
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
    setSubmitted(false);
    setSelectedBooking(booking);
    setTime(booking.time);
    const bookingDate = parseBookingDate(booking.date);
    if (bookingDate) setDate(bookingDate);
  };

  const parseBookingDate = (raw: string) => {
    const value = String(raw).trim();
    const timestamp = /^\d+$/.test(value) ? Number(value) : Date.parse(value);
    return Number.isFinite(timestamp) ? new Date(timestamp) : null;
  };

  const isSameDay = (d1: Date, d2: Date) =>
    d1.toDateString() === d2.toDateString();

  const isPastDate = (d: Date) => {
    const today = new Date();
    return d.setHours(0, 0, 0, 0) < today.setHours(0, 0, 0, 0);
  };

  const bookedTimes = bookings
    .filter((b) => (() => { const parsed = parseBookingDate(b.date); return parsed ? isSameDay(parsed, date) : false; })())
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
        const parsed = parseBookingDate(b.date);
        return parsed !== null && isFutureOrToday(parsed.getTime());
      })
      .sort((a, b) => {
        const da = parseBookingDate(a.date)?.getTime() ?? 0,
          db = parseBookingDate(b.date)?.getTime() ?? 0;
        if (da !== db) return da - db;
        const ma = toMinutes(a.time),
          mb = toMinutes(b.time);
        return ma - mb;
      });
  }, [bookings]);

  return (
    <main className="booking-page">
      <h1 className="booking-heading">
        Schedule a Session
      </h1>

      <img
        src="https://as2.ftcdn.net/v2/jpg/05/85/94/75/1000_F_585947577_bzC0PesLqbJRpmCCnqnTngwX78o0ZStt.jpg"
        alt="Pilates class"
        className="booking-photo"
      />

      <p className="booking-subtitle">
        Choose a date and time below.
      </p>

      <div className="booking-calendar-wrap">
        <div className="booking-calendar-inner">
          <Calendar
            onChange={(value) => changeDate(value as Date)}
            value={date}
            tileDisabled={({ date }) => isPastDate(date)}
          />
        </div>
      </div>

      <form id="booking-form" onSubmit={handleSubmit} className="schedule-form space-y-4 max-w-md mx-auto">
        <fieldset className="booking-times-fieldset" disabled={bookingsLoading}>
          <legend className="booking-times-title">Available times</legend>
          <p className="booking-date-label">{date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
          <div className="booking-time-grid">
            {availableHours.map((slot) => {
              const booked = bookedTimes.includes(slot);
              const past = isPastSlot(slot);
              const editingOriginalSlot = selectedBooking?.time === slot && (() => { const parsed = parseBookingDate(selectedBooking.date); return parsed ? isSameDay(parsed, date) : false; })();
              const unavailable = (booked && !editingOriginalSlot) || past;
              return (
                <button type="button" key={slot}
                  className={`booking-time-slot ${unavailable ? "is-unavailable" : ""} ${time === slot ? "is-selected" : ""}`}
                  disabled={unavailable}
                  aria-pressed={time === slot}
                  onClick={() => { setTime(slot); setShowSignInPrompt(false); }}>
                  <span>{formatTime12Hour(slot)}</span>
                  <span className="booking-time-status">{booked && !editingOriginalSlot ? "Booked" : past ? "Past" : time === slot ? "Selected" : "Available"}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <p className="booking-submit-hint" role="status">
          {bookingPending ? "Saving your appointment…" : selectedBooking ? "Select a time, then use Book now in the top navigation to save the change." : "Select a time, then use Book now in the top navigation to confirm."}
        </p>

        {showSignInPrompt && !currentUser?.id && (
          <div className="booking-auth-alert" role="alert">
            <span>Please sign in or sign up using the account menu above to book a session.</span>
            <button type="button" aria-label="Dismiss sign-in message" onClick={() => setShowSignInPrompt(false)}>✕</button>
          </div>
        )}

        {submitted && confirmation && (
          <p className="text-green-600 text-center mt-4">
            ✅ Appointment {selectedBooking ? "updated" : "booked"} for{" "}
            {confirmation.date.toDateString()} from{" "}
            {formatTime12Hour(confirmation.time)} to{" "}
            {formatTime12Hour(addMinutes(confirmation.time, 50))}!
          </p>
        )}
      </form>

      {bookingsError && <p role="alert" className="booking-auth-alert">Could not load appointments. Please refresh the page.</p>}
      {currentUser?.id && <div className="mt-10">
        <h2 className="booking-list-heading">
          {isAdmin ? "Manage All Bookings" : "My Bookings"}
        </h2>

        {bookingsLoading && bookings.length === 0 && <p>Loading appointments…</p>}
        {upcomingSorted.filter((booking) => isAdmin || booking.email === currentUser?.email).map((booking) => (
          <div
            key={booking._id}
            className="border rounded p-4 mb-3 flex justify-between items-center"
          >
            <div>
              <p>
                📅{" "}
                <strong>
                  {parseBookingDate(booking.date)?.toDateString() ?? "Date unavailable"}
                </strong>{" "}
                at <strong>{formatTime12Hour(booking.time)}</strong>
              </p>
              {isAdmin && <p className="text-sm text-gray-600">{booking.name} ({booking.email})</p>}
            </div>
            <div className="space-x-2">
              {(isAdmin || booking.email === currentUser?.email) && (
                <>
                  <button
                    onClick={() => handleEdit(booking)}
                    className="booking-action"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(booking)}
                    className="booking-action"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>}
    </main>
  );
};

export default Schedule;
