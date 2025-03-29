import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('UserManagement');
  const [users, setUsers] = useState([]);
  const [appointments, setAppointments] = useState([]);

  // Fetch data based on the active tab
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (activeTab === 'UserManagement') {
          const response = await axios.get('http://localhost:5000/api/users');
          setUsers(response.data);
        } else if (activeTab === 'AppointmentManagement') {
          const response = await axios.get('http://localhost:5000/api/appointments');
          setAppointments(response.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [activeTab]);

  return (
    <div className="admin-page">
      <style>
        {`
          .admin-page {
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f5f5f5;
          }
          
          h1 {
            color: #333;
          }
          
          .tabs {
            margin-bottom: 20px;
          }
          
          .tabs button {
            margin-right: 10px;
            padding: 10px 15px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            transition: background-color 0.3s;
          }
          
          .tabs button:hover {
            background-color: #0056b3;
          }

          .content {
            background-color: white;
            padding: 20px;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          }

          ul {
            list-style-type: none;
            padding: 0;
          }

          li {
            padding: 10px;
            border-bottom: 1px solid #ccc;
          }

          li:last-child {
            border-bottom: none;
          }
        `}
      </style>

      <h1>Admin Dashboard</h1>
      <div className="tabs">
        <button onClick={() => setActiveTab('UserManagement')}>User Management</button>
        <button onClick={() => setActiveTab('AppointmentManagement')}>Appointment Management</button>
      </div>

      <div className="content">
        {activeTab === 'UserManagement' && (
          <div>
            <h2>Users</h2>
            {users.length > 0 ? (
              <ul>
                {users.map(user => (
                  <li key={user._id}>{user.username} - {user.email}</li>
                ))}
              </ul>
            ) : (
              <p>No users found</p>
            )}
          </div>
        )}

        {activeTab === 'AppointmentManagement' && (
          <div>
            <h2>Appointments</h2>
            {appointments.length > 0 ? (
              <ul>
                {appointments.map(appointment => (
                  <li key={appointment._id}>{appointment.patientName} - {new Date(appointment.date).toLocaleDateString()} - {appointment.time} - {appointment.doctor}</li>
                ))}
              </ul>
            ) : (
              <p>No appointments found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
