import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:8000/api', // already includes /api
 
  headers: {
    Accept: 'application/json',
    // ❌ DO NOT set 'Content-Type' here
  },
});

export default instance;
