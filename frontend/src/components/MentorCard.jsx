import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
  Chip,
  Box,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const MentorCard = ({ mentor }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h2">
          {mentor.user.name}
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          {mentor.headline}
        </Typography>
        <Box sx={{ my: 2 }}>
          {mentor.expertise.domains.slice(0, 3).map((domain) => (
            <Chip label={domain} key={domain} sx={{ mr: 1, mb: 1 }} />
          ))}
        </Box>
        <Typography variant="body2">
          {mentor.bio.substring(0, 100)}...
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          size="small"
          component={RouterLink}
          to={`/mentors/${mentor.user._id}`}
        >
          View Profile
        </Button>
      </CardActions>
    </Card>
  );
};

export default MentorCard;
