import axios from 'axios';

const api = axios.create({
  baseURL: '/api',  // ← usa el proxy de vite
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function createPlan(data) {
  const response = await api.post('/plan/', data);
  return response.data;
}

export async function searchCars(params) {
  const response = await api.get('/cars/', { params });
  return response.data;
}

export default api;
