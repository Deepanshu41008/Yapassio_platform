import React, { useState } from 'react';
import { Card, CardContent, Typography, Button, TextField, Box, CircularProgress, Alert, Link } from '@mui/material';
import { getOpportunities } from '../../services/api';

const OpportunitiesWidget = () => {
  const [domain, setDomain] = useState('Data Science');
  const [opportunities, setOpportunities] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    setOpportunities(null);
    try {
      const { data } = await getOpportunities(domain);
      setOpportunities(data.data.opportunities);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch opportunities.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>Global Opportunities</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField label="Domain" value={domain} onChange={e => setDomain(e.target.value)} size="small" />
          <Button onClick={handleSearch} variant="outlined" disabled={loading}>Search</Button>
        </Box>

        {loading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}

        {opportunities && (
          <Box>
            <Typography variant="subtitle1">Top Countries:</Typography>
            <ul>
              {opportunities.top_countries.map(c => (
                <li key={c.country}>{c.country} ({c.visa_pathways.join(', ')})</li>
              ))}
            </ul>
            <Typography variant="subtitle1">Job Boards:</Typography>
            <ul>
              {opportunities.job_boards.map(j => (
                <li key={j.name}><Link href={j.url} target="_blank" rel="noopener">{j.name}</Link></li>
              ))}
            </ul>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunitiesWidget;
