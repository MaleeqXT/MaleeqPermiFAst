import { useCallback, useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import { apiAssetUrl } from "../config/api.js";
import TheoryAdminPreview from "./TheoryAdminPreview.jsx";
import TheoryImportPanel from "./TheoryImportPanel.jsx";
import "./TheoryAdmin.css";
import "./TheoryAdminExtras.css";

const sharedOptions = () => ["A", "B", "C", "D"].map((letter) => ({ label: "", is_correct: false, letter }));
const emptyPairedParts = () => [
  { question_text: "", explanation: "", correct_option_positions: [1] },
  { question_text: "", explanation: "", correct_option_positions: [3] },
];
const emptyForm = (categoryId = "") => ({
  content_bank_id: ORIGINAL_DRAFT_BANK,
  category_id: categoryId,
  question_text: "",
  difficulty: "medium",
  answer_type: "single",
  explanation: "",
  official_reference: "",
  status: "draft",
  is_active: false,
  requires_review: true,
  review_notes: "",
  options: [{ label: "", is_correct: true }, { label: "", is_correct: false }],
  content_type: "single",
  parts: [],
});

const statusLabel = { published: "Publiée", draft: "Brouillon", archived: "Archivée" };
const reviewLabel = { pending: "En attente", pending_editorial_review: "En attente", approved: "Approuvée", needs_correction: "À corriger", rejected: "Rejetée" };
const ORIGINAL_DRAFT_BANK = "00000000-0000-4000-8000-000000000002";

function mediaUrl(path) {
  if (!path) return null;
  const rawPath = String(path);
  // Translate a backend localhost URL to the configured API host.
  const localStorageMatch = rawPath.match(/^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/storage\/.+)$/i);
  if (/^https?:\/\//i.test(rawPath) && !localStorageMatch) return rawPath;
  const normalizedPath = (localStorageMatch?.[1] || rawPath).replace(/^\//, "");
  return apiAssetUrl(`${normalizedPath.startsWith("theory/questions/") ? "storage/" : ""}${normalizedPath}`);
}

export default function AdminTheoryQuestionsPage() {
  const [categories, setCategories] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [filters, setFilters] = useState({ search: "", status: "", category_id: "", review_status: "" });
  const [form, setForm] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [media, setMedia] = useState({ image: null, video: null, audio: null });
  const [previewQuestion, setPreviewQuestion] = useState(null);
  const [importing, setImporting] = useState(false);
  const [similarMatches, setSimilarMatches] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewStats, setReviewStats] = useState(null);

  const load = useCallback(async (page = 1) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ per_page: reviewMode ? "50" : "25", page: String(page) });
      // The normal Admin workspace deliberately stays on the draft replacement
      // bank. Legacy remains available internally for current student delivery.
      params.set("content_bank_id", ORIGINAL_DRAFT_BANK);
      Object.entries(filters).forEach(([key, value]) => value && params.set(key, value));
      if (reviewMode) {
        params.set("content_bank_id", ORIGINAL_DRAFT_BANK);
        params.set("status", "draft");
        params.set("requires_review", "1");
      }
      const [categoryResponse, statsResponse, questionResponse, reviewResponse] = await Promise.all([
        http.get("/admin/theory/categories"),
        http.get("/admin/theory/statistics"),
        http.get(`/admin/theory/questions?${params.toString()}`),
        reviewMode ? http.get("/admin/theory/editorial-review") : Promise.resolve(null),
      ]);
      setCategories(categoryResponse.data?.data || []);
      setStatistics(statsResponse.data?.data || null);
      setReviewStats(reviewResponse?.data?.data || null);
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
  }, [filters, reviewMode]);

  useEffect(() => { load(); }, [load]);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((category) => [category.id, category])), [categories]);

  const startNew = () => {
    setEditingId(null);
    setMedia({ image: null, video: null, audio: null });
    setSimilarMatches(null);
    setError("");
    setForm(emptyForm(categories[0]?.id || ""));
  };

  const editQuestion = (question) => {
    setEditingId(question.id);
    setMedia({ image: null, video: null, audio: null });
    setSimilarMatches(null);
    setError("");
    setForm({
      content_bank_id: question.content_bank?.id || ORIGINAL_DRAFT_BANK,
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
      options: question.parts?.length
        ? ((question.options || []).length === 4
          ? question.options.map((option) => ({ label: option.label, is_correct: Boolean(option.is_correct) }))
          : (question.parts || []).flatMap((part) => part.options || []).slice(0, 4).map((option) => ({ label: option.label, is_correct: Boolean(option.is_correct) })))
        : (question.options || []).map((option) => ({ label: option.label, is_correct: Boolean(option.is_correct) })),
      content_type: question.parts?.length ? "group" : "single",
      parts: question.parts?.length
        ? question.parts.slice(0, 2).map((part, partIndex) => ({
          question_text: part.question_text,
          explanation: part.explanation || "",
          correct_option_positions: Array.isArray(part.correct_option_positions)
            ? part.correct_option_positions
            : (part.options || []).flatMap((option, optionIndex) => option.is_correct ? [partIndex * 2 + optionIndex + 1] : []),
        }))
        : [],
      current_media_path: question.media_path,
      image_path: question.image_path,
      video_path: question.video_path,
      audio_path: question.audio_path,
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
  const updatePart = (partIndex, patch) => setForm((current) => ({ ...current, parts: current.parts.map((part, index) => index === partIndex ? { ...part, ...patch } : part) }));
  const togglePartCorrect = (partIndex, position) => updatePart(partIndex, {
    correct_option_positions: (form.parts[partIndex].correct_option_positions || []).includes(position)
      ? form.parts[partIndex].correct_option_positions.filter((item) => item !== position)
      : [...(form.parts[partIndex].correct_option_positions || []), position],
  });

  const save = async (event) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const payload = { ...form };
      payload.content_bank_id = ORIGINAL_DRAFT_BANK;
      if (reviewMode || !editingId) {
        payload.content_bank_id = ORIGINAL_DRAFT_BANK;
        payload.status = "draft";
        payload.is_active = false;
        payload.requires_review = true;
      }
      delete payload.current_media_path;
      delete payload.content_type;
      if (form.content_type === "group") {
        payload.question_text = form.parts[0]?.question_text || "Questions multiples";
        delete payload.explanation;
        payload.answer_type = "multiple";
        payload.options = form.options.map((option) => ({ ...option, is_correct: false }));
      }
      const response = editingId
        ? await http.put(`/admin/theory/questions/${editingId}`, payload)
        : await http.post("/admin/theory/questions", payload);
      const saved = response.data?.data;
      if (saved?.id) await Promise.all(Object.entries(media).filter(([, file]) => file).map(async ([kind, file]) => {
        const body = new FormData();
        body.append("media", file);
        body.append("kind", kind);
        await http.post(`/admin/theory/questions/${saved.id}/media`, body);
      }));
      setNotice(editingId ? "Question mise à jour." : "Question ajoutée à la banque.");
      setForm(null);
      setEditingId(null);
      setMedia({ image: null, video: null, audio: null });
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

  const setReviewDecision = async (question, reviewStatus) => {
    const asksForNote = reviewStatus === "needs_correction" || reviewStatus === "rejected";
    const reviewNotes = asksForNote ? window.prompt(reviewStatus === "needs_correction" ? "Correction demandée (facultatif) :" : "Motif du rejet (facultatif) :", question.review_notes || "") : "";
    if (reviewNotes === null) return;
    setError("");
    try {
      await http.patch(`/admin/theory/questions/${question.id}/review`, { review_status: reviewStatus, review_notes: reviewNotes });
      setNotice(`Question ${reviewLabel[reviewStatus].toLowerCase()}.`);
      await load(meta.current_page);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "La décision éditoriale n’a pas pu être enregistrée.");
    }
  };

  const openEditorialReview = () => {
    setReviewMode(true);
    setFilters({ search: "", status: "draft", category_id: "", review_status: "pending" });
    setForm(null);
    setPreviewQuestion(null);
  };

  const closeEditorialReview = () => {
    setReviewMode(false);
    setReviewStats(null);
    setFilters({ search: "", status: "", category_id: "", review_status: "" });
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
        <div><p className="theory-eyebrow">BANQUE PÉDAGOGIQUE · ORIGINAL-FR-2026</p><h1>Code de la Route Questions</h1><p>Banque de travail brouillon, stockée dans MySQL et réservée à la revue éditoriale.</p></div>
        <div className="theory-header-actions">{reviewMode ? <button className="theory-secondary" type="button" onClick={closeEditorialReview}>← Banque complète</button> : <><button className="theory-secondary" type="button" onClick={openEditorialReview}>Revue éditoriale</button><button className="theory-secondary" type="button" onClick={() => setImporting(true)}>Importer</button><button className="theory-primary" type="button" onClick={startNew}>+ Ajouter une question</button></>}</div>
      </div>

      {error && <div className="theory-alert theory-alert--error" role="alert">{error}</div>}
      {notice && <div className="theory-alert theory-alert--success">{notice}</div>}

      <section className="theory-admin-stats" aria-label="Statistiques de la banque">
        {reviewMode ? <><article><span>Total original-fr-2026</span><strong>{reviewStats?.total ?? "—"}</strong></article><article><span>En attente</span><strong>{reviewStats?.pending ?? "—"}</strong></article><article><span>Approuvées</span><strong>{reviewStats?.approved ?? "—"}</strong></article><article><span>À corriger</span><strong>{reviewStats?.needs_correction ?? "—"}</strong></article><article><span>Rejetées</span><strong>{reviewStats?.rejected ?? "—"}</strong></article></> : <><article><span>Questions totales</span><strong>{statistics?.total_questions ?? "—"}</strong></article><article><span>Publiées</span><strong>{statistics?.published_questions ?? "—"}</strong></article><article><span>À relire</span><strong>{statistics?.review_questions ?? "—"}</strong></article><article><span>Objectif</span><strong>{statistics?.target_questions?.toLocaleString("fr-FR") ?? "4 950"}</strong></article></>}
      </section>

      {reviewMode && <section className="theory-review-intro"><strong>Revue éditoriale · original-fr-2026</strong><span>Seules les questions brouillon nécessitant une revue sont affichées. L’approbation ne publie ni n’active la question.</span><small>{reviewStats?.remaining ?? "—"} question(s) restent à examiner.</small></section>}
      {!reviewMode && <section className="theory-category-summary">
        {categories.map((category) => <div key={category.id}><strong>{category.name}</strong><span>{category.published_questions_count}/{category.total_questions_count} publiées</span>{category.review_questions_count > 0 && <small>{category.review_questions_count} à relire</small>}</div>)}
      </section>}

      <section className="theory-question-panel">
        <div className="theory-toolbar">
          <input aria-label="Rechercher" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Rechercher une question ou un ID…" />
          {!reviewMode && <select aria-label="Statut" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}><option value="">Tous les statuts</option><option value="published">Publiées</option><option value="draft">Brouillons</option><option value="archived">Archivées</option></select>}
          <select aria-label="Catégorie" value={filters.category_id} onChange={(event) => setFilters((current) => ({ ...current, category_id: event.target.value }))}><option value="">Toutes les catégories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
          {reviewMode && <select aria-label="État de revue" value={filters.review_status} onChange={(event) => setFilters((current) => ({ ...current, review_status: event.target.value }))}><option value="">Toutes à examiner</option><option value="pending">En attente</option><option value="needs_correction">À corriger</option><option value="rejected">Rejetées</option></select>}
          <button type="button" className="theory-secondary" onClick={() => load(1)}>Filtrer</button>
        </div>

        <div className="theory-table-wrap">
          <table><thead><tr><th>Question</th><th>Catégorie</th><th>Type</th><th>Statut</th><th>Utilisation</th><th>Actions</th></tr></thead>
            <tbody>{loading ? <tr><td colSpan="6" className="theory-empty">Chargement…</td></tr> : questions.length ? questions.map((question) => <tr key={question.id}>
              <td><strong>{question.public_id}</strong><p>{question.question_text}</p>{(question.image_url || question.image_path || question.media_path) && <img className="theory-thumb" src={mediaUrl(question.image_url || question.image_path || question.media_path)} alt="Illustration de la question" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}</td>
              <td>{question.category?.name || categoryById[question.category_id]?.name || "—"}</td><td>{question.answer_type === "multiple" ? "Plusieurs réponses" : "Une réponse"}</td>
              <td><span className={`theory-status theory-status--${question.status}`}>{statusLabel[question.status]}</span>{reviewMode ? <small className={`theory-review-state theory-review-state--${question.review_status}`}>{reviewLabel[question.review_status] || "En attente"}</small> : question.requires_review && <small className="theory-review">À relire</small>}</td>
              <td>{question.attempt_answers_count || 0}</td>
              <td><div className="theory-actions">{reviewMode ? <><button type="button" onClick={() => setPreviewQuestion(question)}>Prévisualiser</button><button type="button" onClick={() => editQuestion(question)}>Modifier</button><button type="button" className="theory-review-approve" onClick={() => setReviewDecision(question, "approved")}>Approuver</button><button type="button" onClick={() => setReviewDecision(question, "needs_correction")}>À corriger</button><button type="button" className="theory-danger" onClick={() => setReviewDecision(question, "rejected")}>Rejeter</button></> : <><button type="button" onClick={() => setPreviewQuestion(question)}>Prévisualiser</button><button type="button" onClick={() => editQuestion(question)}>Modifier</button>{question.content_bank?.id !== ORIGINAL_DRAFT_BANK && question.status !== "published" && !question.requires_review && <button type="button" onClick={() => updatePublication(question, "published")}>Publier</button>}{question.content_bank?.id !== ORIGINAL_DRAFT_BANK && question.status === "published" && <button type="button" onClick={() => updatePublication(question, "draft")}>Dépublier</button>}<button type="button" className="theory-danger" onClick={() => archive(question)}>Archiver</button></>}</div></td>
            </tr>) : <tr><td colSpan="6" className="theory-empty">Aucune question ne correspond à ces filtres.</td></tr>}</tbody>
          </table>
        </div>
        <div className="theory-pagination"><span>{meta.total} question(s){reviewMode ? " à examiner" : ""}</span><div><button disabled={meta.current_page <= 1} type="button" onClick={() => load(meta.current_page - 1)}>← Lot précédent</button><span>{reviewMode ? "Lot" : "Page"} {meta.current_page} / {meta.last_page}</span><button disabled={meta.current_page >= meta.last_page} type="button" onClick={() => load(meta.current_page + 1)}>Lot suivant →</button></div></div>
      </section>

      {form && <div className="theory-drawer-backdrop" role="presentation" onMouseDown={() => !saving && setForm(null)}><form className="theory-drawer" onSubmit={save} onMouseDown={(event) => event.stopPropagation()}>
        <div className="theory-drawer-head"><div><h2>{editingId ? "Modifier la question" : "Nouvelle question"}</h2><p>Une question publiée est visible dans les examens blancs.</p></div><button type="button" onClick={() => setForm(null)} aria-label="Fermer">×</button></div>
        <label>Catégorie<select required value={form.category_id} onChange={(event) => setField("category_id", event.target.value)}>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        {form.content_type === "single" && <><label>Question<textarea required value={form.question_text} onChange={(event) => setField("question_text", event.target.value)} /></label><button type="button" className="theory-link-button" onClick={checkDuplicates} disabled={form.question_text.trim().length < 12}>Vérifier les doublons proches</button>{form.question_text.trim().length > 0 && form.question_text.trim().length < 12 && <small className="theory-duplicate-hint">Saisissez au moins 12 caractères pour vérifier les doublons.</small>}{similarMatches?.length > 0 && <div className="theory-duplicate-list"><strong>Questions potentiellement proches à vérifier :</strong>{similarMatches.map((match) => <span key={match.id}>{match.public_id} · similarité {Math.round(match.similarity * 100)} % — {match.question_text}</span>)}</div>}{similarMatches && similarMatches.length === 0 && <small className="theory-duplicate-ok">La vérification n’affiche aucun doublon proche.</small>}</>}
        <div className="theory-form-row"><label>Difficulté<select value={form.difficulty} onChange={(event) => setField("difficulty", event.target.value)}><option value="easy">Facile</option><option value="medium">Moyenne</option><option value="hard">Difficile</option></select></label><label>Format<select value={form.content_type} onChange={(event) => setForm((current) => event.target.value === "group" ? { ...current, content_type: "group", parts: emptyPairedParts(), options: sharedOptions() } : { ...current, content_type: "single", parts: [], options: current.options.length >= 2 ? current.options.slice(0, 4) : emptyForm().options })}><option value="single">Question simple</option><option value="group">Questions multiples</option></select></label>{form.content_type === "single" && <label>Réponses<select value={form.answer_type} onChange={(event) => setField("answer_type", event.target.value)}><option value="single">Une bonne réponse</option><option value="multiple">Plusieurs bonnes réponses</option></select></label>}</div>
        {form.content_type === "single" ? <fieldset><legend>Réponses proposées</legend>{form.options.map((option, index) => <div className="theory-option-edit" key={index}><button type="button" className={option.is_correct ? "is-correct" : ""} onClick={() => chooseCorrect(index)}>{option.is_correct ? "✓" : String.fromCharCode(65 + index)}</button><input required value={option.label} onChange={(event) => changeOption(index, { label: event.target.value })} />{form.options.length > 2 && <button type="button" onClick={() => setForm((current) => ({ ...current, options: current.options.filter((_, itemIndex) => itemIndex !== index) }))}>−</button>}</div>)}<button type="button" className="theory-link-button" onClick={() => form.options.length < 4 && setForm((current) => ({ ...current, options: [...current.options, { label: "", is_correct: false }] }))}>+ Ajouter une réponse</button></fieldset> : <><fieldset><legend>Questions multiples (média partagé)</legend><p className="theory-duplicate-hint">Ajoutez seulement les deux questions ici. Les réponses A, B, C et D sont partagées et se configurent juste en dessous.</p>{form.parts.map((part, partIndex) => <div className="theory-duplicate-list" key={partIndex}><strong>Question {partIndex + 1}</strong><textarea required value={part.question_text} onChange={(event) => updatePart(partIndex, { question_text: event.target.value })} placeholder={`Question ${partIndex + 1}`} /><textarea value={part.explanation} onChange={(event) => updatePart(partIndex, { explanation: event.target.value })} placeholder={`Explication de la question ${partIndex + 1}`} /></div>)}</fieldset><fieldset><legend>4 réponses partagées</legend>{form.options.map((option, optionIndex) => <div className="theory-option-edit" key={optionIndex}><strong>{String.fromCharCode(65 + optionIndex)}</strong><input required value={option.label} onChange={(event) => changeOption(optionIndex, { label: event.target.value })} /> <label className="theory-inline-choice"><input type="checkbox" checked={(form.parts[optionIndex < 2 ? 0 : 1]?.correct_option_positions || []).includes(optionIndex + 1)} onChange={() => togglePartCorrect(optionIndex < 2 ? 0 : 1, optionIndex + 1)} /> Bonne réponse pour la question {optionIndex < 2 ? 1 : 2}</label></div>)}</fieldset></>}
        <label>Explication pédagogique<textarea required value={form.explanation} onChange={(event) => setField("explanation", event.target.value)} /></label>
        <label>Référence officielle (URL)<input type="url" value={form.official_reference} onChange={(event) => setField("official_reference", event.target.value)} placeholder="https://…" /></label>
        <fieldset className="theory-media-fields"><legend>Médias de la question</legend><label>Illustration (JPG, PNG, WebP)<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setMedia((current) => ({ ...current, image: event.target.files?.[0] || null }))} />{form.image_path || form.current_media_path ? <small>Illustration actuelle conservée jusqu’au remplacement.</small> : null}</label><label>Vidéo (MP4)<input type="file" accept="video/mp4" onChange={(event) => setMedia((current) => ({ ...current, video: event.target.files?.[0] || null }))} />{form.video_path ? <small>Vidéo actuelle conservée jusqu’au remplacement.</small> : null}</label><label>Narration française (MP3)<input type="file" accept="audio/mpeg,.mp3" onChange={(event) => setMedia((current) => ({ ...current, audio: event.target.files?.[0] || null }))} />{form.audio_path ? <small>Audio actuel conservé jusqu’au remplacement.</small> : null}</label></fieldset>
        {reviewMode ? <p className="theory-review-lock">Cette question reste en brouillon, inactive et réservée à la revue éditoriale.</p> : <><div className="theory-check-row"><label><input type="checkbox" checked={form.requires_review} onChange={(event) => setField("requires_review", event.target.checked)} /> À relire avant publication</label><label><input type="checkbox" checked={form.is_active} onChange={(event) => setField("is_active", event.target.checked)} /> Active</label></div><label>Statut<select value={form.status} onChange={(event) => setField("status", event.target.value)}><option value="draft">Brouillon</option><option value="published">Publiée</option></select></label></>}
        <div className="theory-drawer-actions"><button type="button" className="theory-secondary" onClick={() => setForm(null)}>Annuler</button><button className="theory-primary" disabled={saving} type="submit">{saving ? "Enregistrement…" : "Enregistrer"}</button></div>
      </form></div>}
      {previewQuestion && <TheoryAdminPreview questions={[previewQuestion]} title="Prévisualisation de question" onClose={() => setPreviewQuestion(null)} />}
      {importing && <TheoryImportPanel onClose={() => setImporting(false)} onImported={() => { setImporting(false); load(1); setNotice("Import enregistré en brouillon : consultez les lots pour les doublons et erreurs."); }} />}
    </div>
  );
}

function AdminQuestionPreview({ question, onClose }) {
  const [selected, setSelected] = useState([]);
  const [validated, setValidated] = useState(false);
  const isMultiple = question.answer_type === "multiple";
  const correctIds = (question.options || []).filter((option) => option.is_correct).map((option) => option.id).sort();
  const isCorrect = selected.slice().sort().join(",") === correctIds.join(",");
  const choose = (id) => setSelected((current) => isMultiple ? (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) : [id]);
  const image = question.image_path || (question.media_type === "image" ? question.media_path : null);
  const video = question.video_path || (question.media_type === "video" ? question.media_path : null);
  return <div className="theory-preview-backdrop" role="presentation"><section className="theory-preview" role="dialog" aria-modal="true" aria-label="Prévisualisation de question"><header><span>APERÇU ADMIN · Question 1/40</span><button type="button" onClick={onClose} aria-label="Fermer">×</button></header><main>{video ? <video controls src={mediaUrl(video)} /> : image ? <img src={mediaUrl(image)} alt="Illustration de la question" /> : <div className="theory-preview-empty">Aucun média</div>}{question.audio_path && <audio controls src={mediaUrl(question.audio_path)} />}</main><div className="theory-preview-content"><p>{question.question_text}</p>{isMultiple && <small>Plusieurs réponses possibles</small>}<div>{(question.options || []).map((option, index) => <button type="button" key={option.id} className={`${selected.includes(option.id) ? "selected" : ""} ${validated && option.is_correct ? "correct" : ""} ${validated && selected.includes(option.id) && !option.is_correct ? "wrong" : ""}`} onClick={() => !validated && choose(option.id)}><b>{String.fromCharCode(65 + index)}</b>{option.label}</button>)}</div>{!validated ? <button type="button" className="theory-primary" disabled={!selected.length} onClick={() => setValidated(true)}>VALIDER</button> : <aside className={isCorrect ? "success" : "failure"}><strong>{isCorrect ? "Bonne réponse" : "Réponse incorrecte"}</strong><p>{question.explanation}</p></aside>}</div><footer><button type="button" disabled>← Précédent</button><button type="button" disabled>Suivant →</button></footer></section></div>;
}
