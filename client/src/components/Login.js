import React, { useState } from 'react';
import { Box, TextField, Button, Typography, Link, Checkbox, FormControlLabel } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isAdminLogin) {
      if (adminUsername === 'admin' && adminPassword === 'admin123') {
        navigate('/admin');
      } else {
        setError('Invalid admin credentials');
      }
    } else {
      try {
        const isEmail = identifier.includes('@');
        const payload = isEmail ? { email: identifier, password } : { username: identifier, password };
        
        const response = await axios.post('http://localhost:5000/api/login', payload);

        if (response.data.message === 'Login successful') {
          navigate('/home');
        } else {
          setError('Invalid email/username or password');
        }
      } catch (err) {
        setError('Invalid email/username or password');
      }
    }
  };

  return (
    <Box sx={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <Typography variant="h4" align="center" gutterBottom>Login</Typography>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <TextField
          label="Email or Username"
          type="text"
          variant="outlined"
          fullWidth
          margin="normal"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
        <TextField
          label="Password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <Typography color="error" textAlign="center">{error}</Typography>}
        
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ marginTop: '16px' }}>Login</Button>
      </form>

      <FormControlLabel
        control={<Checkbox checked={isAdminLogin} onChange={() => setIsAdminLogin(!isAdminLogin)} />}
        label="Admin Login"
      />
      
      {isAdminLogin && (
        <Box style={{ marginTop: '20px' }}>
          <Typography variant="h6" align="center">Admin Login</Typography>
          <TextField
            label="Admin Username"
            type="text"
            variant="outlined"
            fullWidth
            margin="normal"
            value={adminUsername}
            onChange={(e) => setAdminUsername(e.target.value)}
            required
          />
          <TextField
            label="Admin Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
            required
          />
          <Button variant="contained" color="primary" onClick={handleSubmit} fullWidth sx={{ marginTop: '16px' }}>Login as Admin</Button>
        </Box>
      )}

      <Typography variant="body2" align="center" sx={{ marginTop: '10px' }}>
        Don't have an account? 
        <Link href="/signup" sx={{ marginLeft: '5px' }}>Sign up here</Link>
      </Typography>
    </Box>
  );
};

export default Login;
