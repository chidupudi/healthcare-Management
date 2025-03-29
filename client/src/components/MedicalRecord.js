import React, { useState } from 'react';
import axios from 'axios';

const MedicalRecordManagement = () => {
  const [patientName, setPatientName] = useState('');
  const [condition, setCondition] = useState('');
  const [treatment, setTreatment] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleMedicalRecordManagement = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/medicalrecords', {
        patientName,
        condition,
        treatment,
      });
      setSuccessMessage('Medical record added successfully!');
      setPatientName('');
      setCondition('');
      setTreatment('');
      setErrorMessage('');
    } catch (error) {
      console.error('Error managing medical record:', error.response ? error.response.data : error.message);
      setErrorMessage('Error adding medical record. Please try again.');
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Medical Record Management</h2>
      <form onSubmit={handleMedicalRecordManagement} style={formStyle}>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Treatment"
          value={treatment}
          onChange={(e) => setTreatment(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Submit Medical Record</button>
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

export default MedicalRecordManagement;
