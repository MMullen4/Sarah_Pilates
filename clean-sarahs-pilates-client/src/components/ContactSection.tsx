import React from "react";
import { Link } from "react-router-dom";

export default function ContactSection() {
  return (
    <section className="contact-section" id="contact" aria-labelledby="contact-section-heading">
      <div>
        <p className="about-eyebrow">LET’S CONNECT</p>
        <h2 id="contact-section-heading">Your practice starts<br />with a conversation.</h2>
      </div>
      <div className="contact-section-copy">
        <p>Have a question about Pilates, choosing a session, or getting started? Send Sarah a message.</p>
        <Link to="/contact" className="book-button">Contact Sarah</Link>
        <Link to="/schedule" className="service-book-link">Ready to book? View the schedule <span aria-hidden="true">↗</span></Link>
      </div>
    </section>
  );
}
