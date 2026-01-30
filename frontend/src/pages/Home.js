import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Open Your Heart, Change a Life
          </h1>
          <p className="hero-subtitle">
            Join thousands of donors making a difference in education, healthcare, and disaster relief around the world.
          </p>
          <div className="hero-buttons">
            <Link to="/categories" className="btn btn-primary">
              Donate Now
            </Link>
            <Link to="/register" className="btn btn-secondary">
              Get Started
            </Link>
          </div>
        </div>
        
        <div className="hero-image">
          <img 
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600" 
            alt="People helping each other"
          />
        </div>
      </section>

      {/* Impact Stats */}
      <section className="stats">
        <div className="stat-card">
          <div className="stat-number">$250K+</div>
          <div className="stat-label">Total Donations</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">5,000+</div>
          <div className="stat-label">Donors</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">15</div>
          <div className="stat-label">Countries Helped</div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <h2>How It Works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3>Choose a Cause</h3>
            <p>Browse categories like Education, Healthcare, and Disaster Relief</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3>Make a Donation</h3>
            <p>Donate securely with Stripe - any amount helps!</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3>Track Impact</h3>
            <p>View your donation history and see the difference you're making</p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="cta">
        <h2>Ready to Make a Difference?</h2>
        <p>Every donation, no matter the size, changes lives.</p>
        <Link to="/categories" className="btn btn-large">
          Start Donating Today
        </Link>
      </section>
    </div>
  );
};

export default Home;