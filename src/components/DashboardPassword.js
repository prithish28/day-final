// src/components/DashboardPassword.js

import React, { useState } from 'react';
import '../assets/styles/DashboardPassword.css'; // Assuming you have styles here

const DashboardPassword = ({ onPasswordVerified }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const staticPassword = '1234567'; // Static password

    if (password === staticPassword) {
      onPasswordVerified();
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="password-container">
      <form onSubmit={handleSubmit} className="password-form">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter dashboard password"
          className="password-input"
        />
        <button type="submit" className="password-button">Submit</button>
        {error && <p className="password-error">{error}</p>}
      </form>
    </div>
  );
};

export default DashboardPassword;
