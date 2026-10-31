import { apiClient } from "./api";

export async function createSession(payload) {
  const { data } = await apiClient.post("/sessions", payload);
  return data;
}

export async function saveDrawing(payload) {
  const { data } = await apiClient.post("/drawings", payload);
  return data;
}

export async function updateDrawing(id, payload) {
  const { data } = await apiClient.put(`/drawings/${id}`, payload);
  return data;
}

export async function getDrawings() {
  const { data } = await apiClient.get("/drawings");
  return data;
}

export async function getDrawing(id) {
  const { data } = await apiClient.get(`/drawings/${id}`);
  return data;
}

export async function deleteDrawing(id) {
  const { data } = await apiClient.delete(`/drawings/${id}`);
  return data;
}

export async function recognizeDrawing(id) {
  const { data } = await apiClient.post(`/drawings/${id}/recognize`);
  return data;
}

export async function exportDrawing(id, file_format) {
  const { data } = await apiClient.post(`/drawings/${id}/export`, { file_format });
  return data;
}

export async function saveGestureLog(payload) {
  const { data } = await apiClient.post("/gesture-logs", payload);
  return data;
}

