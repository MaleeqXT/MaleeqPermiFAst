import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLock, FiMail } from "react-icons/fi";
import logo from "../assets/logo.webp";
import http from "../../helpers/http.jsx";
import "./PasswordResetPages.css";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token = "" } = useParams();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    if (!token || !email) {
      setError("Ce lien de réinitialisation est incomplet. Demandez un nouveau lien.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== passwordConfirmation) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const response = await http.post("/public/auth/reset-password", {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setStatus(response?.data?.message || "Votre mot de passe a été réinitialisé.");
    } catch (requestError) {
      setError(requestError?.response?.data?.errors?.email?.[0]
        || requestError?.response?.data?.errors?.password?.[0]
        || requestError?.response?.data?.message
        || "Le lien est invalide ou a expiré. Demandez un nouveau lien.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="password-page">
      <section className="password-card" aria-labelledby="reset-password-title">
        <img src={logo} className="password-card__logo" alt="PassPermisFacile" />
        <button type="button" className="password-card__back" onClick={() => navigate("/login-page")} aria-label="Retour à la connexion">
          <FiArrowLeft />
        </button>
        <p className="password-card__eyebrow">NOUVEAU MOT DE PASSE</p>
        <h1 id="reset-password-title">Réinitialisez votre accès</h1>
        <p className="password-card__intro">Choisissez un nouveau mot de passe sécurisé pour votre compte.</p>

        {status ? (
          <div className="password-card__success" role="status">
            <FiCheckCircle />
            <span>{status}</span>
          </div>
        ) : (
          <form className="password-card__form" onSubmit={submit} noValidate>
            <label className="password-card__field" htmlFor="reset-password-email">
              <span>Adresse e-mail</span>
              <div>
                <FiMail aria-hidden="true" />
                <input id="reset-password-email" type="email" value={email} disabled />
              </div>
            </label>
            <label className="password-card__field" htmlFor="reset-password-value">
              <span>Nouveau mot de passe</span>
              <div>
                <FiLock aria-hidden="true" />
                <input id="reset-password-value" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
              </div>
            </label>
            <label className="password-card__field" htmlFor="reset-password-confirmation">
              <span>Confirmer le mot de passe</span>
              <div>
                <FiLock aria-hidden="true" />
                <input id="reset-password-confirmation" type="password" autoComplete="new-password" value={passwordConfirmation} onChange={(event) => setPasswordConfirmation(event.target.value)} required />
              </div>
            </label>
            {error && <p className="password-card__error" role="alert">{error}</p>}
            <button type="submit" className="password-card__submit" disabled={submitting}>
              {submitting ? "Enregistrement…" : "Définir le mot de passe"} <FiArrowRight />
            </button>
          </form>
        )}

        <button type="button" className="password-card__text-link" onClick={() => navigate("/login-page")}>
          Se connecter
        </button>
      </section>
    </main>
  );
}
