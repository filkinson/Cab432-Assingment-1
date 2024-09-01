import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginAndRegister.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate
  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${apiBaseUrl}/login`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password: password }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const data = await response.json();
      sessionStorage.setItem('sessionToken', data.token);
      setSuccess('User logged in successfully');
      setError('');
      navigate('/'); // Redirect to home page
      window.location.reload();   
    } catch (error) {
      console.error('Error during login:', error);
      if (error.message === 'Unauthorized') {
        setError('Incorrect email or password');
      } else {
        setError('An error occurred during login');
      }
      setSuccess('');
    } finally {
      setUsername('');
      setPassword('');
    }
  };

  return (
    <div className={styles.background}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div>
          <label htmlFor="username"></label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
        {error && !success && <div className={styles.error}>* {error}</div>}
        {success && !error && <div className={styles.success}>{success}</div>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
