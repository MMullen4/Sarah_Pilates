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
        "service_gqsvn2q", // replaced with EmailJS service ID
        "template_uu5kqk8", // replaced with EmailJS template ID
        formRef.current,
        "km_oggbJJxcH0H9F6" // replaced with EmailJS public key
      )
      .then(
        () => setStatus("success"),
        (error) => {
          console.error("EmailJS error:", error);
          setStatus("error");
        }
      );
  };

  return (
    <main className="contact-page" id="main-content">
      <h1>Get in touch</h1>
      <p className="contact-intro">Have a question about sessions or getting started? Send Sarah a message.</p>
      <form ref={formRef} onSubmit={sendEmail} className="space-y-4">
        <input
          type="text"
          name="user_name"
          aria-label="Your name"
          placeholder="Your Name"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="email"
          name="user_email"
          aria-label="Your email"
          placeholder="Your Email"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <textarea
          name="message"
          rows={5}
          aria-label="Your message"
          placeholder="Your Message"
          required
          className="w-full px-4 py-2 border rounded"
        />
        <button
          type="submit"
          className="book-button"
        >
          Send Message
        </button>
        {status === "success" && (
          <p role="status" className="text-green-600 mt-2">Message sent successfully!</p>
        )}
        {status === "error" && (
          <p role="alert" className="text-red-600 mt-2">
            Something went wrong. Please try again.
          </p>
        )}
      </form>
    </main>
  );
};

export default Contact;
