import React, { useState } from 'react';
import styles from './LoginAndRegister.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match');
      resetForm();
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      setSuccess(data.message);
      resetForm();
    } catch (error) {
      console.error('Error during registration:', error);
      if (error.message === 'Conflict') {
        setError('Email is already in use');
      } else {
        setError('An error occurred during registration');
      }
      setSuccess('');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className={styles.background}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            placeholder="Email"
            required
          />
        </div>
        <div>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            placeholder="Password"
            required
          />
        </div>
        <div>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="off"
            placeholder="Confirm Password"
            required
          />
        </div>
        {error && !success && <div className={styles.error}>* {error}</div>}
        {success && !error && <div className={styles.success}>{success}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
