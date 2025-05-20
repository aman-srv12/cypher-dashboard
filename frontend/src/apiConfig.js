// src/api/axiosConfig.ts
import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:8000", // Point to FastAPI backend
});

export default instance;