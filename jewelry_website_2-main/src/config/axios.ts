import axios from 'axios';

// Create a custom instance of axios
const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the token from localStorage
    const token = localStorage.getItem('token');
    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if the error is a 401 AND we are NOT already on the auth page
    if (error.response?.status === 401 && window.location.pathname !== '/auth') {
      // This logic will now only run on protected pages, not the login page itself.
      localStorage.removeItem('token');
      localStorage.removeItem('userEmail'); // Also clear the user email
      
      // Redirect to the login page
      window.location.href = '/auth'; 
    }
    
    // For all other errors (including a 401 on the login page), just pass the error along
    return Promise.reject(error);
  }
);

export default axiosInstance;