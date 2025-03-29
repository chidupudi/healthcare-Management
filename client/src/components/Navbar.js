import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const navbarStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#3498db',
    padding: '10px 20px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)',
  };

  const logoStyle = {
    fontSize: '24px',
    color: 'white',
    textDecoration: 'none',
  };

  const linksContainerStyle = {
    display: 'flex',
    gap: '15px',
  };

  const linkStyle = {
    color: 'white',
    textDecoration: 'none',
    padding: '10px 15px',
    borderRadius: '4px',
    transition: 'background-color 0.3s',
  };

  const linkHoverStyle = {
    backgroundColor: '#2980b9',
  };

  return (
    <nav style={navbarStyle}>
      <Link to="/" style={logoStyle}>HealthCare</Link>
      <div style={linksContainerStyle}>
        <Link to="/home" style={linkStyle} 
          onMouseOver={(e) => e.target.style.backgroundColor = linkHoverStyle.backgroundColor} 
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
          Home
        </Link>
        <Link to="/about" style={linkStyle} 
          onMouseOver={(e) => e.target.style.backgroundColor = linkHoverStyle.backgroundColor} 
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
          About
        </Link>
        <Link to="/login" style={linkStyle} 
          onMouseOver={(e) => e.target.style.backgroundColor = linkHoverStyle.backgroundColor} 
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
          Login
        </Link>
        <Link to="/signup" style={linkStyle} 
          onMouseOver={(e) => e.target.style.backgroundColor = linkHoverStyle.backgroundColor} 
          onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}>
          Signup
        </Link>
       
      </div>
    </nav>
  );
};

export default Navbar;