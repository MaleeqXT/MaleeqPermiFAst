import { useCallback, useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import { apiAssetUrl } from "../config/api.js";
import "./TheoryAdmin.css";
import "./TheoryAdminExtras.css";

const emptyForm = (categoryId = "") => ({
  category_id: categoryId,
  question_text: "",
  difficulty: "medium",
  answer_type: "single",
  explanation: "",
  official_reference: "",
  status: "draft",
  is_active: true,
  requires_review: false,
  review_notes: "",
  options: [
    { label: "", is_correct: true },
    { label: "", is_correct: false },
  ],
});

const statusLabel = { published: "Publiée", draft: "Brouillon", archived: "Archivée" };

function mediaUrl(path) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.replace(/^\//, "");
  return apiAssetUrl(`${normalizedPath.startsWith("theory/questions/") ? "storage/" : ""}${normalizedPath}`);
}

export default function AdminTheoryQuestionsPage() {
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", category_id: "" });
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [media, setMedia] = useState(null);
  const [similarMatches, setSimilarMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ per_page: "25", page: String(page) });
      Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
      const [categoryResponse, statsResponse, questionResponse] = await Promise.all([
        http.get("/admin/theory/categories"),
        http.get("/admin/theory/statistics"),
        http.get(`/admin/theory/questions?${params.toString()}`),
      ]);
      setCategories(categoryResponse.data?.data || []);
      setStatistics(statsResponse.data?.data || null);
      setQuestions(questionResponse.data?.data || []);
      setMeta({
        current_page: questionResponse.data?.current_page || 1,
        last_page: questionResponse.data?.last_page || 1,
        total: questionResponse.data?.total || 0,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger la banque de questions.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories]);

  const startNew = () => {
    setEditingId(null);
    setMedia(null);
    setSimilarMatches(null);
    setError("");
    setForm(emptyForm(categories[0]?.id || ""));
  };

  const editQuestion = (question) => {
    setEditingId(question.id);
    setMedia(null);
    setSimilarMatches(null);
    setError("");
    setForm({
      category_id: question.category_id,
      question_text: question.question_text,
      difficulty: question.difficulty,
      answer_type: question.answer_type,
      explanation: question.explanation,
      official_reference: question.official_reference || "",
      status: question.status,
      is_active: Boolean(question.is_active),
      requires_review: Boolean(question.requires_review),
      review_notes: question.review_notes || "",
      options: (question.options || []).map((option) => ({ label: option.label, is_correct: Boolean(option.is_correct) })),
      current_media_path: question.media_path,
    });
  };

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const changeOption = (index, patch) => setForm((current) => ({
    ...current,
    options: current.options.map((option, optionIndex) => optionIndex === index ? { ...option, ...patch } : option),
  }));
  const chooseCorrect = (index) => setForm((current) => ({
    ...current,
    options: current.options.map((option, optionIndex) => ({
      ...option,
      is_correct: current.answer_type === "single" ? optionIndex === index : optionIndex === index ? !option.is_correct : option.is_correct,
    })),
  }));

  const save = async (event) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { ...form };
      delete payload.current_media_path;
      const response = editingId
        ? await http.put(`/admin/theory/questions/${editingId}`, payload)
        : await http.post("/admin/theory/questions", payload);
      const saved = response.data?.data;
      if (media && saved?.id) {
        const body = new FormData();
        body.append("media", media);
        await http.post(`/admin/theory/questions/${saved.id}/media`, body);
      }
      setNotice(editingId ? "Question mise à jour." : "Question ajoutée à la banque.");
      setForm(null);
      setEditingId(null);
      setMedia(null);
      await load(meta.current_page);
    } catch (requestError) {
      const fields = requestError.response?.data?.errors;
      setError(fields ? Object.values(fields).flat().join(" ") : (requestError.response?.data?.message || "La question n’a pas pu être enregistrée."));
    } finally {
      setSaving(false);
    }
  };

  const checkDuplicates = async () => {
    if (!form?.question_text || form.question_text.trim().length < 12) {
      setError("Saisissez au moins quelques mots de la question avant de vérifier les doublons.");
      return;
    }
    setError("");
    try {
      const response = await http.get("/admin/theory/duplicates", { params: { question_text: form.question_text, ignore_id: editingId || undefined } });
      setSimilarMatches(response.data?.data || []);
    } catch {
      setError("La vérification des doublons n’a pas pu être effectuée.");
    }
  };

  const updatePublication = async (question, status) => {
    setError("");
    try {
      await http.patch(`/admin/theory/questions/${question.id}/publication`, { status, is_active: status === "published" });
      setNotice(status === "published" ? "Question publiée." : "Question repassée en brouillon.");
      await load(meta.current_page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Le statut n’a pas pu être mis à jour.");
    }
  };

  const archive = async (question) => {
    if (!window.confirm(`Archiver la question ${question.public_id} ?`)) return;
    setError("");
    try {
      await http.delete(`/admin/theory/questions/${question.id}`);
      setNotice("Question archivée.");
      await load(meta.current_page);
    } catch {
      setError("La question n’a pas pu être archivée.");
    }
  };

  return (
    <div className="theory-admin-page">
      <div className="theory-admin-header">
        <div><p className="theory-eyebrow">BANQUE PÉDAGOGIQUE</p><h1>Code de la Route Questions</h1><p>Questions originales, stockées dans MySQL et publiées uniquement après validation.</p></div>
        <button className="theory-primary" type="button" onClick={startNew}>+ Ajouter une question</button>
      </div>

      {error && <div className="theory-alert theory-alert--error" role="alert">{error}</div>}
      {notice && <div className="theory-alert theory-alert--success">{notice}</div>}

      <section className="theory-admin-stats" aria-label="Statistiques de la banque">
        <article><span>Questions totales</span><strong>{statistics?.total_questions ?? "—"}</strong></article>
        <article><span>Publiées</span><strong>{statistics?.published_questions ?? "—"}</strong></article>
        <article><span>À relire</span><strong>{statistics?.review_questions ?? "—"}</strong></article>
        <article><span>Objectif</span><strong>{statistics?.target_questions?.toLocaleString("fr-FR") ?? "4 950"}</strong></article>
      </section>

      <section className="theory-category-summary">
        {categories.map((category) => <div key={category.id}><strong>{category.name}</strong><span>{category.published_questions_count}/{category.total_questions_count} publiées</span>{category.review_questions_count > 0 && <small>{category.review_questions_count} à relire</small>}</div>)}
      </section>

      <section className="theory-question-panel">
        <div className="theory-toolbar">
          <input aria-label="Rechercher" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Rechercher une question ou un ID…" />
          <select aria-label="Statut" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Tous les statuts</option><option value="published">Publiées</option><option value="draft">Brouillons</option><option value="archived">Archivées</option></select>
          <select aria-label="Catégorie" value={filters.category_id} onChange={(event) => setFilters((current) => ({ ...current, category_id: event.target.value }))}><option value="">Toutes les catégories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          <button type="button" className="theory-secondary" onClick={() => load(1)}>Filtrer</button>
        </div>

        <div className="theory-table-wrap">
          <table><thead><tr><th>Question</th><th>Catégorie</th><th>Type</th><th>Statut</th><th>Utilisation</th><th>Actions</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan="6" className="theory-empty">Chargement…</td></tr> : questions.length ? questions.map((question) => <tr key={question.id}>
              <td><strong>{question.public_id}</strong><p>{question.question_text}</p>{question.media_path && <img className="theory-thumb" src={mediaUrl(question.media_path)} alt="Illustration de la question" />}</td>
              <td>{question.category?.name || categoryById[question.category_id]?.name || "—"}</td><td>{question.answer_type === "multiple" ? "Plusieurs réponses" : "Une réponse"}</td>
              <td><span className={`theory-status theory-status--${question.status}`}>{statusLabel[question.status]}</span>{question.requires_review && <small className="theory-review">À relire</small>}</td>
              <td>{question.attempt_answers_count || 0}</td>
              <td><div className="theory-actions"><button type="button" onClick={() => editQuestion(question)}>Modifier</button>{question.status !== "published" && !question.requires_review && <button type="button" onClick={() => updatePublication(question, "published")}>Publier</button>}{question.status === "published" && <button type="button" onClick={() => updatePublication(question, "draft")}>Dépublier</button>}<button type="button" className="theory-danger" onClick={() => archive(question)}>Archiver</button></div></td>
            </tr>) : <tr><td colSpan="6" className="theory-empty">Aucune question ne correspond à ces filtres.</td></tr>}</tbody>
          </table>
        </div>
        <div className="theory-pagination"><span>{meta.total} question(s)</span><div><button disabled={meta.current_page <= 1} type="button" onClick={() => load(meta.current_page - 1)}>Précédent</button><span>Page {meta.current_page} / {meta.last_page}</span><button disabled={meta.current_page >= meta.last_page} type="button" onClick={() => load(meta.current_page + 1)}>Suivant</button></div></div>
      </section>

      {form && <div className="theory-drawer-backdrop" role="presentation" onMouseDown={() => !saving && setForm(null)}><form className="theory-drawer" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <div className="theory-drawer-head"><div><h2>{editingId ? "Modifier la question" : "Nouvelle question"}</h2><p>Une question publiée est visible dans les examens blancs.</p></div><button type="button" onClick={() => setForm(null)} aria-label="Fermer">×</button></div>
        <label>Catégorie<select required value={form.category_id} onChange={(event) => setField("category_id", event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label>Question<textarea required value={form.question_text} onChange={(event) => setField("question_text", event.target.value)} /></label><button type="button" className="theory-link-button" onClick={checkDuplicates}>Vérifier les doublons proches</button>{similarMatches?.length > 0 && <div className="theory-duplicate-list"><strong>Questions potentiellement proches à vérifier :</strong>{similarMatches.map((match) => <span key={match.id}>{match.public_id} · similarité {Math.round(match.similarity * 100)} % — {match.question_text}</span>)}</div>}{similarMatches && similarMatches.length === 0 && <small className="theory-duplicate-ok">La vérification n’affiche aucun doublon proche.</small>}
        <div className="theory-form-row"><label>Difficulté<select value={form.difficulty} onChange={(event) => setField("difficulty", event.target.value)}><option value="easy">Facile</option><option value="medium">Moyenne</option><option value="hard">Difficile</option></select></label><label>Réponses<select value={form.answer_type} onChange={(event) => setField("answer_type", event.target.value)}><option value="single">Une bonne réponse</option><option value="multiple">Plusieurs bonnes réponses</option></select></label></div>
        <fieldset><legend>Réponses proposées</legend>{form.options.map((option, index) => <div className="theory-option-edit" key={index}><button type="button" title="Marquer comme bonne réponse" className={option.is_correct ? "is-correct" : ""} onClick={() => chooseCorrect(index)}>{option.is_correct ? "✓" : String.fromCharCode(65 + index)}</button><input required value={option.label} onChange={(event) => changeOption(index, { label: event.target.value })} placeholder={`Réponse ${index + 1}`} />{form.options.length > 2 && <button type="button" onClick={() => setForm((current) => ({ ...current, options: current.options.filter((_, itemIndex) => itemIndex !== index) }))}>−</button>}</div>)}{form.options.length < 4 && <button type="button" className="theory-link-button" onClick={() => setForm((current) => ({ ...current, options: [...current.options, { label: "", is_correct: false }] }))}>+ Ajouter une réponse</button>}</fieldset>
        <label>Explication pédagogique<textarea required value={form.explanation} onChange={(event) => setField("explanation", event.target.value)} /></label>
        <label>Référence officielle (URL)<input type="url" value={form.official_reference} onChange={(event) => setField("official_reference", event.target.value)} placeholder="https://…" /></label>
        <label>Illustration ou vidéo originale<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml,video/mp4,video/webm" onChange={(event) => setMedia(event.target.files?.[0] || null)} />{form.current_media_path && !media && <small>Média actuel conservé.</small>}</label>
        <div className="theory-check-row"><label><input type="checkbox" checked={form.requires_review} onChange={(event) => setField("requires_review", event.target.checked)} /> À relire avant publication</label><label><input type="checkbox" checked={form.is_active} onChange={(event) => setField("is_active", event.target.checked)} /> Active</label></div>
        <label>Statut<select value={form.status} onChange={(event) => setField("status", event.target.value)}><option value="draft">Brouillon</option><option value="published">Publiée</option></select></label>
        <div className="theory-drawer-actions"><button type="button" className="theory-secondary" onClick={() => setForm(null)}>Annuler</button><button className="theory-primary" disabled={saving} type="submit">{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form></div>}
    </div>
  );
}
