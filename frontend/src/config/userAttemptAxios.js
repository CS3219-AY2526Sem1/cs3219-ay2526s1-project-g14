import axios from "axios";

function getToken() {
  const direct = localStorage.getItem("token");
  const alt = localStorage.getItem("authToken");
  try {
    const u = JSON.parse(localStorage.getItem("user") || "{}");
    if (u?.token) return u.token;
  } catch {}
  return direct || alt || null;
}

const userAttemptAxios = axios.create({
  baseURL: process.env.REACT_APP_USERQUESTION_URL || "http://localhost:5054",
  timeout: 10000,
  withCredentials: true,
});

userAttemptAxios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

userAttemptAxios.interceptors.response.use(
  (response) => Promise.resolve(response),
  async (err) => {
    if (err?.response?.status === 403) {
      window.localStorage.removeItem("state");
      window.location.href = "/login";
    }
    if (err?.response?.status === 401) {
      console.log("Token expired (userAttemptAxios)");
      window.localStorage.removeItem("state");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);

export default userAttemptAxios;