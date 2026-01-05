// NestJS API client
import { createAuthenticatedAxios } from "./axiosFactory";

const NEST_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/";

// Create axios instance for NestJS backend
const api = createAuthenticatedAxios(NEST_API_BASE_URL);

export default api;
