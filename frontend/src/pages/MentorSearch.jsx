import React, { useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Grid,
} from '@mui/material';
import { getMentorMatches } from '../services/api';

const MentorSearch = () => {
  const [goals, setGoals] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMatches([]);
    try {
      const { data } = await getMentorMatches(goals);
      setMatches(data.matches);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while searching for mentors.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Your Perfect Mentor
        </Typography>
        <Typography paragraph>
          Describe your career goals, what you'd like to learn, or the challenges you're facing. Our AI will match you with the best mentors to guide you.
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="goals"
            label="What are your career goals?"
            name="goals"
            autoFocus
            multiline
            rows={4}
            value={goals}
            onChange={(e) => setGoals(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Find Mentors'}
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}

        {matches.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom>
              Your Top Matches
            </Typography>
            <Grid container spacing={3}>
              {matches.map((match) => (
                <Grid item xs={12} md={6} key={match.mentor._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{match.mentor.user.name}</Typography>
                      <Typography color="text.secondary" gutterBottom>
                        {match.mentor.headline}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 2 }}>
                        <strong>Match Score:</strong> {match.matchScore}/100
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 1 }}>
                        "{match.reason}"
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Button size="small">View Profile</Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default MentorSearch;
