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
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { getPracticeQuestions } from '../../services/api';

const PracticeQuestions = () => {
  const [examName, setExamName] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setQuestions(null);
    try {
      const { data } = await getPracticeQuestions(examName, { topic });
      setQuestions(data.data.questions);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred while fetching questions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Generate Practice Questions
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
        <TextField
          label="Exam Name"
          variant="outlined"
          value={examName}
          onChange={(e) => setExamName(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <TextField
          label="Topic (e.g., 'Indian History', 'Organic Chemistry')"
          variant="outlined"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate'}
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {questions && (
        <Box>
          {questions.map((q, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>{index + 1}. {q.question}</Typography>
                <FormControl component="fieldset">
                  <RadioGroup>
                    {q.options.map((option, i) => (
                      <FormControlLabel key={i} value={option} control={<Radio />} label={option} />
                    ))}
                  </RadioGroup>
                </FormControl>
                <details style={{marginTop: '1rem'}}>
                    <summary>View Answer</summary>
                    <Typography variant="body2" sx={{mt: 1, color: 'green'}}>
                        <strong>Correct Answer:</strong> {q.correctAnswer}
                    </Typography>
                    <Typography variant="body2" sx={{mt: 1}}>
                        <strong>Explanation:</strong> {q.explanation}
                    </Typography>
                </details>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default PracticeQuestions;
