import React, { useState } from 'react';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/signup', { 
        username,
        email,
        password,
      });
      setSuccessMessage('User registered successfully!');
      setUsername('');
      setEmail('');
      setPassword('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error signing up:', error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.message || 'Error signing up. Please try again.');
      } else {
        setErrorMessage('Error signing up. Please try again.');
      }
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>User Signup</h2>
      <form onSubmit={handleSignup} style={formStyle}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Sign Up</button>
        {successMessage && <p style={successMessageStyle}>{successMessage}</p>}
        {errorMessage && <p style={errorMessageStyle}>{errorMessage}</p>}
      </form>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexDirection: 'column',
  height: '100vh',
};

const headingStyle = {
  marginBottom: '20px',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  maxWidth: '400px',
  margin: '20px',
  padding: '20px',
  border: '1px solid #ccc',
  borderRadius: '5px',
  boxShadow: '2px 2px 12px rgba(0, 0, 0, 0.1)',
};

const inputStyle = {
  margin: '10px 0',
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
  fontSize: '16px',
};

const buttonStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: 'none',
  backgroundColor: '#4CAF50',
  color: 'white',
  fontSize: '16px',
  cursor: 'pointer',
};

const successMessageStyle = {
  marginTop: '10px',
  color: 'green',
};

const errorMessageStyle = {
  marginTop: '10px',
  color: 'red',
};

export default Signup;
