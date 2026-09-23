import Candidates from "../../../Components/candidates/Candidates.jsx";

// Use the same live student list as the admin dashboard, while retaining
// secretary-specific navigation for details and dashboard preview.
export default function SecretaryCandidates() {
  return <Candidates isSecretaryDashboard />;
}
