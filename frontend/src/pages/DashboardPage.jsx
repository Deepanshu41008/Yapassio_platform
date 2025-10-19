import React from 'react';
import { Typography, Box, Grid } from '@mui/material';
import SimulationWidget from '../components/dashboard/SimulationWidget';
import OpportunitiesWidget from '../components/dashboard/OpportunitiesWidget';
import SwotWidget from '../components/dashboard/SwotWidget';
import SuccessScoreWidget from '../components/dashboard/SuccessScoreWidget';

const DashboardPage = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Your Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <SuccessScoreWidget />
        </Grid>
        <Grid item xs={12} md={6}>
          <SwotWidget />
        </Grid>
        <Grid item xs={12}>
          <SimulationWidget />
        </Grid>
        <Grid item xs={12}>
          <OpportunitiesWidget />
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardPage;
