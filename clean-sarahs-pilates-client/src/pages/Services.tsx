import React from "react";
import ContactSection from "../components/ContactSection";
import { Link } from "react-router-dom";

const services = [
  { name: "Private Apparatus Session", image: "apparatus", description: "Individual attention. Purposeful movement. A private Pilates session tailored to your goals.", alt: "Pilates ring and fabric accessories in a neutral studio" },
  { name: "Duet Reformer Session", image: "reformer", description: "Move together with personalized guidance in a shared reformer session for two.", alt: "Reformer equipment in a warm, sunlit Pilates studio" },
  { name: "Mat Class Series", image: "mat", description: "Build a consistent practice with guided mat sessions focused on strength, mobility, and control.", alt: "Pilates instructor and students practicing in a bright studio" },
];

const Services: React.FC = () => (
  <main className="services-page" id="main-content">
    <section className="services-intro" aria-labelledby="services-heading">
      <h1 id="services-heading">Guided Movement,<br />Evidenced Expertise</h1>
      <div className="services-intro-copy">
        <p>Discover a thoughtful approach to Pilates, with movement designed to support alignment, mobility, and total body strength.</p>
        <p>Personalized guidance meets purposeful practice. Explore private sessions, duet reformer sessions, and mat classes to find your way to move.</p>
      </div>
    </section>
    <section className="services-grid" aria-label="Pilates services">
      {services.map((service) => (
        <article className="service-card" key={service.image}>
          <Link to="/schedule" className="service-image-link" aria-label={`View schedule for ${service.name}`}>
            <div className={`service-image service-image-${service.image}`} role="img" aria-label={service.alt} />
          </Link>
          <h2><Link to="/schedule">{service.name}</Link></h2>
          <p>{service.description}</p>
          <Link to="/schedule" className="service-book-link">View schedule <span aria-hidden="true">↗</span></Link>
        </article>
      ))}
    </section>
    <ContactSection />
    <footer className="site-footer">
      <Link to="/">Pilates with Sarah</Link>
      <div><Link to="/contact">Get in touch</Link></div>
    </footer>
  </main>
);

export default Services;
