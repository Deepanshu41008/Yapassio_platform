import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { getSwotAnalysis } from '../../services/api';

const SwotWidget = () => {
  const [swot, setSwot] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchSwot = async () => {
    setLoading(true);
    setError('');
    setSwot(null);
    try {
      const { data } = await getSwotAnalysis();
      setSwot(data.data.swot_analysis);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch SWOT analysis.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on initial render
  useEffect(() => {
    handleFetchSwot();
  }, [])

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography variant="h6" gutterBottom>Weekly SWOT Analysis</Typography>
            <Button onClick={handleFetchSwot} size="small" disabled={loading}>Refresh</Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {swot && (
          <Box>
            {Object.entries(swot).map(([category, items]) => (
              <Box key={category} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{textTransform: 'capitalize'}}>{category}:</Typography>
                <ul>
                  {items.map((item, index) => <li key={index}><Typography variant="body2">{item}</Typography></li>)}
                </ul>
              </Box>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SwotWidget;
