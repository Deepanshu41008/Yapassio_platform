import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import { getGroups } from '../services/api';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getGroups();
        setGroups(data.groups);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch groups.');
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Community Groups
        </Typography>
        <Typography paragraph>
          Join learning circles based on your interests to connect with peers and mentors.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {groups.map((group) => (
              <Grid item xs={12} sm={6} md={4} key={group._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{group.name}</Typography>
                    <Chip label={group.domain} size="small" sx={{ my: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      {group.description}
                    </Typography>
                     <Typography variant="body2" sx={{ mt: 1 }}>
                      {group.stats.totalMembers} members
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Group</Button>
                    <Button size="small">Join</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default GroupsPage;
