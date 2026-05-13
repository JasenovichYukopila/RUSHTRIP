import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  timeout: 60000,
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

export async function searchFlights(params) {
  const response = await api.get('/flights/', { params });
  return response.data;
}

export async function searchHotels(params) {
  const response = await api.get('/hotels/', { params });
  return response.data;
}

export async function searchAirports(params) {
  const response = await api.get('/airports/', { params });
  return response.data;
}

export default api;
