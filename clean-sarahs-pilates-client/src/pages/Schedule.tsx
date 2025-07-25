import React, { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const Schedule: React.FC = () => {
  const [date, setDate] = useState(new Date());


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
      <div className="flex justify-center">
        <Calendar onChange={(value) => setDate(value as Date)} value={date} />
      </div>
      <p className="text-center mt-6 text-gray-600">
        Selected Date: <strong>{date.toDateString()}</strong>
      </p>
    </div>
  );
};

export default Schedule;
