import axios from "axios";

// This is used to tell the browser to send cookies with all requests by creating an instance
// that points to the backend
export const axiosInstance = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true, // This is what allows the jwt cookie to move back and forth
});