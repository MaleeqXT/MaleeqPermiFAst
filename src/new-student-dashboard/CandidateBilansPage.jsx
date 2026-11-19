import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import StudentHeader from "./StudentHeader.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import BilansPage from "../monitordashboard/BilansPage.jsx";
import http from "../helpers/http.jsx";
import { getStudentDashboardPreview, refreshStudentDashboardPreview } from "../helpers/studentDashboardPreview.js";
import "./CandidateDashboard.css";

export default function CandidateBilansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bilan, setBilan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const authenticatedStudentId = useSelector((state) => state.auth?.user?.student?.id ?? null);
  // The preview session is the source of truth for a staff "Connecter"
  // session. The authenticated profile is a safe fallback after a page
  // refresh, when React has already restored the temporary student identity.
  const previewStudentId = getStudentDashboardPreview()?.studentId ?? authenticatedStudentId;
  const previewParams = previewStudentId ? { student_id: previewStudentId } : undefined;

  const decide = async (decision, signature = null) => {
    const { data } = await http.post("/student/bilans/decision", { decision, ...(signature ? { signature } : {}) });
    const saved = data?.data ?? null;
    setBilan(saved);
    return saved;
  };

  useEffect(() => {
    let active = true;
    const loadBilan = async () => {
      try {
        let { data } = await http.get("/student/bilans", { params: previewParams });
        const fetchedBilan = data?.data ?? null;
        const preview = getStudentDashboardPreview();

        // An old Connecter tab can retain the selected student ID while the
        // browser has switched back to the staff token. Refresh that preview
        // once, then retry so the decision remains a real student action.
        if (preview?.studentId
          && fetchedBilan?.id
          && fetchedBilan?.shared_at
          && fetchedBilan?.decision_status === "pending"
          && !fetchedBilan?.can_student_decide) {
          const renewedPreview = await refreshStudentDashboardPreview();
          if (renewedPreview) {
            ({ data } = await http.get("/student/bilans", { params: { student_id: renewedPreview.student_id } }));
          }
        }

        if (active) setBilan(data?.data ?? null);
      } catch {
        if (active) setError("Impossible de charger vos bilans pour le moment.");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadBilan();
    return () => { active = false; };
  }, [previewStudentId]);

  return (
    <div className="nsd-root">
      <StudentSidebar
        activePath="/student-bilans"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="nsd-main">
        <StudentHeader
          title=""
          onMenuOpen={() => setSidebarOpen(true)}
        />
        <BilansPage
          key={bilan?.updated_at ?? "empty"}
          initialBilan={bilan}
          readOnly
          loading={loading}
          error={error}
          onDecision={decide}
        />
      </main>
    </div>
  );
}
