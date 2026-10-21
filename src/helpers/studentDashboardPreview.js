import http from "./http.jsx";

const PREVIEW_SESSION_KEY = "ppf_student_dashboard_preview";
const AUTH_TOKEN_KEY = "ppf_auth_token";

function browserStorage() {
  return typeof window === "undefined" ? null : window.sessionStorage;
}

export function getStudentDashboardPreview() {
  const storage = browserStorage();
  if (!storage) return null;

  try {
    const value = storage.getItem(PREVIEW_SESSION_KEY);
    return value ? JSON.parse(value) : null;
  } catch {
    storage.removeItem(PREVIEW_SESSION_KEY);
    return null;
  }
}

export function isStudentDashboardPreview() {
  return Boolean(getStudentDashboardPreview());
}

export async function startStudentDashboardPreview(studentId, returnTo = "/candidates") {
  if (!studentId) {
    throw new Error("Le dossier élève est introuvable.");
  }

  const { data } = await http.post(`/admin/students/${encodeURIComponent(studentId)}/preview-session`);
  const preview = data?.data;
  if (!preview?.token) {
    throw new Error("Impossible d’ouvrir l’espace élève.");
  }

  const storage = browserStorage();
  const previousToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
  storage?.setItem(PREVIEW_SESSION_KEY, JSON.stringify({
    adminToken: previousToken,
    returnTo,
    studentId: preview.student_id,
    expiresAt: preview.expires_at,
  }));
  window.localStorage.setItem(AUTH_TOKEN_KEY, preview.token);

  return preview;
}

export async function stopStudentDashboardPreview() {
  const preview = getStudentDashboardPreview();
  if (!preview) return null;

  try {
    await http.delete("/student/preview-session");
  } finally {
    if (preview.adminToken) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, preview.adminToken);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    browserStorage()?.removeItem(PREVIEW_SESSION_KEY);
  }

  return preview;
}
