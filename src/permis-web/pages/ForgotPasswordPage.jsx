import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiMail } from "react-icons/fi";
import logo from "../assets/logo.webp";
import http from "../../helpers/http.jsx";
import "./PasswordResetPages.css";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Saisissez votre adresse e-mail.");
      return;
    }

    setSubmitting(true);
    setError("");
    setStatus("");
    try {
      const response = await http.post("/public/auth/forgot-password", { email: email.trim() });
      setStatus(response?.data?.message || "Un lien de réinitialisation a été envoyé à votre adresse e-mail.");
    } catch (requestError) {
      setError(requestError?.response?.data?.errors?.email?.[0]
        || requestError?.response?.data?.message
        || "Impossible d’envoyer le lien de réinitialisation. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-card" aria-labelledby="forgot-password-title">
        <img src={logo} className="password-card__logo" alt="PassPermisFacile" />
        <button type="button" className="password-card__back" onClick={() => navigate("/login-page")} aria-label="Retour à la connexion">
          <FiArrowLeft />
        </button>
        <p className="password-card__eyebrow">ACCÈS À VOTRE ESPACE</p>
        <h1 id="forgot-password-title">Mot de passe oublié ?</h1>
        <p className="password-card__intro">
          Indiquez votre adresse e-mail. Nous vous enverrons un lien sécurisé pour choisir un nouveau mot de passe.
        </p>

        {status ? (
          <div className="password-card__success" role="status">
            <FiCheckCircle />
            <span>{status}</span>
          </div>
        ) : (
          <form className="password-card__form" onSubmit={submit} noValidate>
            <label className="password-card__field" htmlFor="forgot-password-email">
              <span>Adresse e-mail</span>
              <div>
                <FiMail aria-hidden="true" />
                <input
                  id="forgot-password-email"
                  type="email"
                  autoComplete="email"
                  placeholder="votremail@exemple.fr"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>
            {error && <p className="password-card__error" role="alert">{error}</p>}
            <button type="submit" className="password-card__submit" disabled={submitting}>
              {submitting ? "Envoi en cours…" : "Envoyer le lien"} <FiArrowRight />
            </button>
          </form>
        )}

        <button type="button" className="password-card__text-link" onClick={() => navigate("/login-page")}>
          Retour à la connexion
        </button>
      </section>
    </main>
  );
}
