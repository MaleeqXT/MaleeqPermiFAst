import http from "../helpers/http.jsx";

// Every RdvPermis request goes through Laravel. This module must never call
// the government provider directly or handle OAuth credentials in the browser.
const rdvPermisApi = {
  status: () => http.get("/rdvpermis/status"),
  connect: () => http.post("/rdvpermis/connect"),
  currentSchool: () => http.get("/rdvpermis/current-school"),
  employees: () => http.get("/rdvpermis/employees"),

  searchCentres: (payload) => http.post("/rdvpermis/centres/recherche", payload),
  centreDetails: (centreId) => http.get(`/rdvpermis/centres/${encodeURIComponent(centreId)}`),
  searchPlanning: (payload) => http.post("/rdvpermis/planning/recherche", payload),
  searchEligibleCandidates: (payload) => http.post("/rdvpermis/candidats/recherche", payload),
  searchMandatedCandidates: (payload) => http.post("/rdvpermis/candidats-mandats/recherche", payload),

  listExams: (params) => http.get("/rdvpermis/examens", { params }),
  examDetails: (examId) => http.get(`/rdvpermis/examens/${encodeURIComponent(examId)}`),
  cancelExam: (examId) => http.delete(`/rdvpermis/examens/${encodeURIComponent(examId)}`),
  permutableExams: (params) => http.get("/rdvpermis/examens/permutables", { params }),
  replacementAllowance: (params) => http.get("/rdvpermis/examens/nombre-de-remplacement", { params }),
  replaceExamCandidate: (payload) => http.post("/rdvpermis/examens/remplacement", payload),
  permuteExams: (payload) => http.post("/rdvpermis/examens/permutation", payload),

  listPaniers: () => http.get("/rdvpermis/paniers"),
  panierDetails: (panierId) => http.get(`/rdvpermis/paniers/${encodeURIComponent(panierId)}`),
  createPanier: (payload = {}) => http.post("/rdvpermis/paniers", payload),
  addPanierSlot: (panierId, payload) => http.post(`/rdvpermis/paniers/${encodeURIComponent(panierId)}/creneaux`, payload),
  removePanierSlot: (panierId, creneauId) => http.delete(
    `/rdvpermis/paniers/${encodeURIComponent(panierId)}/creneaux/${encodeURIComponent(creneauId)}`,
  ),
  assignPanierCandidate: (panierId, creneauId, payload) => http.put(
    `/rdvpermis/paniers/${encodeURIComponent(panierId)}/creneaux/${encodeURIComponent(creneauId)}/candidat`,
    payload,
  ),
  validatePanier: (panierId) => http.post(`/rdvpermis/paniers/${encodeURIComponent(panierId)}/valider`),
  deletePanier: (panierId) => http.delete(`/rdvpermis/paniers/${encodeURIComponent(panierId)}`),

  listLocalStudents: (params = {}) => http.get("/admin/users/students", { params }),
  listAllLocalStudents: async () => {
    const students = [];
    let page = 1;
    let lastPage;
    do {
      const response = await rdvPermisApi.listLocalStudents({ page, per_page: 100, status: 1 });
      const pagination = response.data?.data ?? response.data;
      students.push(...(Array.isArray(pagination) ? pagination : pagination?.data ?? []));
      lastPage = Number(pagination?.last_page) || 1;
      page += 1;
    } while (page <= lastPage);
    return { data: students };
  },
  createMandate: (studentId) => http.post(`/admin/students/${encodeURIComponent(studentId)}/rdvpermis/mandate`),
};

export default rdvPermisApi;
