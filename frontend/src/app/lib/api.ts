import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://asset-backend-production-acb2.up.railway.app/api', // already includes /api
 
  headers: {
    Accept: 'application/json',
    // ❌ DO NOT set 'Content-Type' here
  },
});

export default instance;

