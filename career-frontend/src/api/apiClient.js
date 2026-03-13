import axios from "axios";

const BASE_URL = "https://pathwiser-backend.onrender.com";

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) =>
    error ? prom.reject(error) : prom.resolve(token)
  );
  failedQueue = [];
};

apiClient.interceptors.request.use((config) => {
  const token = window.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) =>
          failedQueue.push({ resolve, reject })
        ).then((token) => {
          originalRequest.headers.Authorization = "Bearer " + token;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      try {

        const res = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { timeout: 30000 }
        );

        const { accessToken, refreshToken: newRefresh } = res.data;

        window.accessToken = accessToken;
        localStorage.setItem("refreshToken", newRefresh);

        processQueue(null, accessToken);

        originalRequest.headers.Authorization = "Bearer " + accessToken;

        return apiClient(originalRequest);

      } catch (err) {
        console.log(err);

        // retry once after 3 seconds (Render wake-up)
        try {

          await new Promise((resolve) => setTimeout(resolve, 3000));

          const retryRes = await axios.post(
            `${BASE_URL}/api/auth/refresh`,
            { refreshToken },
            { timeout: 30000 }
          );

          const { accessToken, refreshToken: newRefresh } = retryRes.data;

          window.accessToken = accessToken;
          localStorage.setItem("refreshToken", newRefresh);

          processQueue(null, accessToken);

          originalRequest.headers.Authorization = "Bearer " + accessToken;

          return apiClient(originalRequest);

        } catch (retryError) {

          processQueue(retryError, null);

          localStorage.clear();
          window.location.href = "/login";

          return Promise.reject(retryError);
        }

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;