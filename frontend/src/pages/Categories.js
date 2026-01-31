import React, { useState, useEffect } from 'react';
import { categoriesAPI } from '../services/api';
import CategoryCard from '../components/CategoryCard';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load categories');
      setLoading(false);
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <div className="container">
        <div className="categories-header">
          <h1>Choose a Cause</h1>
          <p>Select a category and make a difference today</p>
        </div>

        {categories.length === 0 ? (
          <div className="no-categories">
            <p>No categories available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories.map((category) => (
              <CategoryCard key={category._id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;