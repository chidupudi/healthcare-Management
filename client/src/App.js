import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Welcome from './components/Welcome';
import Home from './components/Home';
import About from './components/About';
import Login from './components/Login';
import Signup from './components/Signup';
import AppointmentScheduling from './components/AppointmentScheduling';
import MedicalRecord from './components/MedicalRecord';
import Billing from './components/Billing';
import AdminPage from './components/AdminPage';
import Footer from './components/Footer'; 


function App() {
  return (
    <Router>
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />  
        <Route path="/appointment-scheduling" element={<AppointmentScheduling />} />
        <Route path="/medical-record" element={<MedicalRecord />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
      <Footer />
    </div>
  </Router>
  );
}

export default App;