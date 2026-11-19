/*
 * The two standalone pre-training services and the questionnaire that
 * separates them. offers.evaluation_service holds the same keys.
 *
 *  - conduite: Évaluation de conduite, first driving assessment for a learner
 *    with no supervised driving experience (estimates the hours needed).
 *  - bilan: Bilan de compétences, for a learner who already has driving
 *    training or exam experience (measures acquired competencies).
 */

export const EVALUATION_SERVICES = {
  conduite: {
    label: "Évaluation de conduite",
    short: "Évaluation de départ",
    description: "Vous débutez : un enseignant évalue votre niveau de départ au volant et estime le nombre d’heures de formation nécessaires avant votre contrat.",
  },
  bilan: {
    label: "Bilan de compétences",
    short: "Bilan",
    description: "Vous avez déjà une expérience de conduite encadrée : un enseignant fait le point sur les compétences déjà acquises et celles qu’il reste à travailler.",
  },
};

const YES_NO = [{ value: "oui", label: "Oui" }, { value: "non", label: "Non" }];

// Any "oui" to an experience question means the learner needs a Bilan.
export const QUESTIONS = [
  { id: "lessons", title: "Avez-vous déjà pris des leçons de conduite dans une auto-école ?", options: YES_NO, experience: true },
  { id: "exam", title: "Avez-vous déjà passé l’examen pratique du permis de conduire ?", options: YES_NO, experience: true },
  { id: "transfer", title: "Changez-vous d’auto-école (transfert de votre dossier ou de votre livret) ?", options: YES_NO, experience: true },
  { id: "accompanied", title: "Avez-vous déjà pratiqué la conduite accompagnée ou supervisée ?", options: YES_NO, experience: true },
  { id: "gearbox", title: "Sur quelle boîte de vitesses souhaitez-vous être évalué(e) ?", options: [{ value: "manuelle", label: "Boîte manuelle" }, { value: "automatique", label: "Boîte automatique" }] },
];

export function serviceFromAnswers(answers) {
  return QUESTIONS.some((question) => question.experience && answers[question.id] === "oui") ? "bilan" : "conduite";
}
