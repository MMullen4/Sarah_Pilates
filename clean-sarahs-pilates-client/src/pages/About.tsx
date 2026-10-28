import React from "react";
import ContactSection from "../components/ContactSection";
import { Link } from "react-router-dom";

const About: React.FC = () => (
  <main className="about-page about-reference-page" id="main-content">
    <section className="about-reference-layout" aria-labelledby="about-heading">
      <div className="about-reference-copy">
        <p className="about-training-eyebrow">EDUCATION & TRAINING</p>
        <h1 id="about-heading">Comprehensive Pilates Training</h1>
        <p>Sarah completed her comprehensive Pilates education through Balanced Body, Inc., studying under Kelly Leonardi and Heidi Coles at Blue Moon Pilates.</p>
        <p>Her comprehensive training includes Movement Principles, Anatomy in 3D, Mat, Reformer, Cadillac/Trapeze, Chair, and Barrel.</p>
        <Link to="/services" className="service-book-link">Explore Sarah's Pilates sessions</Link>
      </div>
      <div className="about-reference-photo" role="img" aria-label="Pilates practice in a bright studio" />
    </section>
    <section className="about-expertise" aria-labelledby="expertise-heading">
      <h2 id="expertise-heading">Precision-Driven Pilates Expertise</h2>
      <p>A thoughtful Pilates practice brings together focused movement, attention to alignment, and space to build strength, flexibility, and control.</p>
      <p>At Pilates with Sarah, the emphasis is on a practice that feels personal. Explore private apparatus sessions, duet reformer sessions, and mat classes, with room to ask questions, develop your confidence, and work toward your goals at your own pace.</p>
    </section>
    <ContactSection />
    <footer className="site-footer"><Link to="/">Pilates with Sarah</Link><div><Link to="/services">Services</Link><Link to="/contact">Get in touch</Link></div></footer>
  </main>
);

export default About;
