import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api', // The base URL of our API gateway
});

// We can add an interceptor to include the auth token in every request
API.interceptors.request.use((req) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Authentication endpoints
export const login = (formData) => API.post('/auth/login', formData);
export const register = (formData) => API.post('/auth/register', formData);

// Mentor endpoints
export const getMentors = (params) => API.get('/mentors', { params });
export const getMentorById = (id) => API.get(`/mentors/${id}`);
export const getMentorMatches = (goals) => API.post('/mentors/match', { goals });

// Group endpoints
export const getGroups = (params) => API.get('/community', { params });
export const createGroup = (groupData) => API.post('/community', groupData);

// Exam Prep endpoints
export const getExamResources = (examName) => API.get(`/exams/resources/${examName}`);
export const getPracticeQuestions = (examName, params) => API.get(`/exams/practice/${examName}`, { params });
export const getPlannerEvents = () => API.get('/exams/planner');
export const createPlannerEvent = (eventData) => API.post('/exams/planner', eventData);

// Simulation endpoints
export const getSimulationChallenge = (domain) => API.get(`/simulations/challenge?domain=${domain}`);
export const getSimulationFeedback = (data) => API.post('/simulations/feedback', data);

// Other endpoints
export const getOpportunities = (domain) => API.get(`/opportunities/${domain}`);
export const getSwotAnalysis = () => API.get('/dashboard/swot');
export const getSuccessScore = () => API.get('/analytics/success-score');


export default API;
