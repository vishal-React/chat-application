import axios from "axios";
const baseURL = import.meta.env.VITE_baseURL;

const API = axios.create({
  baseURL: baseURL,
});

export const fetchdata = () => API.get("/");

export const sendOTP = (data) => API.post("/send-otp", data);

export const verifyOTP = (data) => API.post("/verify-otp", data);

export const verifyUser = (data) => API.post("/verify-user", data);
