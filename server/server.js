const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000; // Port specified directly

// Middleware
app.use(cors()); // Allow requests from your frontend's IP
app.use(express.json()); // Parse JSON requests

// Data directory setup
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR);
}

// File paths
const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  appointments: path.join(DATA_DIR, 'appointments.json'),
  medicalRecords: path.join(DATA_DIR, 'medicalRecords.json'),
  billings: path.join(DATA_DIR, 'billings.json'),
  counters: path.join(DATA_DIR, 'counters.json')
};

// Helper functions for file storage
function readData(filePath, defaultValue = []) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
  }
  return defaultValue;
}

function writeData(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
  }
}

// Load data from files
let users = readData(FILES.users, []);
let appointments = readData(FILES.appointments, []);
let medicalRecords = readData(FILES.medicalRecords, []);
let billings = readData(FILES.billings, []);

// Load counters
const counters = readData(FILES.counters, {
  userIdCounter: 1,
  appointmentIdCounter: 1,
  medicalRecordIdCounter: 1,
  billingIdCounter: 1
});

let userIdCounter = counters.userIdCounter;
let appointmentIdCounter = counters.appointmentIdCounter;
let medicalRecordIdCounter = counters.medicalRecordIdCounter;
let billingIdCounter = counters.billingIdCounter;

// Save counters function
function saveCounters() {
  writeData(FILES.counters, {
    userIdCounter,
    appointmentIdCounter,
    medicalRecordIdCounter,
    billingIdCounter
  });
}

// Root route
app.get('/', (req, res) => {
  res.send('Backend server is running! (File-based storage mode)');
});

// Health check endpoint for Kubernetes liveness probe
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'healthcare-backend',
    storage: 'file-based'
  });
});

// Readiness check endpoint for Kubernetes readiness probe
app.get('/ready', (req, res) => {
  // Always ready since we don't depend on external database
  res.status(200).json({
    status: 'ready',
    storage: 'file-based',
    timestamp: new Date().toISOString(),
    service: 'healthcare-backend',
    data: {
      users: users.length,
      appointments: appointments.length,
      medicalRecords: medicalRecords.length,
      billings: billings.length
    }
  });
});

// User registration route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Incoming signup request:', req.body);

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: userIdCounter++,
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData(FILES.users, users);
    saveCounters();

    console.log(`User registered: ${username} (Total users: ${users.length})`);
    res.status(201).json({ message: 'User registered successfully!', userId: newUser.id });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Admin login
    if (email === 'admin' && password === 'admin123') {
      return res.status(200).json({ message: 'Admin login successful', redirectTo: '/admin' });
    }

    // Find user
    const user = users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.status(200).json({
        message: 'Login successful',
        username: user.username
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Get all users route
app.get('/api/users', (req, res) => {
  try {
    // Return users without passwords
    const safeUsers = users.map(({ id, username, email, createdAt }) => ({
      id,
      username,
      email,
      createdAt
    }));
    res.status(200).json(safeUsers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Get all appointments route
app.get('/api/appointments', (req, res) => {
  try {
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error: error.message });
  }
});

// Create new appointment route
app.post('/api/appointments', (req, res) => {
  try {
    const { patientName, date, time, doctor } = req.body;

    const newAppointment = {
      id: appointmentIdCounter++,
      patientName,
      date,
      time,
      doctor,
      createdAt: new Date().toISOString()
    };

    appointments.push(newAppointment);
    writeData(FILES.appointments, appointments);
    saveCounters();

    console.log(`Appointment created for ${patientName} (Total: ${appointments.length})`);
    res.status(201).json(newAppointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error: error.message });
  }
});

// Create new medical record route
app.post('/api/medicalrecords', (req, res) => {
  try {
    const { patientName, condition, treatment } = req.body;

    const newRecord = {
      id: medicalRecordIdCounter++,
      patientName,
      condition,
      treatment,
      createdAt: new Date().toISOString()
    };

    medicalRecords.push(newRecord);
    writeData(FILES.medicalRecords, medicalRecords);
    saveCounters();

    console.log(`Medical record created for ${patientName} (Total: ${medicalRecords.length})`);
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error creating medical record', error: error.message });
  }
});

// Get all medical records route
app.get('/api/medicalrecords', (req, res) => {
  try {
    res.status(200).json(medicalRecords);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching medical records', error: error.message });
  }
});

// Create new billing record route
app.post('/api/billings', (req, res) => {
  try {
    const { patientName, amount, paymentMethod } = req.body;

    const newBilling = {
      id: billingIdCounter++,
      patientName,
      amount,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    billings.push(newBilling);
    writeData(FILES.billings, billings);
    saveCounters();

    console.log(`Billing record created for ${patientName} (Total: ${billings.length})`);
    res.status(201).json(newBilling);
  } catch (error) {
    res.status(400).json({ message: 'Error creating billing record', error: error.message });
  }
});

// Get all billing records route
app.get('/api/billings', (req, res) => {
  try {
    res.status(200).json(billings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching billing records', error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log('Storage mode: File-based (no database required)');
  console.log(`Data directory: ${DATA_DIR}`);
  console.log('Data persists across server restarts');
});
