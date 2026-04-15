import api from "./axios";

export const loginApi = (data) => api.post("/auth/login", data);
export const refreshApi = (refreshToken) => api.post("/auth/refresh", { refreshToken });
