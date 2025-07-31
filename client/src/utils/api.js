import axios from 'axios';

// Configure base URL for different environments
const getBaseURL = () => {
  if (process.env.NODE_ENV === 'production') {
    return window.location.origin; // Use same domain in production (Vercel)
  }
  return 'http://localhost:5000'; // Local development
};

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      console.warn('Rate limit exceeded. Please try again later.');
    } else if (error.response?.status >= 500) {
      console.error('Server error. Please try again later.');
    }
    
    return Promise.reject(error);
  }
);

export default api;