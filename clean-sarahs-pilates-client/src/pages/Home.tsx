import React from "react";
import { Link } from "react-router-dom";
import ContactSection from "../components/ContactSection";

export default function Home() {
  return (
    <main className="home-page" id="main-content">
      <section className="home-hero" aria-label="Pilates with Sarah">
        <img className="home-hero-image" src="/images/home-hero.png" alt="Pilates with Sarah" fetchPriority="high" />
      </section>
      <ContactSection />
      <footer className="site-footer">
        <Link to="/">Pilates with Sarah</Link>
        <div><Link to="/services">Services</Link><Link to="/about">About</Link><Link to="/contact">Get in touch</Link></div>
      </footer>
    </main>
  );
}
