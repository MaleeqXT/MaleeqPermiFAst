import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FiArrowRight,
  FiAward,
  FiBarChart2,
  FiBookOpen,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiRefreshCw,
  FiSettings,
  FiShield,
  FiUser,
} from "react-icons/fi";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import http from "../../helpers/http.jsx";
import "./CPFPositioningPage.css";

const QUESTIONS = {
  drivingFrequency: [
    { id: 1, label: "Oui, régulièrement" },
    { id: 2, label: "Oui, occasionnellement" },
    { id: 3, label: "Non, jamais" },
  ],
  drivingContext: [
    { id: 1, label: "Conduite accompagnée" },
    { id: 2, label: "Conduite supervisée" },
    { id: 3, label: "Auto-école (cours interrompus)" },
    { id: 4, label: "Autre" },
  ],
  codeStatus: [
    { id: 1, label: "Oui, encore valide" },
    { id: 2, label: "Oui, mais expiré" },
    { id: 3, label: "Non, jamais" },
  ],
  roadSignsKnowledge: [
    { id: 1, label: "Très bonne" },
    { id: 2, label: "Moyenne" },
    { id: 3, label: "Faible" },
  ],
  yesNo: [
    { id: 1, label: "Oui" },
    { id: 2, label: "Non" },
  ],
  busMarking: [
    { id: 1, label: "Interdiction de stationner" },
    { id: 2, label: "Zone d’arrêt temporaire" },
    { id: 3, label: "Priorité Piétonne" },
  ],
  difficulties: [
    { id: 1, label: "La coordination des pédales (embrayage, frein, accélérateur)" },
    { id: 2, label: "L’anticipation des dangers" },
    { id: 3, label: "L’adaptation à la circulation" },
  ],
  estimatedLevel: [
    { id: 1, label: "Débutant (30h et plus recommandées)" },
    { id: 2, label: "Intermédiaire (20-25h recommandées)" },
    { id: 3, label: "Expérimenté (10-15h recommandées)" },
  ],
};

const REQUIRED_RADIOS = [
  "first",
  "two",
  "three",
  "four",
  "five",
  "sex",
  "seven",
  "eight",
  "nine",
  "ten",
  "eleven",
  "twelve",
];

const readCpfRequest = () => {
  try {
    const value = JSON.parse(window.sessionStorage.getItem("ppf-cpf-request") || "{}");
    return value && typeof value === "object" ? value : {};
  } catch {
    return {};
  }
};

const createInitialForm = (searchParams) => {
  const request = readCpfRequest();
  return {
  name: request.name || searchParams.get("name") || "",
  date_naissance: searchParams.get("date_naissance") || "",
  phone: request.phone || searchParams.get("phone") || "",
  email: request.email || searchParams.get("email") || "",
  type: searchParams.get("type") || "",
  first: "",
  two: "",
  two_feedback: "",
  three: "",
  four: "",
  five: "",
  sex: "",
  seven: "",
  eight: "",
  nine: "",
  ten: "",
  eleven: "",
  twelve: "",
  commentaire_formateur: "",
  nb_heur: "",
  date_evaluation: "",
  signature: "",
};
};

const calculateRecommendedHours = (form) => {
  let score = 0;

  if (Number(form.first) === 1) score += 2;
  else if (Number(form.first) === 2) score += 1;

  if (Number(form.three) === 1) score += 2;
  else if (Number(form.three) === 2) score += 1;

  if (Number(form.four) === 1) score += 2;
  else if (Number(form.four) === 2) score += 1;

  ["seven", "eight", "nine", "ten"].forEach((key) => {
    if (Number(form[key]) === 1) score += 2;
  });

  if (score >= 10) return 15;
  if (score >= 6) return 25;
  return 30;
};

const TextField = ({ id, label, error, className = "", ...inputProps }) => (
  <label className={`cpf-test-field ${className}`} htmlFor={id}>
    <span className="cpf-test-field__label">{label}</span>
    <input
      id={id}
      className={`cpf-test-field__control${error ? " cpf-test-field__control--error" : ""}`}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...inputProps}
    />
    {error && (
      <span className="cpf-test-field__error" id={`${id}-error`}>
        {error}
      </span>
    )}
  </label>
);

const RadioGroup = ({ name, legend, options, value, error, onChange }) => (
  <fieldset
    id={name}
    className={`cpf-test-question${error ? " cpf-test-question--error" : ""}`}
    aria-describedby={error ? `${name}-error` : undefined}
  >
    <legend className="cpf-test-question__legend">{legend}</legend>
    <div className="cpf-test-options">
      {options.map((option) => (
        <label className="cpf-test-option" key={option.id}>
          <input
            type="radio"
            name={name}
            value={option.id}
            checked={value === String(option.id)}
            onChange={onChange}
          />
          <span className="cpf-test-option__marker" aria-hidden="true">
            <FiCheck />
          </span>
          <span className="cpf-test-option__label">{option.label}</span>
        </label>
      ))}
    </div>
    {error && (
      <span className="cpf-test-field__error" id={`${name}-error`}>
        {error}
      </span>
    )}
  </fieldset>
);

const FormSection = ({ number, icon: Icon, eyebrow, title, children }) => (
  <section className="cpf-test-form-section">
    <header className="cpf-test-form-section__header">
      <span className="cpf-test-form-section__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="cpf-test-form-section__number">{number}</span>
      <div>
        <p className="cpf-test-form-section__eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
    </header>
    <div className="cpf-test-form-section__body">{children}</div>
  </section>
);

const SignaturePad = ({ value, error, onChange }) => {
  const canvasRef = useRef(null);
  const drawingRef = useRef(false);

  const configureCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    canvas.width = Math.round(rect.width * ratio);
    canvas.height = Math.round(rect.height * ratio);

    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.lineWidth = 2.4;
    context.strokeStyle = "#17233d";

    if (value) {
      const savedSignature = new Image();
      savedSignature.onload = () => {
        context.drawImage(savedSignature, 0, 0, rect.width, rect.height);
      };
      savedSignature.src = value;
    }
  }, [value]);

  useEffect(() => {
    configureCanvas();
    const canvas = canvasRef.current;
    if (!canvas || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver(configureCanvas);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [configureCanvas]);

  const getPoint = (event) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };

  const handlePointerDown = (event) => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const point = getPoint(event);
    drawingRef.current = true;
    canvas.setPointerCapture(event.pointerId);
    context.beginPath();
    context.moveTo(point.x, point.y);
  };

  const handlePointerMove = (event) => {
    if (!drawingRef.current) return;
    const context = canvasRef.current.getContext("2d");
    const point = getPoint(event);
    context.lineTo(point.x, point.y);
    context.stroke();
  };

  const finishSignature = (event) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    onChange(canvas.toDataURL("image/png"));
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  };

  return (
    <div className="cpf-test-signature">
      <div className={`cpf-test-signature__surface${error ? " cpf-test-signature__surface--error" : ""}`}>
        <canvas
          ref={canvasRef}
          className="cpf-test-signature__canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishSignature}
          onPointerCancel={finishSignature}
          aria-label="Zone de signature"
          role="img"
        />
        {!value && <span className="cpf-test-signature__hint">Signez ici avec votre doigt ou votre souris</span>}
      </div>
      <div className="cpf-test-signature__footer">
        {error ? (
          <span className="cpf-test-field__error">{error}</span>
        ) : (
          <span className="cpf-test-signature__secure"><FiShield /> Signature sécurisée</span>
        )}
        <button type="button" className="cpf-test-signature__clear" onClick={clearSignature}>
          <FiRefreshCw /> Effacer
        </button>
      </div>
    </div>
  );
};

const CPFPositioningPage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState(() => createInitialForm(searchParams));
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    document.title = "Test de positionnement CPF | PassPermisFacile";
  }, []);

  const completedAnswers = useMemo(
    () => REQUIRED_RADIOS.filter((key) => form[key]).length,
    [form],
  );

  const progress = Math.round((completedAnswers / REQUIRED_RADIOS.length) * 100);

  const setField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setSubmitted(false);
  };

  const validate = () => {
    const nextErrors = {};
    const requiredDetails = {
      name: "Indiquez le nom et le prénom de l’élève.",
      date_naissance: "Indiquez la date de naissance.",
      phone: "Indiquez un numéro de téléphone.",
      email: "Indiquez une adresse e-mail.",
      type: "Indiquez la catégorie de permis visée.",
      date_evaluation: "Indiquez la date de l’évaluation.",
    };

    Object.entries(requiredDetails).forEach(([key, message]) => {
      if (!form[key].trim()) nextErrors[key] = message;
    });

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Saisissez une adresse e-mail valide.";
    }

    REQUIRED_RADIOS.forEach((key) => {
      if (!form[key]) nextErrors[key] = "Choisissez une réponse.";
    });

    if (form.two === "4" && !form.two_feedback.trim()) {
      nextErrors.two_feedback = "Précisez votre autre expérience de conduite.";
    }

    if (!form.signature) nextErrors.signature = "La signature est obligatoire.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstError = Object.keys(nextErrors)[0];
      requestAnimationFrame(() => {
        document.getElementById(firstError)?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    const recommendedHours = calculateRecommendedHours(form);
    const cpfRequest = readCpfRequest();
    if (!cpfRequest.zone_id || !cpfRequest.zone_name) {
      setSubmitError("Veuillez d’abord compléter le formulaire CPF et sélectionner une zone de conduite.");
      return;
    }
    const completedForm = { ...form, nb_heur: recommendedHours };
    setSubmitting(true);
    setSubmitError("");
    try {
      await http.post("/public/cpf/positioning", {
        test_pro: {
          ...cpfRequest,
          name: completedForm.name,
          email: completedForm.email,
          phone: completedForm.phone,
          signature: completedForm.signature,
          recommended_hours: recommendedHours,
          answers: completedForm,
        },
      });
      window.sessionStorage.removeItem("ppf-cpf-request");
      setForm(completedForm);
      setSubmitted(true);
      requestAnimationFrame(() => {
        document.getElementById("cpf-test-result")?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Impossible d’enregistrer votre demande CPF. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="cpf-test-page">
        <section className="cpf-test-hero" aria-labelledby="cpf-test-title">
          <div className="cpf-test-hero__inner">
            <div className="cpf-test-hero__copy">
              <span className="cpf-test-eyebrow"><FiShield /> ÉVALUATION CPF EN LIGNE</span>
              <h1 id="cpf-test-title">
                Test de <span>positionnement</span>
              </h1>
              <p>
                Estimez le volume d’heures de conduite adapté à votre niveau avant
                l’acceptation de votre dossier CPF.
              </p>
              <div className="cpf-test-hero__meta">
                <span><FiClock /> Environ 8 minutes</span>
                <span><FiCheckCircle /> Résultat immédiat</span>
              </div>
            </div>

            <div className="cpf-test-hero__badge" aria-hidden="true">
              <span>MODÈLE D’ÉVALUATION</span>
              <strong>CPF</strong>
              <small>PERMIS DE CONDUIRE</small>
            </div>
          </div>
        </section>

        <div className="cpf-test-layout">
          <aside className="cpf-test-aside">
            <div className="cpf-test-aside__card">
              <span className="cpf-test-aside__icon"><FiAward /></span>
              <h2>Votre évaluation</h2>
              <p>
                Le test de positionnement en ligne, aussi appelé évaluation de niveau,
                aide à déterminer le parcours le plus adapté.
              </p>
              <div className="cpf-test-progress" aria-label={`Progression ${progress} %`}>
                <div className="cpf-test-progress__top">
                  <span>Questions complétées</span>
                  <strong>{progress}%</strong>
                </div>
                <span className="cpf-test-progress__track">
                  <span style={{ width: `${progress}%` }} />
                </span>
              </div>
              <ul>
                <li><FiCheck /> Informations personnelles</li>
                <li><FiCheck /> Expérience de conduite</li>
                <li><FiCheck /> Connaissances du Code</li>
                <li><FiCheck /> Maîtrise technique</li>
                <li><FiCheck /> Résultat et signature</li>
              </ul>
            </div>
          </aside>

          <form className="cpf-test-form" onSubmit={handleSubmit} noValidate>
            <div className="cpf-test-intro">
              <FiBookOpen aria-hidden="true" />
              <p>
                <strong>Modèle d’Évaluation de Niveau – Permis de Conduire CPF.</strong>
                Répondez avec précision afin d’obtenir une estimation cohérente avec votre expérience.
              </p>
            </div>

            <FormSection number="01" icon={FiUser} eyebrow="DOSSIER ÉLÈVE" title="Informations de l’élève">
              <div className="cpf-test-fields-grid">
                <TextField
                  id="name"
                  label="Nom et Prénom"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  error={errors.name}
                  onChange={(event) => setField("name", event.target.value)}
                />
                <TextField
                  id="date_naissance"
                  label="Date de naissance"
                  type="date"
                  autoComplete="bday"
                  value={form.date_naissance}
                  error={errors.date_naissance}
                  onChange={(event) => setField("date_naissance", event.target.value)}
                />
                <TextField
                  id="phone"
                  label="Numéro de téléphone"
                  type="tel"
                  autoComplete="tel"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(event) => setField("phone", event.target.value)}
                />
                <TextField
                  id="email"
                  label="Adresse e-mail"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  error={errors.email}
                  onChange={(event) => setField("email", event.target.value)}
                />
                <TextField
                  id="type"
                  label="Catégorie de permis visée"
                  type="text"
                  placeholder="Ex. Permis B, Permis A2"
                  value={form.type}
                  error={errors.type}
                  onChange={(event) => setField("type", event.target.value)}
                  className="cpf-test-field--wide"
                />
              </div>
            </FormSection>

            <FormSection number="02" icon={FiUser} eyebrow="PARCOURS" title="Expérience de conduite">
              <RadioGroup
                name="first"
                legend="1. Avez-vous déjà conduit un véhicule (auto/moto) ?"
                options={QUESTIONS.drivingFrequency}
                value={form.first}
                error={errors.first}
                onChange={(event) => setField("first", event.target.value)}
              />
              <RadioGroup
                name="two"
                legend="2. Si oui, dans quel cadre ?"
                options={QUESTIONS.drivingContext}
                value={form.two}
                error={errors.two}
                onChange={(event) => setField("two", event.target.value)}
              />
              {form.two === "4" && (
                <TextField
                  id="two_feedback"
                  label="Autre"
                  type="text"
                  placeholder="Précisez votre expérience"
                  value={form.two_feedback}
                  error={errors.two_feedback}
                  onChange={(event) => setField("two_feedback", event.target.value)}
                />
              )}
            </FormSection>

            <FormSection number="03" icon={FiBookOpen} eyebrow="CONNAISSANCES" title="Code de la Route">
              <RadioGroup
                name="three"
                legend="3. Avez-vous déjà obtenu l’examen du Code ?"
                options={QUESTIONS.codeStatus}
                value={form.three}
                error={errors.three}
                onChange={(event) => setField("three", event.target.value)}
              />
              <RadioGroup
                name="four"
                legend="4. Votre connaissance des panneaux de signalisation est-elle :"
                options={QUESTIONS.roadSignsKnowledge}
                value={form.four}
                error={errors.four}
                onChange={(event) => setField("four", event.target.value)}
              />
              <RadioGroup
                name="five"
                legend="5. Savez-vous ce que signifie un panneau de priorité ?"
                options={QUESTIONS.yesNo}
                value={form.five}
                error={errors.five}
                onChange={(event) => setField("five", event.target.value)}
              />
              <RadioGroup
                name="sex"
                legend="6. Que signifie un marquage au sol en zigzag devant un arrêt de bus ?"
                options={QUESTIONS.busMarking}
                value={form.sex}
                error={errors.sex}
                onChange={(event) => setField("sex", event.target.value)}
              />
            </FormSection>

            <FormSection number="04" icon={FiSettings} eyebrow="AUTO-ÉVALUATION" title="Maîtrise technique du véhicule">
              <p className="cpf-test-section-note">7. Êtes-vous à l’aise avec les situations suivantes ?</p>
              <RadioGroup
                name="seven"
                legend="Le démarrage et l’arrêt du véhicule"
                options={QUESTIONS.yesNo}
                value={form.seven}
                error={errors.seven}
                onChange={(event) => setField("seven", event.target.value)}
              />
              <RadioGroup
                name="eight"
                legend="Les changements de vitesse"
                options={QUESTIONS.yesNo}
                value={form.eight}
                error={errors.eight}
                onChange={(event) => setField("eight", event.target.value)}
              />
              <RadioGroup
                name="nine"
                legend="Les manœuvres (créneau, marche arrière)"
                options={QUESTIONS.yesNo}
                value={form.nine}
                error={errors.nine}
                onChange={(event) => setField("nine", event.target.value)}
              />
              <RadioGroup
                name="ten"
                legend="La gestion des distances de sécurité"
                options={QUESTIONS.yesNo}
                value={form.ten}
                error={errors.ten}
                onChange={(event) => setField("ten", event.target.value)}
              />
              <RadioGroup
                name="eleven"
                legend="8. Avez-vous des difficultés avec :"
                options={QUESTIONS.difficulties}
                value={form.eleven}
                error={errors.eleven}
                onChange={(event) => setField("eleven", event.target.value)}
              />
            </FormSection>

            <FormSection number="05" icon={FiBarChart2} eyebrow="SYNTHÈSE" title="Résultat de l’évaluation">
              <RadioGroup
                name="twelve"
                legend="Niveau estimé :"
                options={QUESTIONS.estimatedLevel}
                value={form.twelve}
                error={errors.twelve}
                onChange={(event) => setField("twelve", event.target.value)}
              />

              <label className="cpf-test-field" htmlFor="commentaire_formateur">
                <span className="cpf-test-field__label">Commentaire du formateur</span>
                <textarea
                  id="commentaire_formateur"
                  className="cpf-test-field__control cpf-test-field__textarea"
                  rows="4"
                  placeholder="Ajoutez un commentaire sur le niveau ou les besoins de l’élève"
                  value={form.commentaire_formateur}
                  onChange={(event) => setField("commentaire_formateur", event.target.value)}
                />
              </label>

              <TextField
                id="date_evaluation"
                label="Évaluation réalisée le"
                type="date"
                value={form.date_evaluation}
                error={errors.date_evaluation}
                onChange={(event) => setField("date_evaluation", event.target.value)}
              />

              <div id="signature" className="cpf-test-signature-block">
                <div className="cpf-test-signature-block__heading">
                  <span><FiEdit3 /> Signature</span>
                  <small>Champ obligatoire</small>
                </div>
                <SignaturePad
                  value={form.signature}
                  error={errors.signature}
                  onChange={(signature) => setField("signature", signature)}
                />
              </div>
            </FormSection>

            {submitted && (
              <section className="cpf-test-result" id="cpf-test-result" aria-live="polite">
                <span className="cpf-test-result__icon"><FiAward /></span>
                <div>
                  <p>ESTIMATION PERSONNALISÉE</p>
                  <h2>{form.nb_heur} heures recommandées</h2>
                  <span>
                    Votre évaluation est complète. Cette estimation constitue une base de travail
                    qui pourra être confirmée par un formateur.
                  </span>
                </div>
              </section>
            )}

            {submitError && <p className="cpf-test-submit-error" role="alert">{submitError}</p>}

            <div className="cpf-test-submit-bar">
              <div>
                <FiCalendar />
                <span>Vos réponses restent confidentielles et servent uniquement à votre évaluation.</span>
              </div>
              <button type="submit" className="cpf-test-submit" disabled={submitting || submitted}>
                {submitting ? "Enregistrement…" : submitted ? "Demande enregistrée" : "Envoyer ma demande"} <FiArrowRight />
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CPFPositioningPage;
