import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8010/api";
export const API_ROOT = API_URL.replace(/\/api\/?$/, "");

export const apiClient = axios.create({
  baseURL: API_URL,
});

export function setAuthToken(token) {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
}
