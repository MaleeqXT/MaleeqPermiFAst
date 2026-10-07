import { useEffect, useState } from "react";
import StudentHeader from "./StudentHeader.jsx";
import StudentSidebar from "./StudentSidebar.jsx";
import BilansPage from "../monitordashboard/BilansPage.jsx";
import http from "../helpers/http.jsx";
import "./CandidateDashboard.css";

export default function CandidateBilansPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bilan, setBilan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    http.get("/student/bilans")
      .then(({ data }) => active && setBilan(data?.data ?? null))
      .catch(() => active && setError("Impossible de charger vos bilans pour le moment."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

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
          initialEvaluations={bilan?.evaluations ?? {}}
          initialHours={bilan?.hours ?? { bilan1: "0", bilan2: "0" }}
          readOnly
          loading={loading}
          error={error}
        />
      </main>
    </div>
  );
}
