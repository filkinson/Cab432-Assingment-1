import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import styles from './LoginAndRegister.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = 'http://localhost:5000/login'; // Update to your server URL

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: username, password: password }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(res.statusText);
        }
        return res.json();
      })
      .then((data) => {
        sessionStorage.setItem('sessionToken', data.token);
        setSuccess('User logged in successfully');
        setError('');
        navigate('/');
        window.location.reload();        
      })
      .catch((error) => {
        console.error('Error during login:', error);
        if (error.message === 'Unauthorized') {
          setError('Incorrect email or password');
        } else {
          setError('An error occurred during login');
        }
        setSuccess('');
      });

    setUsername('');
    setPassword('');
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