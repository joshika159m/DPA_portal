import axios from "axios";

const api = axios.create({
  baseURL: "https://dpa-portal.onrender.com/api",
  withCredentials: true,
});

export default api;
