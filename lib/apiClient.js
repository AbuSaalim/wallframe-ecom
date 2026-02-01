import axios from "axios";
import { auth } from "@/lib/firebase";

/**
 * Create axios instance with automatic Firebase token injection
 * All requests to /api/** will automatically include the Firebase ID token
 */
const apiClient = axios.create();

// Interceptor to add Firebase token to all requests
apiClient.interceptors.request.use(async (config) => {
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting Firebase token:", error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor to handle 401 errors (token expired, not authenticated)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or user not authenticated
      console.warn("Authentication failed - redirecting to login");
      // Optional: redirect to login
      // window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
