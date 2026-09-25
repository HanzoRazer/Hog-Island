import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const guestLogin = (name) =>
  axios.post(`${API}/auth/guest`, { name }).then((r) => r.data);

export const getLeaderboard = (limit = 50) =>
  axios.get(`${API}/leaderboard`, { params: { limit } }).then((r) => r.data);

export const submitScore = (payload) =>
  axios.post(`${API}/scores`, payload).then((r) => r.data);

export const getBoothProgress = (playerId) =>
  axios.get(`${API}/booth/progress/${playerId}`).then((r) => r.data);

export const submitBoothResult = (payload) =>
  axios.post(`${API}/booth/results`, payload).then((r) => r.data);

export const getBoothLeaderboard = (level, limit = 20) =>
  axios.get(`${API}/booth/leaderboard`, { params: { level, limit } }).then((r) => r.data);
