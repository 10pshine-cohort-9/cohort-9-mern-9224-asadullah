import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL;

if (!baseURL && !import.meta.env.DEV) {
  throw new Error("VITE_API_BASE_URL is missing");
}

const api = axios.create({
  baseURL: baseURL || "http://localhost:3000/api",
});



api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api