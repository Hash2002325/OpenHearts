import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCard.css';

const CategoryCard = ({ category }) => {
  return (
    <div className="category-card">
      <div className="category-image">
        <img src={category.image} alt={category.name} />
      </div>
      
      <div className="category-content">
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        
        <div className="category-stats">
          <div className="stat">
            <span className="stat-label">Total Raised</span>
            <span className="stat-value">${category.totalDonations || 0}</span>
          </div>
        </div>
        
        <Link to={`/donate/${category._id}`} className="btn btn-primary">
          Donate Now
        </Link>
      </div>
    </div>
  );
};

export default CategoryCard;