import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  TextField,
  Button
} from '@mui/material';
import { getPlannerEvents, createPlannerEvent } from '../../services/api';

const Planner = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [title, setTitle] = useState('');
  const [startTime, setStartTime] = useState('');

  const fetchEvents = async () => {
    try {
      const { data } = await getPlannerEvents();
      setEvents(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch planner events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        // Simple date handling for this demo
        const eventData = {
            title,
            startTime: new Date(startTime),
            endTime: new Date(new Date(startTime).getTime() + 60 * 60 * 1000) // 1 hour duration
        };
        await createPlannerEvent(eventData);
        setTitle('');
        setStartTime('');
        fetchEvents(); // Refresh list
    } catch(err) {
        setError(err.response?.data?.message || 'Failed to create event.');
    }
  }

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
       <Typography variant="h6" gutterBottom>
        My Study Plan
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{mb: 4}}>
          <Typography variant="subtitle1" gutterBottom>Add New Event</Typography>
          <TextField label="Event Title" value={title} onChange={e => setTitle(e.target.value)} fullWidth required sx={{mb: 2}}/>
          <TextField label="Start Time (e.g., YYYY-MM-DDTHH:MM)" value={startTime} onChange={e => setStartTime(e.target.value)} fullWidth required sx={{mb: 2}}/>
          <Button type="submit" variant="contained">Add Event</Button>
      </Box>

      <List>
        {events.map((event, index) => (
          <React.Fragment key={event._id}>
            <ListItem>
              <ListItemText
                primary={event.title}
                secondary={`${new Date(event.startTime).toLocaleString()} - ${event.eventType}`}
              />
            </ListItem>
            {index < events.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Box>
  );
};

export default Planner;
