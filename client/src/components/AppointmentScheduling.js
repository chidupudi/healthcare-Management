// AppointmentScheduling.js
import React, { useState } from 'react';
import axios from 'axios';

const AppointmentScheduling = () => {
  const [patientName, setPatientName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [doctor, setDoctor] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAppointmentScheduling = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/appointments', {
        patientName,
        date,
        time,
        doctor,
      });
      setSuccessMessage('Appointment scheduled successfully!');
      // Clear form fields
      setPatientName('');
      setDate('');
      setTime('');
      setDoctor('');
    } catch (error) {
      console.error('Error scheduling appointment:', error);
    }
  };

  return (
    <div style={containerStyle}>
      <h2 style={headingStyle}>Schedule Appointment</h2>
      <form onSubmit={handleAppointmentScheduling} style={formStyle}>
        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          required
          style={inputStyle}
        />
        <input
          type="text"
          placeholder="Doctor's Name"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Schedule Appointment</button>
        {successMessage && <p style={successMessageStyle}>{successMessage}</p>}
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

export default AppointmentScheduling;
