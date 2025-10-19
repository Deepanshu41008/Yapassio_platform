import React from 'react';
import { Typography, Button, Container, Box } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const HomePage = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          my: 4,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Your Future
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Navigate your career path with confidence. Our AI-powered tools and expert mentors are here to guide you every step of the way.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" component={RouterLink} to="/register" sx={{ mr: 2 }}>
            Get Started
          </Button>
          <Button variant="outlined" component={RouterLink} to="/login">
            Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;
