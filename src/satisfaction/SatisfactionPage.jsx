import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import http from "../helpers/http.jsx";
import { Survey } from "./SatisfactionComponents";
import { removeSubmittedSurvey, satisfactionStageLabel, selectPendingSurvey, uniquePendingSurveys } from "./satisfactionState.js";
import "./Satisfaction.css";

const grouped = (survey) => {
  const sections = [];
  (survey.questions || []).forEach((question) => {
    const title = question.section === "Secrétarial and administrative follow-up"
      ? "Secrétariat et suivi administratif"
      : (question.section || "Questionnaire");
    let section = sections.find((item) => item.title === title);
    if (!section) {
      section = { title, questions: [] };
      sections.push(section);
    }
    section.questions.push({
      ...question,
      label: question.question ?? question.label ?? "",
      type: question.type === "rating" ? "star" : question.type === "single_choice" ? "choice" : question.type,
    });
  });

  return { ...survey, title: survey.name, sections };
};

export default function SatisfactionPage() {
  const location = useLocation();
  const requestedStage = new URLSearchParams(location.search).get("stage");
  const requestedSurveyId = location.state?.surveyId;
  const [pending, setPending] = useState([]);
  const [survey, setSurvey] = useState(null);
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [googleUrl, setGoogleUrl] = useState(null);
  const [responseId, setResponseId] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleClicked, setGoogleClicked] = useState(false);

  useEffect(() => {
    let live = true;

    const load = async () => {
      setLoading(true);
      setMessage(null);
      try {
        if (requestedStage) {
          const { data } = await http.get(`/student/satisfaction/stage/${encodeURIComponent(requestedStage)}`);
          if (!live) return;
          const requested = grouped(data?.data || {});
          if (requested.completed) setMessage({ type: "completed" });
          else setSurvey(requested);
          return;
        }

        const { data } = await http.get("/student/satisfaction/pending");
        if (!live) return;
        const surveys = uniquePendingSurveys(data?.data).map(grouped);
        setPending(surveys);
        setSurvey(selectPendingSurvey(surveys, requestedSurveyId));
      } catch (error) {
        if (live) {
          setMessage({
            type: "error",
            text: error.response?.status === 403
              ? "Vous n’avez pas accès à cette enquête."
              : "Une erreur est survenue. Veuillez réessayer.",
          });
        }
      } finally {
        if (live) setLoading(false);
      }
    };

    load();
    return () => { live = false; };
  }, [requestedStage, requestedSurveyId]);

  const questions = useMemo(() => survey?.sections?.flatMap((section) => section.questions) || [], [survey]);

  const chooseSurvey = (nextSurvey) => {
    setSurvey(nextSurvey);
    setValues({});
    setErrors({});
    setMessage(null);
    setGoogleUrl(null);
    setResponseId(null);
  };

  const update = (id, value) => {
    setValues((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: undefined }));
    setMessage(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    questions.filter((question) => question.is_required).forEach((question) => {
      if (values[question.id] === undefined || values[question.id] === "") nextErrors[question.id] = "Ce champ est obligatoire.";
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !survey) return;

    setSubmitting(true);
    try {
      const answers = questions
        .filter((question) => values[question.id] !== undefined && values[question.id] !== "")
        .map((question) => {
          if (question.type === "star") return { question_id: question.id, rating: Number(values[question.id]) };
          if (question.type === "choice") return { question_id: question.id, selected_option: values[question.id] };
          return { question_id: question.id, answer_text: values[question.id] };
        });
      const { data } = await http.post(`/student/satisfaction/${survey.id}/submit`, { answers });
      const saved = data?.data;
      setResponseId(saved?.id || null);
      setGoogleUrl(saved?.google_review_url || null);
      setGoogleClicked(false);
      setMessage({ type: "success" });
      // A stage URL may have been opened directly from an email, so refresh
      // the server list after a successful submit and preserve any other
      // stages that became eligible in the meantime. If that refresh is
      // temporarily unavailable, the confirmed submission still stays final.
      let remaining = removeSubmittedSurvey(pending, survey.id);
      try {
        const pendingResponse = await http.get("/student/satisfaction/pending");
        remaining = removeSubmittedSurvey(
          uniquePendingSurveys(pendingResponse.data?.data).map(grouped),
          survey.id,
        );
      } catch {
        // The next dashboard focus will retry the pending list. Do not turn a
        // successful survey submission into an apparent failure.
      }
      setPending(remaining);
      setSurvey(remaining[0] || null);
      setValues({});
      setErrors({});
    } catch (error) {
      const raw = Object.values(error.response?.data?.errors || {}).flat()[0] || error.response?.data?.message;
      setMessage({ type: /déjà|already/i.test(raw || "") ? "completed" : "error", text: raw || "Une erreur est survenue. Veuillez réessayer." });
    } finally {
      setSubmitting(false);
    }
  };

  const clickGoogle = async () => {
    if (!responseId || !googleUrl || googleLoading || googleClicked) return;
    setGoogleLoading(true);
    try {
      await http.post(`/student/satisfaction/responses/${responseId}/google-click`);
      setGoogleClicked(true);
      window.open(googleUrl, "_blank", "noopener,noreferrer");
    } catch {
      setMessage({ type: "error", text: "Impossible d’ouvrir l’avis Google. Veuillez réessayer." });
    } finally {
      setGoogleLoading(false);
    }
  };

  if (loading) return <main className="sat-page"><div className="sat-container sat-loading">Chargement de votre enquête...</div></main>;
  if (message?.type === "completed") return <main className="sat-page"><div className="sat-container sat-empty"><h2>Vous avez déjà répondu à cette enquête.</h2><p>Merci pour votre participation.</p></div></main>;
  if (message?.type === "error" && !survey) return <main className="sat-page"><div className="sat-container sat-empty"><h2>{message.text}</h2></div></main>;
  if (!survey) return <main className="sat-page"><div className="sat-container sat-empty"><h2>{message?.type === "success" ? "Merci, votre avis a bien été enregistré." : "Aucune enquête de satisfaction n’est disponible pour le moment."}</h2>{message?.type === "success" && googleUrl && <button type="button" className="sat-google-cta" onClick={clickGoogle} disabled={googleLoading || googleClicked}>{googleClicked ? "Avis Google ouvert" : googleLoading ? "Ouverture..." : "Laisser un avis sur Google"}</button>}</div></main>;

  return (
    <main className="sat-page">
      <div className="sat-container">
        {pending.length > 1 && <nav className="sat-stage-tabs" aria-label="Enquêtes disponibles">{pending.map((item) => <button key={item.id} type="button" className={item.id === survey.id ? "is-active" : ""} onClick={() => chooseSurvey(item)}>{satisfactionStageLabel(item.stage)} : {item.title}</button>)}</nav>}
        {message?.type === "success" && <div className="sat-success sat-success--top" role="status">Merci, votre avis a bien été enregistré.</div>}
        <Survey survey={survey} values={values} errors={errors} onChange={update} onSubmit={submit} submitted={false} submitting={submitting} serverMessage={message?.type === "error" ? message.text : null} />
        {message?.type === "success" && googleUrl && <button type="button" className="sat-google-cta" onClick={clickGoogle} disabled={googleLoading || googleClicked}>{googleClicked ? "Avis Google ouvert" : googleLoading ? "Ouverture..." : "Laisser un avis sur Google"}</button>}
      </div>
    </main>
  );
}
