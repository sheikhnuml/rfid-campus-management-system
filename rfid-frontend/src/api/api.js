// axios instance with simple mock fallback
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://localhost:5000/api",
  timeout: 7000,
});

// request auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// helper: fallbackToMock - returns data if call fails
export async function safeGet(url, mockData = []) {
  try {
    const res = await api.get(url);
    return res.data;
  } catch (e) {
    // console.warn("API fetch failed, using mock for", url);
    return mockData;
  }
}

export default api;
