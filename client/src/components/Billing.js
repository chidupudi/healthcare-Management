import React, { useState } from 'react';
import axios from 'axios';

const Billing = () => {
  const [patientName, setPatientName] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBilling = async (e) => {
    e.preventDefault();
    console.log('Billing Data:', { patientName, amount, paymentMethod });
    try {
      const response = await axios.post('http://localhost:5000/api/billings', {
        patientName,
        amount,
        paymentMethod,
      });
      console.log('Response:', response.data);
      setSuccessMessage('Billing processed successfully!');
      setPatientName('');
      setAmount('');
      setPaymentMethod('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error processing billing:', error.response ? error.response.data : error.message);
      setErrorMessage('Error processing billing. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Billing</h2>
      <form onSubmit={handleBilling} style={formStyle}>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Payment Method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Process Billing</button>
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

export default Billing;
