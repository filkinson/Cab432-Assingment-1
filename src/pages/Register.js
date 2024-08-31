import React, { useState } from 'react';
import styles from './LoginAndRegister.module.css';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      return;
    }

    const url = 'http://localhost:5000/register'; // Update to your server URL

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        setSuccess(data.message);
        setError('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      })
      .catch((error) => {
        console.error('Error during registration:', error);
        if (error.message === 'Conflict') {
          setError('Email is already in use');
        } else {
          setError('An error occurred during registration');
        }
        setSuccess('');
      });
  };

  return (
    <div className={styles.background}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="email"></label>
          <input
            type="text"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            placeholder="Email"
          />
        </div>
        <div>
          <label htmlFor="password"></label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="off"
            placeholder="Password"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword"></label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="off"
            placeholder="Confirm Password"
          />
        </div>
        {error && !success && <div className={styles.error}>* {error}</div>}
        {success && !error && <div className={styles.success}>{success}</div>}
        <button type="submit">Register</button>
      </form>
    </div>
  );
}