import React, { useRef, useState } from "react";
import emailjs from "@emailjs/browser";

const Contact: React.FC = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formRef.current) return;

    emailjs
      .sendForm(
        "service_55z9qhu", // replace with your EmailJS service ID
        "template_uu5kqk8", // replace with your EmailJS template ID
        formRef.current,
        "km_oggbJJxcH0H9F6" // replace with your EmailJS public key
      )
      .then(
        () => setStatus("success"),
        () => setStatus("error")
      );
  };

  return (
    <div className="p-10 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-orange-600 mb-6">Contact Us</h1>
      <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
        <input
          type="text"
          name="user_name"
          placeholder="Your Name"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="email"
          name="user_email"
          placeholder="Your Email"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          name="message"
          rows={5}
          placeholder="Your Message"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700 transition"
        >
          Send Message
        </button>
        {status === "success" && (
          <p className="text-green-600 mt-2">Message sent successfully!</p>
        )}
        {status === "error" && (
          <p className="text-red-600 mt-2">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </div>
  );
};

export default Contact;
