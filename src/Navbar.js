import React, { useState, useEffect } from 'react';
import { Link, useMatch, useResolvedPath, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [token, setToken] = useState(sessionStorage.getItem('sessionToken'));
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Update state when sessionStorage changes
    const handleStorageChange = () => {
      setToken(sessionStorage.getItem('sessionToken'));
    };

    // Add event listener to handle storage changes
    window.addEventListener('storage', handleStorageChange);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('sessionToken'); // Clear the session token
    setToken(null); // Update state to trigger re-render
    navigate('/'); // Redirect to home page after logout
  };

  return (
    <nav className="nav">
      <ul>
        <CustomLink to="/">Home</CustomLink>
        {token && <CustomLink to="/myvideos">My Videos</CustomLink>}
        {token && <CustomLink to="/videouploader">Upload Videos</CustomLink>}
        {!token ? (
          <>
            <CustomLink to="/login">Login</CustomLink>
            <CustomLink to="/register">Register</CustomLink>
          </>
        ) : (
          <li>
            <button onClick={handleLogout}>Logout</button> {/* Use button for logout */}
          </li>
        )}
      </ul>
    </nav>
  );
}

function CustomLink({ to, children }) {
  const resolvedPath = useResolvedPath(to);
  const isActive = useMatch({ path: resolvedPath.pathname, end: true });
  return (
    <li className={isActive ? 'active' : ''}>
      <Link to={to}>
        {children}
      </Link>
    </li>
  );
}
