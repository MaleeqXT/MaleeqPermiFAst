export const SURVEYS = {
  before: {
    title: "🚗 Enquête de satisfaction - Avant la formation",
    sections: [{ title: "Accueil et inscription", questions: [
      { id: "before_welcome", type: "star", label: "Comment évaluez-vous l’accueil reçu lors de votre premier contact avec PassPermisFacile ?" },
      { id: "before_info", type: "star", label: "Les informations fournies par notre secrétariat étaient-elles claires et complètes ?" },
      { id: "before_speed", type: "star", label: "Notre équipe a-t-elle répondu rapidement à vos questions ?" },
      { id: "before_signup", type: "star", label: "Le processus d’inscription était-il simple et facile à comprendre ?" },
      { id: "before_source", type: "choice", label: "Comment avez-vous connu PassPermisFacile ?", options: ["Google", "Réseaux sociaux", "Recommandation", "Passage devant l’agence", "Autre"] },
      { id: "before_comment", type: "comment", label: "Commentaire libre :" },
    ] }],
  },
  during: {
    title: "🚗 Enquête de satisfaction - Pendant la formation",
    sections: [
      { title: "Secrétariat et suivi administratif", questions: [
        { id: "during_availability", type: "star", label: "Êtes-vous satisfait de la disponibilité de notre secrétariat ?" },
        { id: "during_planning", type: "star", label: "La gestion de vos rendez-vous et de votre planning vous satisfait-elle ?" },
        { id: "during_updates", type: "star", label: "Recevez-vous les informations importantes en temps voulu ?" },
      ] },
      { title: "Formation", questions: [
        { id: "during_teaching", type: "star", label: "Êtes-vous satisfait de la qualité de l’enseignement dispensé ?" },
        { id: "during_teacher", type: "star", label: "Votre enseignant est-il pédagogue et à l’écoute ?" },
        { id: "during_progress", type: "star", label: "Vous sentez-vous progresser dans votre apprentissage ?" },
        { id: "during_vehicle", type: "star", label: "Les véhicules mis à disposition sont-ils propres et confortables ?" },
        { id: "during_hours", type: "star", label: "Les horaires proposés correspondent-ils à vos disponibilités ?" },
        { id: "during_comment", type: "comment", label: "Commentaire libre :" },
      ] },
    ],
  },
  after: {
    title: "🚗 Enquête de satisfaction - Après la formation",
    sections: [
      { title: "Bilan général", questions: [{ id: "after_global", type: "star", label: "Êtes-vous satisfait de votre expérience globale chez PassPermisFacile ?" }] },
      { title: "Accueil et secrétariat", questions: [
        { id: "after_welcome", type: "star", label: "Comment évaluez-vous la qualité de l’accueil tout au long de votre formation ?" },
        { id: "after_secretariat", type: "star", label: "Comment évaluez-vous le professionnalisme et la réactivité du secrétariat ?" },
      ] },
      { title: "Enseignement", questions: [
        { id: "after_support", type: "star", label: "Comment évaluez-vous la qualité de l’accompagnement de votre ou vos enseignants ?" },
        { id: "after_exam", type: "star", label: "L’accompagnement jusqu’à l’examen a-t-il répondu à vos attentes ?" },
      ] },
      { title: "Recommandation", questions: [
        { id: "after_recommend", type: "star", label: "Recommanderiez-vous PassPermisFacile à votre entourage ?" },
        { id: "after_score", type: "star", label: "Quelle note globale attribuez-vous à PassPermisFacile ?", hint: "⭐ 1 à ⭐⭐⭐⭐⭐ 5" },
      ] },
      { title: "Avis Google", questions: [{ id: "after_google", type: "choice", label: "Souhaitez-vous partager votre expérience sur Google ?", options: ["Oui", "Plus tard", "Non"] }, { id: "after_comment", type: "comment", label: "Que pouvons-nous améliorer ?" }] },
    ],
  },
};
