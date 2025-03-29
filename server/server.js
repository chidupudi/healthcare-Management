const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000; // Port specified directly

// Middleware
app.use(cors()); // Allow requests from your frontend's IP
app.use(express.json()); // Parse JSON requests

// Root route
app.get('/', (req, res) => {
  res.send('Backend server is running!');
});

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/health', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});


const appointmentSchema = new mongoose.Schema({
  patientName: String,
  date: Date,
  time: String,
  doctor: String,
});
const medicalRecordSchema = new mongoose.Schema({
  patientName: String,
  condition: String,
  treatment: String,
});

const billingSchema = new mongoose.Schema({
  patientName: String,
  amount: Number,
  paymentMethod: String,
});

// Define models
const User = mongoose.model('User', userSchema);

const Appointment = mongoose.model('Appointment', appointmentSchema);
const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);
const Billing = mongoose.model('Billing', billingSchema);

// User registration route
app.post('/api/signup', async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Incoming signup request:', req.body);

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });

    await user.save();
    res.status(201).send('User registered successfully!');
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Error registering user', error });
  }
});

// User login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (email === 'admin' && password === 'admin123') {
      return res.status(200).json({ message: 'Admin login successful', redirectTo: '/admin' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
});



// Get all appointments route
app.get('/api/appointments', async (req, res) => {
  try {
    const appointments = await Appointment.find();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
});

// Create new appointment route
app.post('/api/appointments', async (req, res) => {
  const appointment = new Appointment(req.body);

  try {
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error });
  }
});

// Create new medical record route
app.post('/api/medicalrecords', async (req, res) => {
  const record = new MedicalRecord(req.body);

  try {
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ message: 'Error creating medical record', error });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find({}, 'username email'); // Select only relevant fields
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
});
// Create new billing record route
app.post('/api/billings', async (req, res) => {
  const billing = new Billing(req.body);

  try {
    await billing.save();
    res.status(201).json(billing);
  } catch (error) {
    res.status(400).json({ message: 'Error creating billing record', error });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http:localhost:${PORT}`); // Use public IP address
});
