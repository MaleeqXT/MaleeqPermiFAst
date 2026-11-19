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

function previewProfile(candidate) {
  const user = candidate?.user ?? candidate;
  if (!user) return null;

  const profile = {
    id: user.id ?? null,
    first_name: user.first_name ?? user.prenom ?? "",
    last_name: user.last_name ?? user.nom ?? "",
    name: user.name ?? "",
    media: user.media ?? null,
    profile_photo_url: user.profile_photo_url ?? null,
  };

  return profile.first_name || profile.last_name || profile.name ? profile : null;
}

export async function startStudentDashboardPreview(studentId, returnTo = "/candidates", candidate = null) {
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
    profile: previewProfile(candidate),
  }));
  window.localStorage.setItem(AUTH_TOKEN_KEY, preview.token);

  return preview;
}

/**
 * A student-page tab can outlive the temporary preview token while the
 * selected-student context is still present in session storage. Reissue the
 * token with the saved staff credential before loading a student-only action.
 * The staff token is restored if issuing the replacement token fails.
 */
export async function refreshStudentDashboardPreview() {
  const preview = getStudentDashboardPreview();
  const activeToken = window.localStorage.getItem(AUTH_TOKEN_KEY);
  // Older Connecter tabs stored only the selected student. In that state the
  // active credential is the staff token, so it can safely seed the renewed
  // preview session.
  const staffToken = preview?.adminToken || activeToken;
  if (!preview?.studentId || !staffToken) {
    return null;
  }

  window.localStorage.setItem(AUTH_TOKEN_KEY, staffToken);

  try {
    return await startStudentDashboardPreview(preview.studentId, preview.returnTo, preview.profile);
  } catch (error) {
    if (activeToken) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, activeToken);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }
    throw error;
  }
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
