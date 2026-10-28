import React from "react";
import { Link } from "react-router-dom";
import ContactSection from "../components/ContactSection";

export default function Home() {
  return (
    <main className="home-page" id="main-content">
      <section className="home-hero" aria-label="Pilates with Sarah">
        <img className="home-hero-image" src="/images/home-hero.png" alt="Pilates with Sarah" fetchPriority="high" />
      </section>
      <section className="home-seo-intro" aria-labelledby="home-pilates-heading">
        <div className="home-seo-copy">
          <p className="home-seo-eyebrow">PILATES WITH SARAH · MANHATTAN BEACH</p>
          <h1 id="home-pilates-heading">Private Pilates Instruction in Manhattan Beach</h1>
          <p>Discover a personalized approach to Pilates through private apparatus sessions, duet reformer sessions, and guided mat classes. Pilates With Sarah focuses on mindful movement, strength, flexibility, and control, with sessions designed to meet you where you are.</p>
          <div className="home-seo-links">
            <Link to="/services" className="service-book-link">Explore Pilates sessions</Link>
            <Link to="/schedule" className="service-book-link">View schedule</Link>
          </div>
        </div>
      </section>
      <ContactSection />
      <footer className="site-footer">
        <Link to="/">Pilates with Sarah</Link>
        <div><Link to="/services">Services</Link><Link to="/about">About</Link><Link to="/contact">Get in touch</Link></div>
      </footer>
    </main>
  );
}
