import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.VENICE_API_KEY) {
  throw new Error('VENICE_API_KEY must be set in environment variables');
}

export const veniceClient = axios.create({
  baseURL: 'https://api.venice.ai/api/v1',
  headers: {
    Authorization: `Bearer ${process.env.VENICE_API_KEY}`,
    'Content-Type': 'application/json',
  },
  timeout: 120000,
  validateStatus: (status) => status >= 200 && status < 300,
});

veniceClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Venice API error:', {
      data: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
    });
    throw error;
  },
);
