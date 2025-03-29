import React from 'react';

const Footer = () => {
  const footerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3498db',
    color: 'white',
    padding: '10px 20px',
    position: 'fixed',
    bottom: '0',
    left: '0',
    right: '0',
    marginTop: '20px',
    boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.2)',
    zIndex: '1000', // Ensure the footer stays above other content
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    margin: '0 10px',
  };

  return (
    <footer style={footerStyle}>
      <p style={{ margin: 0 }}>© 2024 HealthCare Management System</p>
      <div>
        <a href="/terms" style={linkStyle}>Terms of Service</a>
        <a href="/privacy" style={linkStyle}>Privacy Policy</a>
      </div>
    </footer>
  );
};

export default Footer;