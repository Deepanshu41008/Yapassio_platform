import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography, Container } from '@mui/material';
import ResourceFinder from '../components/exam/ResourceFinder';
import PracticeQuestions from '../components/exam/PracticeQuestions';
import Planner from '../components/exam/Planner';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`exam-tabpanel-${index}`}
      aria-labelledby={`exam-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ExamPrepPage = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Exam Preparation Assistant
        </Typography>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="exam prep tabs">
            <Tab label="Find Resources" />
            <Tab label="Practice Questions" />
            <Tab label="Study Planner" />
          </Tabs>
        </Box>
        <TabPanel value={value} index={0}>
          <ResourceFinder />
        </TabPanel>
        <TabPanel value={value} index={1}>
          <PracticeQuestions />
        </TabPanel>
        <TabPanel value={value} index={2}>
          <Planner />
        </TabPanel>
      </Box>
    </Container>
  );
};

export default ExamPrepPage;
