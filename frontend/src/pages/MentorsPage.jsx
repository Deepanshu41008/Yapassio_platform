import React, { useState, useEffect } from 'react';
import {
  Typography,
  Container,
  Box,
  CircularProgress,
  Alert,
  Grid,
  Pagination,
} from '@mui/material';
import { getMentors } from '../services/api';
import MentorCard from '../components/MentorCard';
// import MentorFilter from '../components/MentorFilter';

const MentorsPage = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await getMentors({ ...filters, page });
        setMentors(data.mentors);
        setTotalPages(data.pagination.totalPages);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch mentors.');
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, [page, filters]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Mentors
        </Typography>

        {/* <MentorFilter setFilters={setFilters} /> */}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              {mentors.map((mentor) => (
                <Grid item xs={12} sm={6} md={4} key={mentor._id}>
                  <MentorCard mentor={mentor} />
                </Grid>
              ))}
            </Grid>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default MentorsPage;
