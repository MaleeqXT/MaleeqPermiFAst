import { useCallback, useEffect, useMemo, useState } from "react";
import http from "../helpers/http.jsx";
import "./TheoryAdmin.css";
import "./TheorySeriesAdmin.css";

const emptySeries = { type: "training", title: "", description: "", duration_minutes: 40, sort_order: 0 };
const statusLabel = { published: "Publiée", draft: "Brouillon", archived: "Archivée" };

export default function AdminTheorySeriesPage() {
  const [series, setSeries] = useState([]);
  const [filters, setFilters] = useState({ type: "", status: "" });
  const [categories, setCategories] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(null);
  const [questionIds, setQuestionIds] = useState([]);
  const [questionBank, setQuestionBank] = useState([]);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionCategory, setQuestionCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ per_page: "50" });
      if (filters.type) params.set("type", filters.type);
      if (filters.status) params.set("status", filters.status);
      const [seriesResponse, categoryResponse] = await Promise.all([
        http.get(`/admin/theory/series?${params.toString()}`),
        http.get("/admin/theory/categories"),
      ]);
      setSeries(seriesResponse.data?.data || []);
      setCategories(categoryResponse.data?.data || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger les séries.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const loadQuestionBank = useCallback(async () => {
    try {
      const params = new URLSearchParams({ per_page: "30" });
      if (questionSearch) params.set("search", questionSearch);
      if (questionCategory) params.set("category_id", questionCategory);
      const response = await http.get(`/admin/theory/question-bank?${params.toString()}`);
      setQuestionBank(response.data?.data || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible de charger la banque de questions.");
    }
  }, [questionCategory, questionSearch]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (selected) loadQuestionBank(); }, [loadQuestionBank, selected]);

  const selectSeries = async (item) => {
    setSaving(true);
    setError("");
    try {
      const response = await http.get(`/admin/theory/series/${item.id}`);
      const detail = response.data?.data;
      setSelected(detail);
      setForm({
        type: detail.type,
        title: detail.title,
        description: detail.description || "",
        duration_minutes: detail.duration_minutes || 40,
        sort_order: detail.sort_order || 0,
      });
      setQuestionIds((detail.questions || []).sort((a, b) => a.sort_order - b.sort_order).map((question) => question.id));
      setNotice("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Impossible d’ouvrir cette série.");
    } finally {
      setSaving(false);
    }
  };

  const createSeries = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await http.post("/admin/theory/series", form);
      setNotice("Série créée. Ajoutez des questions au pool (au moins 40) avant de la publier.");
      await load();
      await selectSeries(response.data?.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "La série n’a pas pu être créée.");
    } finally {
      setSaving(false);
    }
  };

  const saveSeries = async (event) => {
    event.preventDefault();
    if (!selected) {
      await createSeries();
      return;
    }
    setSaving(true);
    setError("");
    try {
      await http.put(`/admin/theory/series/${selected.id}`, form);
      await http.put(`/admin/theory/series/${selected.id}/questions`, { question_ids: questionIds });
      setNotice("Série et affectation enregistrées.");
      await load();
      await selectSeries({ id: selected.id });
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.question_ids?.[0] || requestError.response?.data?.message || "L’enregistrement a échoué.");
    } finally {
      setSaving(false);
    }
  };

  const changePublication = async (item, status) => {
    setSaving(true);
    setError("");
    try {
      await http.patch(`/admin/theory/series/${item.id}/publication`, { status });
      setNotice(status === "published" ? "Série publiée." : "Statut de la série mis à jour.");
      await load();
      if (selected?.id === item.id) await selectSeries({ id: item.id });
    } catch (requestError) {
      setError(requestError.response?.data?.errors?.status?.[0] || requestError.response?.data?.message || "Le statut n’a pas pu être modifié.");
    } finally {
      setSaving(false);
    }
  };

  const selectedQuestions = useMemo(() => {
    const existing = new Map((selected?.questions || []).map((question) => [question.id, question]));
    return questionIds.map((id) => existing.get(id) || questionBank.find((question) => question.id === id) || {
      id,
      public_id: "Question",
      question_text: "Chargement…",
    });
  }, [questionBank, questionIds, selected]);

  const toggleQuestion = (id) => {
    setQuestionIds((current) => current.includes(id)
      ? current.filter((questionId) => questionId !== id)
      : current.length < 40 ? [...current, id] : current);
  };

  const startNew = () => {
    setSelected(null);
    setForm(emptySeries);
    setQuestionIds([]);
    setQuestionBank([]);
    setNotice("");
    setError("");
  };

  return <div className="theory-admin-page theory-series-admin">
    <div className="theory-admin-header">
      <div>
        <p className="theory-eyebrow">CODE DE LA ROUTE</p>
        <h1>Séries d’entraînement et examens</h1>
        <p>Attribuez uniquement des questions existantes. Une série publiée doit avoir un pool d’au moins 40 questions ; l’élève en reçoit 40 au hasard.</p>
      </div>
      <button type="button" className="theory-primary" onClick={startNew}>+ Nouvelle série</button>
    </div>
    {error && <div className="theory-alert theory-alert--error" role="alert">{error}</div>}
    {notice && <div className="theory-alert theory-alert--success">{notice}</div>}

    <div className="theory-series-layout">
      <section className="theory-question-panel theory-series-list">
        <div className="theory-toolbar">
          <select value={filters.type} onChange={(event) => setFilters((value) => ({ ...value, type: event.target.value }))}>
            <option value="">Toutes les séries</option>
            <option value="training">Entraînement</option>
            <option value="exam">Examen blanc</option>
          </select>
          <select value={filters.status} onChange={(event) => setFilters((value) => ({ ...value, status: event.target.value }))}>
            <option value="">Tous les statuts</option>
            <option value="published">Publiées</option>
            <option value="draft">Brouillons</option>
            <option value="archived">Archivées</option>
          </select>
          <button className="theory-secondary" type="button" onClick={load}>Filtrer</button>
        </div>
        <div className="theory-series-list-items">
          {loading ? <p className="theory-empty">Chargement…</p> : series.map((item) => <article key={item.id} className={selected?.id === item.id ? "selected" : ""}>
            <button type="button" onClick={() => selectSeries(item)}>
              <span><strong>{item.title}</strong><small>{item.type === "training" ? "Entraînement" : `Examen · ${item.duration_minutes || 40} min`}</small></span>
              <span className={`theory-status theory-status--${item.status}`}>{statusLabel[item.status]}</span>
            </button>
            <footer>
              <span className={item.questions_count >= 40 ? "complete" : "incomplete"}>{item.questions_count} questions dans le pool</span>
              {item.status !== "published" && <button type="button" disabled={saving || item.questions_count < 40} onClick={() => changePublication(item, "published")}>Publier</button>}
              {item.status === "published" && <button type="button" disabled={saving} onClick={() => changePublication(item, "draft")}>Dépublier</button>}
            </footer>
          </article>)}
        </div>
      </section>

      {form && <SeriesEditor
        form={form}
        selected={selected}
        questionIds={questionIds}
        selectedQuestions={selectedQuestions}
        questionBank={questionBank}
        categories={categories}
        questionSearch={questionSearch}
        questionCategory={questionCategory}
        saving={saving}
        setForm={setForm}
        setQuestionSearch={setQuestionSearch}
        setQuestionCategory={setQuestionCategory}
        onSearch={loadQuestionBank}
        onToggleQuestion={toggleQuestion}
        onCancel={startNew}
        onSubmit={saveSeries}
      />}
      {!form && <section className="theory-question-panel theory-series-empty"><h2>Sélectionnez une série</h2><p>Choisissez une série dans la liste ou créez-en une nouvelle pour gérer son titre, sa publication et son pool de questions.</p></section>}
    </div>
  </div>;
}

function SeriesEditor({ form, selected, questionIds, selectedQuestions, questionBank, categories, questionSearch, questionCategory, saving, setForm, setQuestionSearch, setQuestionCategory, onSearch, onToggleQuestion, onCancel, onSubmit }) {
  return <form className="theory-question-panel theory-series-editor" onSubmit={onSubmit}>
    <div className="theory-series-editor-title">
      <div><span>{selected ? "MODIFIER LA SÉRIE" : "NOUVELLE SÉRIE"}</span><h2>{selected?.title || "Préparer une série"}</h2></div>
      {selected && <button type="button" className="theory-secondary" onClick={onCancel}>Fermer</button>}
    </div>
    <div className="theory-form-row">
      <label>Type<select value={form.type} onChange={(event) => setForm((value) => ({ ...value, type: event.target.value }))}><option value="training">Entraînement</option><option value="exam">Examen blanc</option></select></label>
      <label>Ordre d’affichage<input type="number" min="0" value={form.sort_order} onChange={(event) => setForm((value) => ({ ...value, sort_order: Number(event.target.value) }))} /></label>
    </div>
    <label>Titre<input required value={form.title} onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))} /></label>
    {form.type === "exam" && <label>Durée (minutes)<input required type="number" min="1" max="180" value={form.duration_minutes} onChange={(event) => setForm((value) => ({ ...value, duration_minutes: Number(event.target.value) }))} /></label>}
    <label>Description<textarea value={form.description} onChange={(event) => setForm((value) => ({ ...value, description: event.target.value }))} placeholder="Optionnelle, visible par l’élève" /></label>
    {selected && <>
      <div className="theory-series-count"><strong>{questionIds.length}/200 questions dans le pool</strong><span>{questionIds.length >= 40 ? "La série peut être publiée : chaque élève recevra 40 questions tirées au hasard." : `${40 - questionIds.length} question(s) manquante(s) avant publication.`}</span></div>
      <div className="theory-assignment-grid">
        <div>
          <h3>Questions retenues</h3>
          <ol>{selectedQuestions.map((question, index) => <li key={question.id}><span><strong>{index + 1}. {question.public_id}</strong><small>{question.question_text}</small></span><button type="button" onClick={() => onToggleQuestion(question.id)} aria-label="Retirer la question">×</button></li>)}</ol>
        </div>
        <div>
          <h3>Banque de questions</h3>
          <div className="theory-bank-filters">
            <input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Rechercher une question" />
            <select value={questionCategory} onChange={(event) => setQuestionCategory(event.target.value)}><option value="">Tous les thèmes</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
            <button type="button" className="theory-secondary" onClick={onSearch}>Rechercher</button>
          </div>
          <div className="theory-bank-list">
            {questionBank.map((question) => {
              const picked = questionIds.includes(question.id);
              return <button type="button" key={question.id} className={picked ? "picked" : ""} onClick={() => onToggleQuestion(question.id)} disabled={!picked && questionIds.length >= 200}>
                <span>{picked ? "✓" : "+"}</span><div><strong>{question.public_id} · {question.category?.name}</strong><small>{question.question_text}</small></div>
              </button>;
            })}
          </div>
        </div>
      </div>
    </>}
    <div className="theory-drawer-actions"><button type="button" className="theory-secondary" onClick={onCancel}>Annuler</button><button type="submit" className="theory-primary" disabled={saving}>{saving ? "Enregistrement…" : selected ? "Enregistrer" : "Créer la série"}</button></div>
  </form>;
}
