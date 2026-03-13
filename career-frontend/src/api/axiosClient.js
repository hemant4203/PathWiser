import axios from "axios";

const BASE_URL = "https://pathwiser-backend.onrender.com";

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // helps during Render cold start
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token && token !== "null" && token !== "undefined") {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 403 → Forbidden (no refresh attempt)
    if (error.response?.status === 403) {
      return Promise.reject(error);
    }

    // 401 → Try refresh
    if (error.response?.status === 401 && !originalRequest._retry) {

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axiosClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        // refresh request
        const response = await axios.post(
          `${BASE_URL}/api/auth/refresh`,
          { refreshToken },
          { timeout: 30000 }
        );

        const newAccessToken = response.data.accessToken;
        const newRefreshToken = response.data.refreshToken;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosClient(originalRequest);

      } catch (refreshError) {
        console.log(refreshError);

        // Retry once after 3 seconds (Render cold start fix)
        try {
          await new Promise((resolve) => setTimeout(resolve, 3000));

          const refreshToken = localStorage.getItem("refreshToken");
          const retryResponse = await axios.post(
            `${BASE_URL}/api/auth/refresh`,
            { refreshToken },
            { timeout: 30000 }
          );

          const newAccessToken = retryResponse.data.accessToken;
          const newRefreshToken = retryResponse.data.refreshToken;

          localStorage.setItem("accessToken", newAccessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          processQueue(null, newAccessToken);

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return axiosClient(originalRequest);

        } catch (retryError) {

          processQueue(retryError, null);

          // Hard logout
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("role");
          localStorage.removeItem("username");

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

export default axiosClient;