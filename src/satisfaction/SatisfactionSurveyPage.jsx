import { useMemo, useState } from "react";
import "./SatisfactionSurveyPage.css";

function Icon({ children, strokeWidth = 2 }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{children}</svg>;
}

const DownloadIcon = () => <Icon><path d="M12 3v12m0 0 4-4m-4 4-4-4" /><path d="M5 19v2h14v-2" /></Icon>;
const FilterIcon = () => <Icon><path d="M4 5h16M7 12h10M10 19h4" /></Icon>;
const ResetIcon = () => <Icon><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></Icon>;
const StarIcon = () => <Icon><path d="m12 2.8 2.8 5.7 6.3.9-4.6 4.5 1.1 6.3-5.6-3-5.6 3 1.1-6.3-4.6-4.5 6.3-.9Z" fill="currentColor" stroke="none" /></Icon>;
const UsersIcon = () => <Icon><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></Icon>;
const ThumbIcon = () => <Icon><path d="M7 10v12H3V10h4ZM7 20h10.5a2 2 0 0 0 1.9-1.4l2.3-7A2 2 0 0 0 19.8 9H15l.8-3.4A3 3 0 0 0 13 2l-1 4-5 4" /></Icon>;
const CarIcon = () => <Icon><path d="M5 17H3v-4l2-2 2-4h10l2 4 2 2v4h-2M5 17h14M7 17v2M17 17v2M6 11h12" /><circle cx="7" cy="15" r="1" /><circle cx="17" cy="15" r="1" /></Icon>;
const WheelIcon = () => <Icon><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /><path d="M3.5 10h17M12 14v7M7 10l5 4 5-4" /></Icon>;
const TrophyIcon = () => <Icon><path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" /><path d="M7 6H4v2a4 4 0 0 0 4 4M17 6h3v2a4 4 0 0 1-4 4" /></Icon>;
const AlertIcon = () => <Icon><path d="M10.3 2.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 2.9a2 2 0 0 0-3.4 0Z" fill="currentColor" stroke="none" /><path d="M12 8v5M12 17h.01" stroke="#fff" /></Icon>;
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></Icon>;
const ChevronRightIcon = () => <Icon><path d="m9 18 6-6-6-6" /></Icon>;
const SmileIcon = ({ mood }) => <Icon><circle cx="12" cy="12" r="9" /><path d="M8 9h.01M16 9h.01" />{mood === "negative" ? <path d="M8 17c1-3 7-3 8 0" /> : mood === "watch" ? <path d="M8 16h8" /> : <path d="M8 14c1 3 7 3 8 0" />}</Icon>;

const KPI_CARDS = [
  { id: "score", tone: "green", icon: <StarIcon />, label: "Note moyenne", value: "4,7 / 5", change: "↑ +0,2", caption: "vs période précédente" },
  { id: "answers", tone: "blue", icon: <UsersIcon />, label: "Nombre de réponses", value: "482", change: "↑ +18%", caption: "vs période précédente" },
  { id: "recommendation", tone: "green", icon: <ThumbIcon />, label: "Taux de recommandation", value: "92 %", change: "↑ +4%", caption: "vs période précédente" },
];

const STAGES = [
  { id: "before", title: "Avant la formation", score: "4,5 / 5", tone: "blue", icon: <CarIcon />, rows: [["Accueil", "4,6", "good"], ["Informations", "4,4", "warn"], ["Réactivité", "4,5", "good"], ["Inscription", "4,5", "good"]], footer: "Origine des élèves" },
  { id: "during", title: "Pendant la formation", score: "4,7 / 5", tone: "green", icon: <WheelIcon />, rows: [["Secrétariat", "4,6", "good"], ["Planning", "4,3", "warn"], ["Communication", "4,6", "good"], ["Enseignement", "4,8", "good"], ["Pédagogie", "4,7", "good"], ["Progression", "4,6", "good"], ["Véhicules", "4,5", "good"], ["Horaires", "4,4", "warn"]] },
  { id: "after", title: "Après la formation", score: "4,6 / 5", tone: "amber", icon: <TrophyIcon />, rows: [["Expérience globale", "4,7", "good"], ["Accueil", "4,6", "good"], ["Secrétariat", "4,5", "good"], ["Enseignants", "4,7", "good"], ["Accompagnement examen", "4,6", "good"], ["Recommandation", "4,7", "good"], ["Note globale", "4,6", "good"], ["Avis Google", "4,8", "good"]] },
];

const ALERTS = [
  { id: 1, title: "Planning (Toulouse)", detail: "30 derniers jours · 12 réponses", score: "3,7", severity: "danger" },
  { id: 2, title: "Horaires (Toulouse)", detail: "30 derniers jours · 8 réponses", score: "3,9", severity: "warning" },
  { id: 3, title: "Véhicules (Creil)", detail: "30 derniers jours · 10 réponses", score: "4,0", severity: "warning" },
  { id: 4, title: "Inscription (Toulouse)", detail: "30 derniers jours · 9 réponses", score: "4,1", severity: "warning" },
];

const COMPARISON_CATEGORIES = ["Accueil", "Informations", "Réactivité", "Inscription", "Secrétariat", "Planning", "Communication", "Enseignement", "Pédagogie", "Progression", "Véhicules", "Horaires", "Exp. globale", "Recommandation", "Note globale"];
const COMPARISON_VALUES = [[4.3,4.4,4.2],[4,3.9,4],[4.1,4,4.1],[4,4.1,4],[4.3,4.4,4.2],[3.8,3.9,4],[4.3,4.2,4.1],[4.6,4.7,4.5],[4.3,4.5,4.4],[4.2,4.4,4.3],[4,4.1,4],[4,4.2,4.1],[4.5,4.6,4.5],[4.4,4.5,4.4],[4.5,4.6,4.5]];

const COMMENTS = [
  { id: 1, name: "Lucas M.", details: "Permis B · Creil · 12/07/2025", text: "Super équipe, moniteur très pédagogue ! Je recommande vivement Pass Permis Facile.", category: "Enseignement", score: "5/5", sentiment: "positive" },
  { id: 2, name: "Sarah K.", details: "Permis B · Toulouse · 11/07/2025", text: "Le planning est parfois compliqué à suivre, mais sinon très bonne expérience.", category: "Planning", score: "3/5", sentiment: "watch" },
  { id: 3, name: "Thomas R.", details: "Permis B · Creil · 10/07/2025", text: "Trop d'attente pour les réponses du secrétariat...", category: "Secrétariat", score: "2/5", sentiment: "negative" },
  { id: 4, name: "Emma L.", details: "Permis B · Creil · 09/07/2025", text: "Une formation au top, moniteur à l'écoute et très professionnel !", category: "Expérience globale", score: "5/5", sentiment: "positive" },
];

const INSTRUCTORS = [
  { name: "Jordy", initials: "JO", score: "4,8/5", answers: "37 réponses", tone: "blue" },
  { name: "Ahmed", initials: "AH", score: "4,6/5", answers: "28 réponses", tone: "amber" },
  { name: "Sophie", initials: "SO", score: "4,7/5", answers: "31 réponses", tone: "purple" },
  { name: "Thomas", initials: "TH", score: "4,5/5", answers: "24 réponses", tone: "green" },
];

function KpiCard({ card }) {
  return <article className="sat-card sat-kpi"><span className={`sat-kpi-icon sat-tone-${card.tone}`}>{card.icon}</span><div><span>{card.label}</span><strong>{card.value}</strong><em>{card.change}</em><small>{card.caption}</small></div></article>;
}

function StageChart() {
  const chart = [{ label: "Avant la formation", score: 4.5, satisfaction: 88 }, { label: "Pendant la formation", score: 4.7, satisfaction: 94 }, { label: "Après la formation", score: 4.6, satisfaction: 92 }];
  return <section className="sat-card sat-stage-chart"><div className="sat-card-head"><h2>Satisfaction par grande étape</h2><div className="sat-chart-legend"><span><i className="blue" />Note moyenne</span><span><i className="green" />Taux de satisfaction</span></div></div><div className="sat-bars-plot"><div className="sat-y-axis"><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div><div className="sat-bars-groups">{chart.map((item) => <div key={item.label} className="sat-bar-group"><div className="sat-bar-pair"><div className="sat-bar sat-bar-blue" style={{ height: `${item.score * 20}%` }}><span>{String(item.score).replace(".", ",")}</span></div><div className="sat-bar sat-bar-green" style={{ height: `${item.satisfaction}%` }}><span>{item.satisfaction}%</span></div></div><strong>{item.label}</strong></div>)}</div><div className="sat-right-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div></div></section>;
}

function EvolutionChart() {
  const points = "22,133 87,88 152,83 217,78 282,55 347,43 412,54 477,39";
  return <section className="sat-card sat-evolution"><div className="sat-card-head"><h2>Évolution de la note moyenne</h2><select defaultValue="6"><option value="6">6 mois</option><option value="12">12 mois</option></select></div><svg viewBox="0 0 510 184" role="img" aria-label="Évolution de la note moyenne de 3,7 à 4,7"><defs><linearGradient id="satArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1688e8" stopOpacity=".2" /><stop offset="1" stopColor="#1688e8" stopOpacity="0" /></linearGradient></defs>{[32,72,112,152].map((y) => <line key={y} x1="22" y1={y} x2="477" y2={y} className="sat-gridline" />)}<path d={`M${points} L477,152 L22,152 Z`} fill="url(#satArea)" /><polyline points={points} className="sat-line" />{points.split(" ").map((point) => { const [x,y] = point.split(","); return <circle key={point} cx={x} cy={y} r="4" className="sat-line-point" />; })}<g className="sat-axis-labels"><text x="4" y="36">5</text><text x="4" y="76">4</text><text x="4" y="116">3</text>{["Jan","Fév","Mar","Avr","Mai","Juin","Juil"].map((month, index) => <text key={month} x={22 + index * 65} y="174" textAnchor="middle">{month}</text>)}</g><g className="sat-final-label"><rect x="447" y="12" width="38" height="24" rx="6" /><text x="466" y="29" textAnchor="middle">4,7</text></g></svg></section>;
}

function StageCard({ stage }) {
  return <article className="sat-card sat-stage-card"><header><span className={`sat-stage-icon sat-tone-${stage.tone}`}>{stage.icon}</span><div><h3>{stage.title}</h3><strong>{stage.score}</strong></div></header><div className="sat-stage-rows">{stage.rows.map(([label, score, tone]) => <div key={label}><span>{label}</span><strong className={`sat-score-${tone}`}>{score}</strong></div>)}</div>{stage.footer && <button type="button">{stage.footer}<ChevronRightIcon /></button>}</article>;
}

function OriginCard() {
  return <section className="sat-card sat-origin"><h2>Origine des élèves</h2><div className="sat-origin-content"><div className="sat-donut"><div><strong>482</strong><span>réponses</span></div></div><div className="sat-origin-legend"><span><i className="blue" />Creil <strong>58%</strong></span><span><i className="green" />Toulouse <strong>37%</strong></span><span><i className="gray" />Autre <strong>5%</strong></span></div></div></section>;
}

function AlertsCard() {
  return <section className="sat-card sat-alerts"><div className="sat-card-head"><div className="sat-alert-heading"><AlertIcon /><h2>Alertes satisfaction faible</h2></div><button type="button">Voir toutes</button></div><div>{ALERTS.map((alert) => <article key={alert.id} className={`sat-alert-row sat-alert-${alert.severity}`}><AlertIcon /><div><strong>{alert.title}</strong><small>{alert.detail}</small></div><em>{alert.score}</em></article>)}</div></section>;
}

function ComparisonChart() {
  return <section className="sat-card sat-comparison"><div className="sat-card-head"><h2>Comparatif de toutes les catégories</h2><div className="sat-chart-legend"><span><i className="blue" />Creil</span><span><i className="green" />Toulouse</span><span><i className="gray" />Global</span></div></div><div className="sat-comparison-scroll"><div className="sat-comparison-plot"><div className="sat-comparison-y"><span>5</span><span>4</span><span>3</span><span>2</span><span>1</span><span>0</span></div><div className="sat-comparison-groups">{COMPARISON_CATEGORIES.map((category, index) => <div key={category} className="sat-comparison-group"><div>{COMPARISON_VALUES[index].map((value, valueIndex) => <i key={valueIndex} className={["blue","green","gray"][valueIndex]} style={{ height: `${value * 20}%` }} />)}</div><span>{category}</span></div>)}</div></div></div></section>;
}

function CommentsCard() {
  const [activeTab, setActiveTab] = useState("all");
  const [query, setQuery] = useState("");
  const [treated, setTreated] = useState([]);
  const filteredComments = useMemo(() => COMMENTS.filter((comment) => (activeTab === "all" || comment.sentiment === activeTab) && `${comment.name} ${comment.details} ${comment.text} ${comment.category}`.toLowerCase().includes(query.toLowerCase())), [activeTab, query]);
  const tabs = [["all","Tous (482)"],["positive","Positifs (362)"],["watch","À surveiller (78)"],["negative","Négatifs (42)"]];
  return <section className="sat-card sat-comments"><h2>Derniers commentaires des élèves</h2><div className="sat-comments-toolbar"><div className="sat-tabs" role="tablist" aria-label="Filtrer les commentaires">{tabs.map(([id,label]) => <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}</button>)}</div><label className="sat-search"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un commentaire..." aria-label="Rechercher un commentaire" /></label></div><div className="sat-comment-list">{filteredComments.map((comment) => <article key={comment.id} className={`sat-comment sat-comment-${comment.sentiment}`}><span className="sat-face"><SmileIcon mood={comment.sentiment} /></span><div className="sat-comment-copy"><strong>{comment.name}</strong><small>{comment.details}</small><p>{comment.text}</p></div><span className="sat-category">{comment.category}</span><strong className="sat-comment-score">{comment.score}</strong><button type="button" className={treated.includes(comment.id) ? "is-treated" : ""} onClick={() => setTreated((current) => current.includes(comment.id) ? current : [...current, comment.id])}>{treated.includes(comment.id) ? "Traité" : "Marquer comme traité"}</button></article>)}{filteredComments.length === 0 && <p className="sat-empty">Aucun commentaire ne correspond à votre recherche.</p>}</div></section>;
}

function ZoomCard() {
  return <section className="sat-card sat-zoom"><div className="sat-card-head"><h2>Zoom sur une catégorie</h2><select defaultValue="Enseignement"><option>Enseignement</option><option>Planning</option><option>Accueil</option></select></div><div>{INSTRUCTORS.map((instructor) => <article key={instructor.name}><span className={`sat-avatar sat-avatar-${instructor.tone}`}>{instructor.initials}</span><strong>{instructor.name}</strong><em>{instructor.score}</em><small>{instructor.answers}</small><button type="button">Voir les commentaires<ChevronRightIcon /></button></article>)}</div></section>;
}

export default function SatisfactionSurveyPage() {
  const initialFilters = { agency: "all", period: "30", instructor: "all", training: "all" };
  const [filters, setFilters] = useState(initialFilters);
  const updateFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div className="sat-page">
      <div className="sat-shell">
        <header className="sat-page-heading">
          <div>
            <span>PASS PERMIS FACILE</span>
            <h1>Enquêtes de satisfaction</h1>
            <p>Les retours de nos élèves pour toujours progresser</p>
          </div>
          <button type="button" title="Export visuel uniquement">
            <DownloadIcon />Exporter le rapport
          </button>
        </header>

        <form className="sat-filters" onSubmit={(event) => event.preventDefault()}>
          <label><span>Agence</span><select value={filters.agency} onChange={(event) => updateFilter("agency", event.target.value)}><option value="all">Toutes les agences</option><option>Creil</option><option>Toulouse</option></select></label>
          <label><span>Période</span><select value={filters.period} onChange={(event) => updateFilter("period", event.target.value)}><option value="30">30 jours</option><option value="90">3 mois</option><option value="180">6 mois</option></select></label>
          <label><span>Moniteur</span><select value={filters.instructor} onChange={(event) => updateFilter("instructor", event.target.value)}><option value="all">Tous les moniteurs</option><option>Jordy</option><option>Ahmed</option></select></label>
          <label><span>Formation</span><select value={filters.training} onChange={(event) => updateFilter("training", event.target.value)}><option value="all">Toutes les formations</option><option>Permis B</option><option>Conduite accompagnée</option></select></label>
          <button type="submit" className="sat-filter-button"><FilterIcon />Filtrer</button>
          <button type="button" className="sat-reset-button" onClick={() => setFilters(initialFilters)}><ResetIcon />Réinitialiser</button>
        </form>

        <section className="sat-kpi-grid" aria-label="Indicateurs de satisfaction">
          {KPI_CARDS.map((card) => <KpiCard key={card.id} card={card} />)}
          <article className="sat-card sat-kpi sat-google-kpi">
            <span className="sat-google-mark">G</span>
            <div>
              <span>Avis Google</span>
              <strong>4,8 / 5</strong>
              <em>(256 avis)</em>
              <div className="sat-google-stars" aria-label="5 étoiles">★★★★★</div>
              <button type="button">Voir les avis Google <span>→</span></button>
            </div>
          </article>
        </section>

        <div className="sat-chart-grid">
          <StageChart />
          <EvolutionChart />
        </div>

        <div className="sat-lower-grid">
          <div className="sat-lower-left">
            <div className="sat-stage-grid">
              {STAGES.map((stage) => <StageCard key={stage.id} stage={stage} />)}
            </div>
            <ComparisonChart />
          </div>
          <aside className="sat-side-stack">
            <OriginCard />
            <AlertsCard />
          </aside>
        </div>

        <div className="sat-bottom-grid">
          <CommentsCard />
          <aside className="sat-bottom-side">
            <ZoomCard />
            <section className="sat-quote">
              <blockquote>« Vos retours nous aident à faire<br />toujours mieux. Merci ! »</blockquote>
              <div><WheelIcon /><strong>PASS PERMIS FACILE</strong></div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
