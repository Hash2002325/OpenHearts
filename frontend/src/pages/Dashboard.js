import React, { useState, useEffect, useContext } from 'react';
import { donationsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const response = await donationsAPI.getAll();
      setDonations(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load donations');
      setLoading(false);
      console.error(err);
    }
  };

  const calculateTotal = () => {
    return donations.reduce((total, donation) => total + donation.amount, 0);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}! 👋</h1>
          <p>Thank you for making a difference</p>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-value">${calculateTotal()}</div>
              <div className="stat-label">Total Donated</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-value">{donations.length}</div>
              <div className="stat-label">Donations Made</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-content">
              <div className="stat-value">
                {new Set(donations.map(d => d.category?._id)).size}
              </div>
              <div className="stat-label">Causes Supported</div>
            </div>
          </div>
        </div>

        {/* Donation History */}
        <div className="donation-history">
          <h2>Your Donation History</h2>

          {donations.length === 0 ? (
            <div className="no-donations">
              <p>You haven't made any donations yet.</p>
              <a href="/categories" className="btn btn-primary">
                Make Your First Donation
              </a>
            </div>
          ) : (
            <div className="donations-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Message</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation._id}>
                      <td>{formatDate(donation.createdAt)}</td>
                      <td>
                        <strong>{donation.category?.name || 'Unknown'}</strong>
                      </td>
                      <td className="amount">${donation.amount}</td>
                      <td className="message">
                        {donation.message || <em>No message</em>}
                      </td>
                      <td>
                        <span className={`status status-${donation.status}`}>
                          {donation.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;