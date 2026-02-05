import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { donationsAPI, categoriesAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  const [donations, setDonations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // New category form
  const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: ''
  });

  useEffect(() => {
  // Check if user is admin
  if (!isAdmin()) {
    navigate('/');
    return;
  }

  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps  ← ADD THIS LINE!
}, []);

  const fetchData = async () => {
    try {
      const [donationsRes, categoriesRes, statsRes] = await Promise.all([
        donationsAPI.getAll(),
        categoriesAPI.getAll(),
        donationsAPI.getStats()
      ]);

      setDonations(donationsRes.data);
      setCategories(categoriesRes.data);
      setStats(statsRes.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load admin data');
      setLoading(false);
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      await categoriesAPI.create(newCategory);
      setShowNewCategoryForm(false);
      setNewCategory({ name: '', description: '', image: '' });
      fetchData(); // Refresh data
      alert('Category created successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) {
      return;
    }

    try {
      await categoriesAPI.delete(id);
      fetchData(); // Refresh data
      alert('Category deleted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}! Manage your donation platform</p>
        </div>

        {error && <div className="error">{error}</div>}

        {/* Tabs */}
        <div className="admin-tabs">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={activeTab === 'donations' ? 'active' : ''}
            onClick={() => setActiveTab('donations')}
          >
            💰 Donations
          </button>
          <button
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            📂 Categories
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            {/* Stats Cards */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card">
                <div className="stat-icon">💵</div>
                <div className="stat-content">
                  <div className="stat-value">Rs. {stats?.totalAmount || 0}</div>
                  <div className="stat-label">Total Revenue</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-content">
                  <div className="stat-value">{donations.length}</div>
                  <div className="stat-label">Total Donations</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <div className="stat-value">
                    {new Set(donations.map(d => d.user?._id)).size}
                  </div>
                  <div className="stat-label">Unique Donors</div>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="stat-icon">📂</div>
                <div className="stat-content">
                  <div className="stat-value">{categories.length}</div>
                  <div className="stat-label">Active Categories</div>
                </div>
              </div>
            </div>

            {/* Donations by Category */}
            <div className="category-breakdown">
              <h2>Donations by Category</h2>
              <div className="category-stats">
                {categories.map((cat) => {
                  const catDonations = donations.filter(
                    d => d.category?._id === cat._id
                  );
                  const catTotal = catDonations.reduce(
                    (sum, d) => sum + d.amount, 0
                  );

                  return (
                    <div key={cat._id} className="category-stat-card">
                      <img src={cat.image} alt={cat.name} />
                      <div className="category-stat-info">
                        <h3>{cat.name}</h3>
                        <div className="category-stat-details">
                          <span className="stat-amount">Rs. {catTotal}</span>
                          <span className="stat-count">
                            {catDonations.length} donations
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Donations */}
            <div className="recent-donations">
              <h2>Recent Donations</h2>
              <div className="donations-table">
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Donor</th>
                      <th>Category</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donations.slice(0, 10).map((donation) => (
                      <tr key={donation._id}>
                        <td>{formatDate(donation.createdAt)}</td>
                        <td>{donation.user?.name || 'Unknown'}</td>
                        <td>{donation.category?.name || 'Unknown'}</td>
                        <td className="amount">Rs. {donation.amount}</td>
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
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="donations-tab">
            <h2>All Donations ({donations.length})</h2>
            <div className="donations-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Donor</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Amount</th>
                    <th>Message</th>
                    <th>Payment ID</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation._id}>
                      <td>{formatDate(donation.createdAt)}</td>
                      <td>{donation.user?.name || 'Unknown'}</td>
                      <td>{donation.user?.email || 'Unknown'}</td>
                      <td>{donation.category?.name || 'Unknown'}</td>
                      <td className="amount">Rs. {donation.amount}</td>
                      <td className="message">
                        {donation.message || <em>No message</em>}
                      </td>
                      <td className="payment-id">{donation.paymentId}</td>
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
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="categories-tab">
            <div className="categories-header">
              <h2>Manage Categories ({categories.length})</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
              >
                {showNewCategoryForm ? 'Cancel' : '+ Add Category'}
              </button>
            </div>

            {/* New Category Form */}
            {showNewCategoryForm && (
              <div className="new-category-form">
                <h3>Create New Category</h3>
                <form onSubmit={handleCreateCategory}>
                  <div className="form-group">
                    <label>Category Name</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                      placeholder="e.g., Clean Water"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value
                        })
                      }
                      placeholder="Describe this category..."
                      rows="4"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Image URL</label>
                    <input
                      type="url"
                      value={newCategory.image}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, image: e.target.value })
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Create Category
                  </button>
                </form>
              </div>
            )}

            {/* Categories List */}
            <div className="categories-list">
              {categories.map((category) => (
                <div key={category._id} className="admin-category-card">
                  <img src={category.image} alt={category.name} />
                  <div className="admin-category-info">
                    <h3>{category.name}</h3>
                    <p>{category.description}</p>
                    <div className="category-meta">
                      <span>💰 Rs. {category.totalDonations || 0} raised</span>
                      <span>
                        📊{' '}
                        {donations.filter(d => d.category?._id === category._id).length}{' '}
                        donations
                      </span>
                    </div>
                  </div>
                  <div className="admin-category-actions">
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;