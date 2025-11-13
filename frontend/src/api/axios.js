// src/api/axios.js
import axios from "axios";

// Set baseURL to the root of the server
const base = import.meta.env.VITE_SERVER_URL || "http://localhost:8000"; 
const instance = axios.create({
  baseURL: base, // <--- **FIXED: Removed the automatic '/api' append**
  headers: { "Content-Type": "application/json" }
});

export default instance;