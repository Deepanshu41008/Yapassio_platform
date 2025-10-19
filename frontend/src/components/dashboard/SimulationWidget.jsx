import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, CircularProgress, Alert } from '@mui/material';
import { getSimulationChallenge, getSimulationFeedback } from '../../services/api';

const SimulationWidget = () => {
  const [domain, setDomain] = useState('Software Engineering');
  const [challenge, setChallenge] = useState(null);
  const [submission, setSubmission] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGetChallenge = async () => {
    setLoading(true);
    setError('');
    setChallenge(null);
    setFeedback(null);
    try {
      const { data } = await getSimulationChallenge(domain);
      setChallenge(data.data.challenge);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch challenge.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getSimulationFeedback({ challenge, submission });
      setFeedback(data.data.feedback);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get feedback.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Career Simulation</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Domain" value={domain} onChange={e => setDomain(e.target.value)} size="small" />
          <Button onClick={handleGetChallenge} variant="outlined" disabled={loading}>Get New Challenge</Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {challenge && !feedback && (
          <Box>
            <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>{challenge.title}</Typography>
            <Typography variant="body2" sx={{mt: 1}}>{challenge.scenario}</Typography>
            <Typography variant="body2" sx={{mt: 1, fontStyle: 'italic'}}>Task: {challenge.task}</Typography>
            <TextField
              label="Your Response"
              multiline
              rows={4}
              value={submission}
              onChange={e => setSubmission(e.target.value)}
              fullWidth
              sx={{ my: 2 }}
            />
            <Button onClick={handleSubmitFeedback} variant="contained" disabled={loading}>Submit for Feedback</Button>
          </Box>
        )}

        {feedback && (
            <Box>
                <Typography variant="subtitle1" sx={{fontWeight: 'bold'}}>Feedback Received!</Typography>
                <Typography variant="body2" sx={{mt: 1}}><strong>Overall:</strong> {feedback.overall}</Typography>
                {Object.entries(feedback.scores).map(([key, value]) => (
                    <Typography key={key} variant="body2" sx={{mt: 1}}>
                        <strong>{key.replace('_', ' ')}:</strong> {value.score}/10 - <em>{value.justification}</em>
                    </Typography>
                ))}
            </Box>
        )}

      </CardContent>
    </Card>
  );
};

export default SimulationWidget;
