import axios from "axios";

const api = axios.create({
  baseURL: "https://dpa-portal.onrender.com",
  withCredentials: true,
});

export default api;
