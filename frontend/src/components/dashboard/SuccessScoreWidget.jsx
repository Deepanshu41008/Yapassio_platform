import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Button, Box, CircularProgress, Alert } from '@mui/material';
import { getSuccessScore } from '../../services/api';

const SuccessScoreWidget = () => {
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchScore = async () => {
    setLoading(true);
    setError('');
    setScore(null);
    try {
      const { data } = await getSuccessScore();
      setScore(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch success score.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on initial render
  useEffect(() => {
    handleFetchScore();
  }, [])

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Typography variant="h6" gutterBottom>Success Probability</Typography>
            <Button onClick={handleFetchScore} size="small" disabled={loading}>Refresh</Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {score && (
          <Box sx={{textAlign: 'center', mt: 2}}>
            <Typography variant="h2" color="primary">{score.success_score}%</Typography>
            <Typography variant="body2" sx={{mt: 1, fontStyle: 'italic'}}>{score.justification}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default SuccessScoreWidget;
