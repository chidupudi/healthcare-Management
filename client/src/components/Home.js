import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h1 style={{ color: '#2c3e50' }}>Healthcare Management System</h1>
      <p style={{ color: '#34495e' }}>Choose a service:</p>
      <Link to="/appointment-scheduling" style={linkStyle}>Appointment Scheduling</Link>
      <Link to="/medical-record" style={linkStyle}>Medical Record Management</Link>
      <Link to="/billing" style={linkStyle}>Billing</Link>
    </div>
  );
};

const linkStyle = {
  display: 'block',
  margin: '10px 0',
  padding: '10px',
  backgroundColor: '#3498db',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: '4px',
  width: '200px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

export default Home;