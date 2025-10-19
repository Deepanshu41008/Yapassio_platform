import React from 'react';
import './App.css';
import MentorMatching from './components/MentorMatching.jsx';
import ExamPreparation from './components/ExamPreparation.jsx';
import CareerSimulation from './components/CareerSimulation.jsx';
import TestFeaturesPage from './pages/TestFeaturesPage.jsx';
import api from './api';

function App() {
  const handleHealthCheck = async () => {
    try {
      const response = await api.get('/health');
      alert('Health Check Status: ' + JSON.stringify(response.data, null, 2));
    } catch (error) {
      alert('Error performing health check.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI-Powered Student Platform</h1>
        <button onClick={handleHealthCheck}>Health Check</button>
      </header>
      <main>
        <TestFeaturesPage />
        <hr style={{ margin: '40px 0' }} />
        <MentorMatching />
        <ExamPreparation />
        <CareerSimulation />
      </main>
    </div>
  );
}

export default App;
