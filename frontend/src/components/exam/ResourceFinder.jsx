import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Link,
} from '@mui/material';
import { getExamResources } from '../../services/api';

const ResourceFinder = () => {
  const [examName, setExamName] = useState('');
  const [resources, setResources] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setResources(null);
    try {
      const { data } = await getExamResources(examName);
      setResources(data.data.resources);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching resources.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Find Study Resources
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <TextField
          label="Enter Exam Name (e.g., UPSC, NEET, GATE)"
          variant="outlined"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          fullWidth
          required
        />
        <Button type="submit" variant="contained" sx={{ ml: 2, py: '15px' }} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Find'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {resources && (
        <Box>
          {Object.entries(resources).map(([category, items]) => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>{category}</Typography>
              {items.map((item, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {item.url ? <Link href={item.url} target="_blank" rel="noopener">{item.title || item.name}</Link> : (item.title || item.name)}
                    </Typography>
                    {item.author && <Typography variant="body2" color="text.secondary">Author: {item.author}</Typography>}
                    <Typography variant="body2" sx={{ mt: 1 }}>{item.description}</Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ResourceFinder;
