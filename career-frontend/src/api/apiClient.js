import axios from 'axios';

const apiClient = axios.create({ baseURL: "https://pathwiser-backend.onrender.com" });

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => error ? prom.reject(error) : prom.resolve(token));
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = window.accessToken; // Attach from memory
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((res, rej) => failedQueue.push({ resolve: res, reject: rej }))
          .then(token => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      const refreshToken = localStorage.getItem('refreshToken');
      try {
        const res = await axios.post('https://pathwiser-backend.onrender.com/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data;
        window.accessToken = accessToken;
        localStorage.setItem('refreshToken', newRefresh);
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = 'Bearer ' + accessToken;
        return apiClient(originalRequest); // Retry original call
      } catch (err) {
        processQueue(err, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;