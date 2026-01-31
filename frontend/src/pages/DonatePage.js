import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { categoriesAPI, donationsAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import './DonatePage.css';

// Load Stripe (outside component to avoid recreating)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component
const PaymentForm = ({ category, amount, message, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Step 1: Create payment intent on backend
      const { data } = await api.post('/payment/create-payment-intent', {
        amount: parseFloat(amount)
      });

      // Step 2: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      // Step 3: Payment successful! Save donation to database
      if (paymentIntent.status === 'succeeded') {
        await donationsAPI.create({
          category: category._id,
          amount: parseFloat(amount),
          message: message,
          paymentId: paymentIntent.id
        });

        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      setProcessing(false);
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Card Details</label>
        <div className="card-element-container">
          <CardElement
            options={{
              hidePostalCode: true,
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-block"
        disabled={!stripe || processing}
      >
        {processing ? 'Processing...' : `Donate $${amount || '0'}`}
      </button>

      <p className="test-card-info">
        💳 Test Card: 4242 4242 4242 4242 | Any future date | Any 3 digits
      </p>
    </form>
  );
};

// Main Donate Page Component
const DonatePage = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [category, setCategory] = useState(null);
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCategory();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await categoriesAPI.getById(categoryId);
      setCategory(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load category');
      setLoading(false);
      console.error(err);
    }
  };

  const handleSuccess = () => {
    alert('Donation successful! Thank you for your generosity! 🎉');
    navigate('/dashboard');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error && !category) {
    return (
      <div className="container">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="donate-page">
      <div className="container">
        <div className="donate-container">
          {/* Category Info */}
          <div className="category-info">
            <img src={category.image} alt={category.name} />
            <h2>{category.name}</h2>
            <p>{category.description}</p>
            <div className="total-raised">
              <span>Total Raised:</span>
              <strong>${category.totalDonations || 0}</strong>
            </div>
          </div>

          {/* Donation Form */}
          <div className="donation-form-container">
            <h3>Make Your Donation</h3>
            <p className="form-subtitle">
              You're donating to <strong>{category.name}</strong>
            </p>

            <div className="form-group">
              <label>Donation Amount ($)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
              />
            </div>

            {/* Quick amount buttons */}
            <div className="quick-amounts">
              <button
                type="button"
                onClick={() => setAmount('10')}
                className="quick-amount-btn"
              >
                $10
              </button>
              <button
                type="button"
                onClick={() => setAmount('25')}
                className="quick-amount-btn"
              >
                $25
              </button>
              <button
                type="button"
                onClick={() => setAmount('50')}
                className="quick-amount-btn"
              >
                $50
              </button>
              <button
                type="button"
                onClick={() => setAmount('100')}
                className="quick-amount-btn"
              >
                $100
              </button>
            </div>

            <div className="form-group">
              <label>Message (Optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Leave a message of support..."
                rows="4"
                maxLength="500"
              />
            </div>

            <div className="donor-info">
              <p>
                <strong>Donating as:</strong> {user?.name} ({user?.email})
              </p>
            </div>

            {/* Stripe Payment Form */}
            <Elements stripe={stripePromise}>
              <PaymentForm
                category={category}
                amount={amount}
                message={message}
                onSuccess={handleSuccess}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonatePage;