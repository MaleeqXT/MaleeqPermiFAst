import http from "../helpers/http.jsx";

// Laravel owns OAuth and every provider interaction. This module deliberately
// contains only first-party /api/livret calls and never handles provider tokens.
const livretNumeriqueApi = {
  status: () => http.get("/livret/sync"),
  failures: () => http.get("/livret/sync/failures"),
  contracts: () => http.get("/livret/contracts"),
  contract: (id) => http.get(`/livret/contracts/${encodeURIComponent(id)}`),
  createContract: (payload) => http.post("/livret/contracts", payload),
  updateContract: (id, payload) => http.put(`/livret/contracts/${encodeURIComponent(id)}`, payload),
  deleteContract: (id) => http.delete(`/livret/contracts/${encodeURIComponent(id)}`),
  retryContract: (id) => http.post(`/livret/contracts/${encodeURIComponent(id)}/retry`),
  lessons: () => http.get("/livret/lessons"),
  createLesson: (payload) => http.post("/livret/lessons", payload),
  updateLesson: (id, payload) => http.put(`/livret/lessons/${encodeURIComponent(id)}`, payload),
  deleteLesson: (id) => http.delete(`/livret/lessons/${encodeURIComponent(id)}`),
  retryLesson: (id) => http.post(`/livret/lessons/${encodeURIComponent(id)}/retry`),
  trainers: () => http.get("/livret/trainers"),
  simulators: () => http.get("/livret/simulators"),
};

export default livretNumeriqueApi;
