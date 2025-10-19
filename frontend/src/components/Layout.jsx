import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import { Container } from '@mui/material';

const Layout = () => {
  return (
    <>
      <Header />
      <Container component="main" maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;
