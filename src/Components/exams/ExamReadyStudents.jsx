import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import http from "../../helpers/http.jsx";
import "./ExamReadyStudents.css";

const formatDate = (date) => (date ? new Date(date).toLocaleDateString("fr-FR") : "—");

export default function ExamReadyStudents() {
  const navigate = useNavigate();
  const selectedZoneId = useSelector((state) => state.schools.selected?.id ?? null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    http.get("/admin/exams", {
      params: selectedZoneId ? { zone_id: selectedZoneId } : undefined,
    })
      .then(({ data }) => {
        if (active) setStudents(Array.isArray(data?.ready_students) ? data.ready_students : []);
      })
      .catch(() => {
        if (active) {
          setStudents([]);
          setError("Impossible de charger les élèves prêts pour l’examen.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [selectedZoneId]);

  return (
    <main className="exam-ready-page">
      <header className="exam-ready-page__heading">
        <p>Examens</p>
        <h1>Élèves prêts pour l’examen</h1>
      </header>

      <section className="exam-ready-card" aria-labelledby="exam-ready-title">
        <header className="exam-ready-card__header">
          <div>
            <h2 id="exam-ready-title">Candidats déclarés prêts</h2>
            <p>Déclarés prêts par leur moniteur. Ouvrez le dossier pour préparer leur examen.</p>
          </div>
          <span className="exam-ready-card__count" aria-label={`${students.length} élève${students.length > 1 ? "s" : ""}`}>{students.length}</span>
        </header>

        {error && <p className="exam-ready-card__notice exam-ready-card__notice--error">{error}</p>}
        <div className="exam-ready-card__table-wrap">
          <table className="exam-ready-card__table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Moniteur</th>
                <th>Déclaré le</th>
                <th>Heures complémentaires</th>
                <th>Fréquence</th>
                <th>Observation</th>
                <th><span className="sr-only">Action</span></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="exam-ready-card__empty">Chargement des élèves prêts…</td></tr>
              ) : !students.length ? (
                <tr><td colSpan={7} className="exam-ready-card__empty">Aucun élève prêt pour l’examen.</td></tr>
              ) : students.map((student) => (
                <tr key={student.id}>
                  <td><strong>{student.candidate}</strong>{student.phone && <small>{student.phone}</small>}</td>
                  <td>{student.monitor || "—"}</td>
                  <td>{formatDate(student.ready_at)}</td>
                  <td>{student.additional_hours ?? "—"}</td>
                  <td>{student.practice_frequency || "—"}</td>
                  <td className="exam-ready-card__observation">{student.observation || "—"}</td>
                  <td><button type="button" className="exam-ready-card__action" onClick={() => navigate(`/candidate-info/${student.student_id}`)}>Voir le dossier</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
