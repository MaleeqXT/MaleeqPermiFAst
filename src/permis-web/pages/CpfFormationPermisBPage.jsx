import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { useMemo } from "react";
import "./CpfFormationPermisBPage.css";

const tarifsManuelAvecCode = [
    { label: 'Pack Intensif 6 h', hours: '6 heures', price: '750 €' },
    { label: 'Pack Accéléré 12 h', hours: '12 heures', price: '1280 €' },
    { label: 'Pack Accéléré 22 h', hours: '22 heures', price: '2150 €' },
    { label: 'Pack Accéléré 27 h', hours: '27 heures', price: '2590 €' },
    { label: 'Pack Accéléré 31 h', hours: '31 heures', price: '3030 €' },
    { label: 'Pack Accéléré 37 h', hours: '37 heures', price: '3470 €' },
    { label: 'Pack Expert 42 h', hours: '42 heures', price: '3920 €' },
];


const history = [
    { year: '2023', code: '69 %', conduite: '61 %' },
    { year: '2024', code: '72 %', conduite: '64 %' },
];

const tarifsManuelSansCode = [
    { label: 'Forfait 6 h sans code', hours: '6 heures', price: '550 €' },
    { label: 'Forfait 12 h sans code', hours: '12 heures', price: '1080 €' },
    { label: 'Forfait 22 h sans code', hours: '22 heures', price: '1950 €' },
    { label: 'Forfait 27 h sans code', hours: '27 heures', price: '2390 €' },
    { label: 'Forfait 31 h sans code', hours: '31 heures', price: '2830 €' },
    { label: 'Forfait 37 h sans code', hours: '37 heures', price: '3270 €' },
    { label: 'Forfait 42 h sans code', hours: '42 heures', price: '3720 €' },
];

const tarifsAutoSansCode = [
    { label: 'Pack 7 h', hours: '7 heures', price: '750 €' },
    { label: 'Pack 12 h', hours: '12 heures', price: '1490 €' },
    { label: 'Pack 22 h', hours: '22 heures', price: '2150 €' },
    { label: 'Pack 27 h', hours: '27 heures', price: '2490 €' },
    { label: 'Pack 31 h', hours: '31 heures', price: '2930 €' },
    { label: 'Pack 37 h', hours: '37 heures', price: '3370 €' },
];

const tarifsAutoAvecCode = [
    { label: 'Forfait Conduite 7 h', hours: '7 heures', price: '950 €' },
    { label: 'Forfait Conduite 12 h', hours: '12 heures', price: '1690 €' },
    { label: 'Forfait Conduite 22 h', hours: '22 heures', price: '2350 €' },
    { label: 'Forfait Conduite 27 h', hours: '27 heures', price: '2690 €' },
    { label: 'Forfait Conduite 31 h', hours: '31 heures', price: '3130 €' },
    { label: 'Forfait Conduite 37 h', hours: '37 heures', price: '3570 €' },
];
const vueTemplate = String.raw`<template>
    <Head title="Informations Formation Permis B (CPF)" />

    <main class="bg-slate-50 text-slate-900">
        <section class="bg-[radial-gradient(circle_at_top,_rgba(109,40,217,0.35),_transparent_40%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] text-white">
            <div class="mx-auto max-w-6xl px-3 py-12 sm:px-6 lg:px-8">
                <div class="cpf-formation-hero-card rounded-[2rem] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur md:p-10">
                    <p class="text-xs font-bold uppercase tracking-[0.28em] text-fuchsia-200">Auto-école PassPermisFacile</p>
                    <h1 class="mt-3 text-3xl font-black leading-tight md:text-5xl">Informations Formation Permis B (CPF)</h1>
                    <p class="mt-4 max-w-4xl text-sm leading-7 text-slate-100 md:text-base">
                        Détails de la formation Permis B (infos légales et pédagogiques).
                    </p>
                </div>
            </div>
        </section>

        <section class="mx-auto max-w-6xl px-3 py-10 sm:px-6 lg:px-8">
            <div class="space-y-6">
                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">1. Description détaillée de la formation</p>
                    <h2 class="mt-2 text-2xl font-black">Description détaillée</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        La formation au permis de conduire catégorie B a pour objectif d’acquérir les compétences nécessaires pour
                        conduire un véhicule léger (voiture particulière) en toute sécurité, dans le respect de la réglementation
                        routière et des autres usagers.
                    </p>
                    <p class="mt-3 text-sm leading-7 text-slate-700">
                        Elle comprend une formation théorique (préparation au code de la route) et une formation pratique
                        (apprentissage de la conduite sur véhicule à boîte manuelle ou automatique).
                    </p>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>📘 Avec Code de la Route (formation complète)</li>
                        <li>🚗 Sans Code (formation pratique uniquement)</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">2. Objectifs de la formation</p>
                    <h2 class="mt-2 text-2xl font-black">Objectifs</h2>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Maîtriser les règles de circulation et de sécurité routière.</li>
                        <li>Développer une conduite responsable, économique et citoyenne.</li>
                        <li>Être capable de circuler en toute autonomie et de présenter l’examen pratique du permis B.</li>
                        <li>Obtenir la certification d’aptitude à la conduite délivrée par le ministère chargé des transports.</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">3. Public visé</p>
                    <h2 class="mt-2 text-2xl font-black">Public visé</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        Toute personne souhaitant obtenir le permis de conduire B pour des raisons personnelles ou professionnelles,
                        y compris dans le cadre d’un financement via le Compte Personnel de Formation (CPF).
                    </p>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">4. Prérequis</p>
                    <h2 class="mt-2 text-2xl font-black">Prérequis</h2>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Aucun prérequis obligatoire.</li>
                        <li>Être âgé de 17 ans minimum (ou 15 ans dans le cadre de la conduite accompagnée).</li>
                        <li>Savoir lire et comprendre le français.</li>
                        <li>Être apte médicalement à la conduite.</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">5. Modalités d’inscription</p>
                    <h2 class="mt-2 text-2xl font-black">Modalités d’inscription</h2>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Inscription possible directement en ligne via le formulaire “Être recontacté” ou auprès de nos agences à Toulouse et Creil.</li>
                        <li>Le dossier d’inscription est validé après :</li>
                        <li class="ml-6 list-disc">Signature du contrat de formation,</li>
                        <li class="ml-6 list-disc">Validation du financement (CPF ou autre),</li>
                        <li class="ml-6 list-disc">Transmission des pièces justificatives.</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">6. Délais d’accès</p>
                    <h2 class="mt-2 text-2xl font-black">Délais d’accès</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        L’entrée en formation est possible en moyenne sous 15 jours après validation du dossier d’inscription et,
                        le cas échéant, du financement CPF. Les dates sont ensuite planifiées selon les disponibilités du candidat et
                        de nos moniteurs.
                    </p>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">7. Durée moyenne de la formation</p>
                    <h2 class="mt-2 text-2xl font-black">Durée moyenne</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        La durée dépend du forfait choisi (6 à 42 heures de conduite, avec ou sans code). Une évaluation initiale
                        est réalisée avant le démarrage pour recommander le volume d’heures adapté.
                    </p>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">8. Méthodes pédagogiques</p>
                    <h2 class="mt-2 text-2xl font-black">Méthodes pédagogiques</h2>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Cours théoriques : préparation intensive au Code de la Route (10 heures présentielles).</li>
                        <li>Cours pratiques : leçons individuelles sur véhicule à boîte manuelle ou automatique.</li>
                        <li>Alternance d’explications, démonstrations, mises en situation réelles et retours pédagogiques.</li>
                        <li>Suivi individualisé de la progression du stagiaire.</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">9. Modalités d’évaluation</p>
                    <h2 class="mt-2 text-2xl font-black">Modalités d’évaluation</h2>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Évaluation initiale : test de positionnement avant l’entrée en formation.</li>
                        <li>Évaluations formatives tout au long du parcours pour suivre l’acquisition des compétences.</li>
                        <li>Évaluation finale : présentation à l’examen théorique (si code) et à l’examen pratique du permis B.</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">10. Tarifs / Financement / CPF</p>
                    <h2 class="mt-2 text-2xl font-black">Tarifs / Financement / CPF</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        Les forfaits proposés sont éligibles au CPF et varient selon le type de boîte (manuelle ou automatique) et
                        selon que la formation inclut ou non la préparation au code de la route. Tous les forfaits comprennent
                        l’inscription, les frais administratifs, les cours de code intensif (10 h en présentiel, pour les formules
                        “avec code”), les heures de conduite et l’accompagnement à l’examen lorsque prévu.
                    </p>

                    <div class="mt-6 grid gap-6 xl:grid-cols-2">
                        <div class="overflow-hidden rounded-2xl border border-slate-200">
                            <div class="bg-slate-900 px-4 py-3 text-sm font-bold text-white">Permis B - Boîte Manuelle - Avec Code</div>
                            <table class="w-full text-left text-sm">
                                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th class="px-4 py-3">Forfait</th>
                                        <th class="px-4 py-3">Heures</th>
                                        <th class="px-4 py-3">Tarif TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in tarifsManuelAvecCode" :key="item.label" class="border-t border-slate-200">
                                        <td class="px-4 py-3 font-medium text-slate-800">{{ item.label }}</td>
                                        <td class="px-4 py-3">{{ item.hours }}</td>
                                        <td class="px-4 py-3 font-semibold text-violet-700">{{ item.price }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="overflow-hidden rounded-2xl border border-slate-200">
                            <div class="bg-violet-700 px-4 py-3 text-sm font-bold text-white">Permis B - Boîte Manuelle - Sans Code</div>
                            <table class="w-full text-left text-sm">
                                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th class="px-4 py-3">Forfait</th>
                                        <th class="px-4 py-3">Heures</th>
                                        <th class="px-4 py-3">Tarif TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in tarifsManuelSansCode" :key="item.label" class="border-t border-slate-200">
                                        <td class="px-4 py-3 font-medium text-slate-800">{{ item.label }}</td>
                                        <td class="px-4 py-3">{{ item.hours }}</td>
                                        <td class="px-4 py-3 font-semibold text-violet-700">{{ item.price }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="overflow-hidden rounded-2xl border border-slate-200">
                            <div class="bg-slate-900 px-4 py-3 text-sm font-bold text-white">Permis B - Boîte Automatique - Sans Code</div>
                            <table class="w-full text-left text-sm">
                                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th class="px-4 py-3">Forfait</th>
                                        <th class="px-4 py-3">Heures</th>
                                        <th class="px-4 py-3">Tarif TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in tarifsAutoSansCode" :key="item.label" class="border-t border-slate-200">
                                        <td class="px-4 py-3 font-medium text-slate-800">{{ item.label }}</td>
                                        <td class="px-4 py-3">{{ item.hours }}</td>
                                        <td class="px-4 py-3 font-semibold text-violet-700">{{ item.price }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div class="overflow-hidden rounded-2xl border border-slate-200">
                            <div class="bg-violet-700 px-4 py-3 text-sm font-bold text-white">Permis B - Boîte Automatique - Avec Code</div>
                            <table class="w-full text-left text-sm">
                                <thead class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                                    <tr>
                                        <th class="px-4 py-3">Forfait</th>
                                        <th class="px-4 py-3">Heures</th>
                                        <th class="px-4 py-3">Tarif TTC</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="item in tarifsAutoAvecCode" :key="item.label" class="border-t border-slate-200">
                                        <td class="px-4 py-3 font-medium text-slate-800">{{ item.label }}</td>
                                        <td class="px-4 py-3">{{ item.hours }}</td>
                                        <td class="px-4 py-3 font-semibold text-violet-700">{{ item.price }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <p class="mt-6 text-sm leading-7 text-slate-700">
                        💡 Financement CPF : l’ensemble de ces formations est éligible au CPF. Le candidat doit disposer d’un compte
                        personnel de formation valide et d’un projet professionnel nécessitant le permis B. Pour consulter vos
                        droits : moncompteformation.gouv.fr
                    </p>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">11. Documents à fournir</p>
                    <h2 class="mt-2 text-2xl font-black">Documents à fournir</h2>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Pièce d’identité (valide)</li>
                        <li>Justificatif de domicile de moins de 3 mois</li>
                        <li>Photo d’identité numérique agréée ANTS</li>
                        <li>Attestation de recensement (ou JAPD si moins de 25 ans)</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">12. Taux de réussite</p>
                    <h2 class="mt-2 text-2xl font-black">Taux de réussite</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        Les taux de réussite dépendent de plusieurs facteurs : niveau initial du candidat, régularité des leçons,
                        implication personnelle et respect du parcours pédagogique recommandé.
                    </p>
                    <ul class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <li>Moyenne nationale permis B : ≈ 56% à 58%</li>
                        <li>Référence “auto-écoles classiques” : ≈ 60% médian</li>
                        <li>Chez PASS PERMIS FACILE, les taux détaillés pour 2024 sont aux alentours de 62,4%.</li>
                    </ul>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">13. Certification Qualiopi</p>
                    <h2 class="mt-2 text-2xl font-black">Certification Qualiopi</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        L’auto-école PassPermisFacile est certifiée Qualiopi au titre des actions de formation. Cette certification
                        atteste de la qualité du processus mis en œuvre pour le développement des compétences : accueil,
                        accompagnement, organisation et évaluation des stagiaires.
                    </p>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">14. Accessibilité et Handicap</p>
                    <h2 class="mt-2 text-2xl font-black">Accessibilité & Handicap</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        Nos formations sont accessibles aux personnes en situation de handicap, dans la mesure de nos capacités
                        d’adaptation. Un référent handicap est à votre disposition pour étudier vos besoins spécifiques et vous
                        proposer des solutions adaptées.
                    </p>
                    <div class="mt-4 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700 ring-1 ring-slate-100">
                        <p class="font-semibold">Référent handicap :</p>
                        <p>Monsieur ETIENNE Florian</p>
                        <p>📞 09.70.70.16.16</p>
                        <p>📧 passpermisfacile@gmail.com</p>
                    </div>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">15. Contact et Informations Légales</p>
                    <h2 class="mt-2 text-2xl font-black">Contact & Informations légales</h2>
                    <div class="mt-4 space-y-2 text-sm leading-7 text-slate-700">
                        <p>Auto-école PassPermisFacile</p>
                        <p>139 Bd Déodat de Sévérac, 31300 Toulouse</p>
                        <p>15 rue des Pierres, 60100 Creil</p>
                        <p>Numéro d’activité : 76311313631</p>
                        <p>Numéros d’agrément :</p>
                        <p class="ml-6">Toulouse : E2303100100</p>
                        <p class="ml-6">Creil : E2406000100</p>
                        <p>Téléphone : 09.70.70.16.16</p>
                        <p>E-mail : contact@passpermisfacile.fr</p>
                    </div>
                </article>

                <article class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <p class="text-xs font-bold uppercase tracking-[0.24em] text-violet-600">16. Fiche PDF récapitulatif</p>
                    <h2 class="mt-2 text-2xl font-black">PDF</h2>
                    <p class="mt-4 text-sm leading-7 text-slate-700">
                        Ce document reprend l’intégralité des informations de la formation Permis B. Vous pouvez le télécharger à
                        tout moment via le bouton ci-dessous.
                    </p>
                    <a
                        class="mt-5 inline-flex items-center justify-center rounded-xl bg-violet-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-800"
                        :href="route(routes.formationPermisB.pdf)"
                        download="permis-b.pdf"
                    >
                        Télécharger la Fiche formation Permis B (PDF)
                    </a>
                </article>

<section class="bg-gray-900 text-white py-12">
        <div class="max-w-5xl mx-auto px-4">
            <h1 class="text-3xl md:text-4xl font-bold">
                Résultats & Performances – PASS PERMIS FACILE
            </h1>

            <div class="mt-6">
                <h2 class="text-lg font-semibold">🎯 Nos résultats – Année 2024</h2>
                <p class="mt-2 text-sm text-gray-300">
                    Chez PASSPERMISFACILE, nous suivons avec attention les performances de nos élèves afin de garantir un accompagnement efficace et transparent.
                </p>
            </div>
        </div>
    </section>

    <section class="max-w-5xl mx-auto px-4 py-10 space-y-10">

        <!-- CODE -->
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="font-bold text-lg">📊 Taux de réussite – Code de la route (2024)</h2>

            <ul class="mt-4 space-y-1">
                <li>● Taux de réussite : 72 %</li>
                <li>● Moyenne nationale : environ 60 %</li>
            </ul>

            <p class="mt-3">✔ Formation intensive + suivi pédagogique personnalisé</p>
        </div>

        <!-- DRIVING -->
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="font-bold text-lg">🚗 Taux de réussite – Examen pratique (Permis B) – 2024</h2>

            <ul class="mt-4 space-y-1">
                <li>● Taux de réussite global : 64 %</li>
            </ul>

            <p class="mt-2 font-medium">Détail :</p>

            <ul class="mt-2 space-y-1">
                <li>● Boîte manuelle : 62 %</li>
                <li>● Boîte automatique : 68 %</li>
            </ul>

            <ul class="mt-3 space-y-1">
                <li>✔ Présentation à l’examen optimisée</li>
                <li>✔ Parcours adapté au niveau de chaque élève</li>
            </ul>
        </div>

        <!-- CPF -->
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="font-bold text-lg">Nombre d’élèves formés CPF – 2024</h2>

            <ul class="mt-4 space-y-1">
                <li>● 248 élèves accompagnés</li>
                <li>● Dont :</li>
                <li class="ml-4">○ 180 en formation complète (avec code)</li>
                <li class="ml-4">○ 68 en formation conduite uniquement</li>
            </ul>
        </div>

        <!-- SATISFACTION -->
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="font-bold text-lg">⭐ Satisfaction élèves</h2>

            <ul class="mt-4 space-y-1">
                <li>● Note moyenne Google : 4,7 / 5</li>
                <li>● Basée sur 132 avis</li>
            </ul>

            <div class="mt-4 space-y-2">
                <p>💬 “Très bonne pédagogie, permis obtenu rapidement”</p>
                <p>💬 “Moniteur à l’écoute, accompagnement au top”</p>
            </div>
        </div>

        <!-- HISTORY -->
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="font-bold text-lg">📅 Historique des performances</h2>

            <table class="w-full mt-4 border">
                <thead class="bg-gray-100">
                    <tr>
                        <th class="p-2 text-left">Année</th>
                        <th class="p-2 text-left">Code</th>
                        <th class="p-2 text-left">Conduite</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in history" :key="item.year" class="border-t">
                        <td class="p-2">{{ item.year }}</td>
                        <td class="p-2">{{ item.code }}</td>
                        <td class="p-2">{{ item.conduite }}</td>
                    </tr>
                </tbody>
            </table>

            <p class="mt-4">
                👉 Une progression constante grâce à l’amélioration continue de nos méthodes pédagogiques.
            </p>
        </div>

        <!-- IMPORTANT -->
        <div class="bg-white p-6 rounded-xl shadow">
            <h2 class="font-bold text-lg">⚠ Informations importantes</h2>

            <p class="mt-3">
                Les résultats présentés concernent l’année 2023 et 2024 et peuvent varier selon :
            </p>

            <ul class="mt-3 space-y-1">
                <li>● le niveau initial de l’élève</li>
                <li>● l’assiduité</li>
                <li>● le respect du parcours recommandé</li>
            </ul>
        </div>

        <!-- SHORT VERSION -->
        <div class="bg-black text-white p-6 rounded-xl">
            <h2 class="font-bold text-lg">🔥 VERSION COURTE (si tu veux plus simple)</h2>

            <p class="mt-3">Si tu veux une version plus minimaliste :</p>

            <p class="mt-4 font-semibold">Résultats 2023 :</p>

            <ul class="mt-2 space-y-1">
                <li>● Code : 72 %</li>
                <li>● Conduite : 64 %</li>
                <li>● 248 élèves formés</li>
                <li>● Satisfaction : 4,7 / 5 (Google)</li>
            </ul>
        </div>

    </section>

    <!-- HEADER -->
<section class="bg-gray-900 text-white py-12">
    <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-3xl md:text-4xl font-bold">
            Déroulement de la Formation – PASS PERMIS FACILE
        </h1>

        <div class="mt-6">
            <h2 class="text-lg font-semibold">🚦 Votre parcours vers le permis B</h2>
            <p class="mt-2 text-sm text-gray-300">
                Chez PASS PERMIS FACILE, nous avons structuré votre formation en étapes claires afin de vous accompagner efficacement jusqu’à la réussite.
            </p>
        </div>
    </div>
</section>

<section class="max-w-5xl mx-auto px-4 py-10 space-y-10">

    <!-- ETAPES -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">📍 1. Les étapes du parcours élève</h2>

        <ul class="mt-4 space-y-1">
            <li>● Inscription (en ligne ou en agence)</li>
            <li>● Création du dossier (NEPH)</li>
            <li>● Évaluation de départ (estimation du nombre d’heures)</li>
            <li>● Formation au code de la route</li>
            <li>● Leçons de conduite progressives</li>
            <li>● Examen blanc (vers la 17ᵉ heure)</li>
            <li>● Présentation à l’examen pratique</li>
            <li>● Obtention du permis 🎉</li>
        </ul>
    </div>

    <!-- CODE -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">📘 2. Organisation du Code de la route</h2>

        <ul class="mt-4 space-y-1">
            <li>● Accès illimité à une plateforme en ligne</li>
            <li>● Cours intensifs en présentiel (10 heures)</li>
            <li>● Examens blancs réguliers</li>
            <li>● Suivi de progression personnalisé</li>
        </ul>

        <p class="mt-4">👉 Objectif : être prêt rapidement pour l’examen théorique</p>
    </div>

    <!-- CONDUITE -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">🚗 3. Organisation de la conduite</h2>

        <ul class="mt-4 space-y-1">
            <li>● Leçons individuelles avec un moniteur dédié</li>
            <li>● Formation sur boîte manuelle ou automatique</li>
            <li>● Planning optimisé selon vos disponibilités</li>
            <li>● Progression par compétences</li>
        </ul>

        <p class="mt-4">👉 Un examen blanc est réalisé vers la 17ᵉ heure afin d’évaluer votre niveau</p>
    </div>

    <!-- ANNULATION -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">⏱ 4. Règles d’annulation des leçons</h2>

        <ul class="mt-4 space-y-1">
            <li>● Toute leçon doit être annulée au minimum 48 heures à l’avance</li>
            <li>● En cas de non-respect :</li>
            <li class="ml-4">○ La leçon est due et facturée</li>
            <li>● Exceptions possibles sur justificatif</li>
        </ul>
    </div>

    <!-- DELAIS -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">📅 5. Délais de passage à l’examen</h2>

        <p class="mt-4 font-medium">Code de la route :</p>
        <p>👉 Dès que votre niveau est validé</p>

        <p class="mt-3 font-medium">Examen pratique :</p>
        <p>👉 En fonction :</p>

        <ul class="mt-2 space-y-1">
            <li>● de votre niveau</li>
            <li>● des places disponibles via RDVPermis</li>
        </ul>

        <p class="mt-3">⏳ Délai moyen estimé : 2 à 6 semaines après validation du niveau</p>
    </div>

    <!-- PLANNING -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">🗓 6. Exemple de planning de formation</h2>

        <p class="mt-4 font-medium">Semaine type (formation accélérée) :</p>

        <ul class="mt-2 space-y-1">
            <li>● Lundi : 2h de conduite</li>
            <li>● Mardi : Code + 2h de conduite</li>
            <li>● Mercredi : Repos / révision</li>
            <li>● Jeudi : 2h de conduite</li>
            <li>● Vendredi : 2h de conduite</li>
            <li>● Samedi : Examen blanc / code</li>
        </ul>

        <p class="mt-4">
            👉 Planning adaptable selon votre disponibilité et votre objectif
        </p>
    </div>

    <!-- LIVRET -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">📒 7. Livret d’apprentissage</h2>

        <ul class="mt-4 space-y-1">
            <li>● Suivi digital de votre progression</li>
            <li>● Validation des compétences par votre moniteur</li>
            <li>● Accès à vos heures réalisées</li>
            <li>● Traçabilité obligatoire pour l’examen</li>
        </ul>
    </div>

    <!-- IMPORTANT -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">⚠ Informations importantes</h2>

        <p class="mt-3">
            Le parcours peut être adapté en fonction de :
        </p>

        <ul class="mt-3 space-y-1">
            <li>● votre niveau initial</li>
            <li>● votre disponibilité</li>
            <li>● votre implication</li>
        </ul>

        <p class="mt-4">
            👉 Un accompagnement personnalisé est assuré tout au long de votre formation
        </p>
    </div>

</section>


<!-- HEADER -->
<section class="bg-gray-900 text-white py-12">
    <div class="max-w-5xl mx-auto px-4">
        <h1 class="text-3xl md:text-4xl font-bold">
            Moyens Pédagogiques & Encadrement – PASS PERMIS FACILE
        </h1>

        <div class="mt-6">
            <h2 class="text-lg font-semibold">🎓 Des moyens modernes pour une formation efficace</h2>
            <p class="mt-2 text-sm text-gray-300">
                Chez PASS PERMIS FACILE, nous mettons à disposition des élèves des outils pédagogiques performants ainsi qu’un encadrement professionnel afin de maximiser leurs chances de réussite.
            </p>
        </div>
    </div>
</section>

<section class="max-w-5xl mx-auto px-4 py-10 space-y-10">

    <!-- VEHICULES -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">🚗 1. Nos véhicules</h2>

        <ul class="mt-4 space-y-1">
            <li>● Flotte de 6 véhicules récents (moins de 3 ans)</li>
            <li>● Boîte manuelle et automatique disponibles</li>
            <li>● Véhicules équipés de doubles commandes (sécurité optimale)</li>
            <li>● Entretien régulier et suivi technique</li>
        </ul>

        <p class="mt-4">👉 Objectif : apprendre dans des conditions réelles et sécurisées</p>
    </div>

    <!-- SUPPORTS -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">📚 2. Supports pédagogiques</h2>

        <ul class="mt-4 space-y-1">
            <li>● Plateforme en ligne avec accès illimité (code de la route)</li>
            <li>● Séries d’entraînement et examens blancs</li>
            <li>● Fiches pédagogiques (théorie et pratique)</li>
            <li>● Supports numériques avec suivi digital</li>
        </ul>

        <p class="mt-4">👉 Accessible 24h/24 pour progresser à votre rythme</p>
    </div>

    <!-- SIMULATEUR -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">🖥️ 3. Simulateur de conduite</h2>

        <p class="mt-4">
            Nous privilégions un apprentissage directement en conditions réelles sur route, afin de garantir une meilleure expérience de conduite.
        </p>
    </div>

    <!-- EQUIPE -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">👨‍🏫 4. Notre équipe pédagogique</h2>

        <ul class="mt-4 space-y-1">
            <li>● 4 moniteurs salariés diplômés d’État</li>
            <li>● Expérience moyenne : 5 ans</li>
            <li>● Approche pédagogique adaptée à chaque élève</li>
            <li>● Formation continue des enseignants</li>
        </ul>

        <p class="mt-4">👉 Un accompagnement professionnel et bienveillant</p>
    </div>

    <!-- REPARTITION -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">👥 5. Répartition élèves / moniteur</h2>

        <ul class="mt-4 space-y-1">
            <li>● En moyenne : 1 moniteur pour 20 à 30 élèves actifs</li>
            <li>● Organisation optimisée pour limiter les délais</li>
            <li>● Suivi régulier de la progression</li>
        </ul>

        <p class="mt-4">👉 Permet un encadrement efficace et personnalisé</p>
    </div>

    <!-- SUIVI -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">📈 6. Suivi individualisé</h2>

        <ul class="mt-4 space-y-1">
            <li>● Évaluation initiale avant le début de la formation</li>
            <li>● Suivi via livret d’apprentissage digital (Parcours Conduite)</li>
            <li>● Points réguliers avec le moniteur</li>
            <li>● Ajustement du nombre d’heures si nécessaire</li>
        </ul>

        <p class="mt-4">👉 Chaque élève bénéficie d’un parcours adapté à son niveau</p>
    </div>

    <!-- QUALITE -->
    <div class="bg-white p-6 rounded-xl shadow">
        <h2 class="font-bold text-lg">⚠️ Engagement qualité</h2>

        <ul class="mt-4 space-y-1">
            <li>● un apprentissage progressif</li>
            <li>● une pédagogie adaptée</li>
            <li>● un accompagnement jusqu’à la réussite</li>
        </ul>
    </div>

</section>


<!-- SECTION 5 -->
<section class="max-w-5xl mx-auto px-4 py-10">

<div class="bg-white p-8 rounded-2xl shadow">
    <h2 class="text-2xl font-bold">📄 5. Notre Équipe – PASS PERMIS FACILE</h2>
    <p class="mt-2 text-sm text-gray-600">👨‍🏫 Une équipe de professionnels à votre service</p>

    <div class="mt-6 space-y-4 text-sm">

        <div>
            <p class="font-semibold">👤 Florian ETIENNE – Gérant & Référent pédagogique</p>
            <p>Diplôme : BEPECASER / Titre Professionnel ECSR</p>
            <p>Expérience : 10 ans</p>
            <p>Spécialité : accompagnement accéléré / réussite rapide</p>
        </div>

        <div>
            <p class="font-semibold">👤 Anne-Sophie TAMA – Monitrice</p>
            <p>Diplôme : Titre Professionnel ECSR</p>
            <p>Expérience : 2 ans</p>
            <p>Spécialité : élèves débutants / pédagogie douce</p>
        </div>

        <div>
            <p class="font-semibold">👤 Soumaya EL AMMARI – Monitrice</p>
            <p>Expérience : 5 ans – préparation à l’examen pratique</p>
        </div>

        <div>
            <p class="font-semibold">👤 Talia SARHANE – Monitrice</p>
            <p>Expérience : 2 ans – préparation à l’examen pratique</p>
        </div>

        <div>
            <p class="font-semibold">👤 Carl MARIE-LOUISE – Moniteur</p>
            <p>Expérience : 2 ans – préparation à l’examen pratique</p>
        </div>

        <div>
            <p class="font-semibold">👤 Samira MANEKA – Monitrice</p>
            <p>Expérience : 2 ans – préparation à l’examen pratique</p>
        </div>

    </div>

    <div class="mt-6">
        <h3 class="font-semibold">📈 Formation continue</h3>
        <ul class="mt-2 text-sm space-y-1">
            <li>● Formations régulières</li>
            <li>● Mise à jour des méthodes pédagogiques</li>
            <li>● Adaptation aux nouvelles réglementations</li>
        </ul>
    </div>
</div>

</section>


<section class="max-w-5xl mx-auto px-4 py-10">

<div class="bg-white p-8 rounded-2xl shadow">
    <h2 class="text-2xl font-bold">📄 6. Accessibilité & Handicap</h2>

    <p class="mt-4 text-sm">
        ♿ Nos formations sont accessibles aux personnes en situation de handicap selon nos capacités d’adaptation.
    </p>

    <div class="mt-5 text-sm">
        <p class="font-semibold">👤 Référent handicap</p>
        <p>Florian ETIENNE</p>
        <p>09 70 70 16 16</p>
        <p>contact@passpermisfacile.fr</p>
    </div>

    <div class="mt-5">
        <h3 class="font-semibold">🤝 Accompagnement personnalisé</h3>
        <ul class="mt-2 text-sm space-y-1">
            <li>● Étude de votre situation</li>
            <li>● Adaptation du parcours</li>
            <li>● Orientation vers structures adaptées</li>
        </ul>
    </div>

    <div class="mt-5">
        <h3 class="font-semibold">🔗 Partenaires</h3>
        <ul class="mt-2 text-sm space-y-1">
            <li>● Centres spécialisés</li>
            <li>● Organismes adaptés</li>
            <li>● Professionnels de santé</li>
        </ul>
    </div>
</div>

</section>


<section class="max-w-5xl mx-auto px-4 py-10">

<div class="bg-white p-8 rounded-2xl shadow">
    <h2 class="text-2xl font-bold">📄 7. Réclamations & Satisfaction</h2>

    <div class="mt-4 text-sm">
        <p class="font-semibold">📩 Réclamation</p>
        <p>reclamation@passpermisfacile.fr</p>
    </div>

    <div class="mt-5">
        <h3 class="font-semibold">⏱️ Délais</h3>
        <ul class="mt-2 text-sm space-y-1">
            <li>● 48h accusé de réception</li>
            <li>● 15 jours réponse complète</li>
        </ul>
    </div>

    <div class="mt-5">
        <h3 class="font-semibold">📊 Satisfaction</h3>
        <ul class="mt-2 text-sm space-y-1">
            <li>● Enquête annuelle</li>
            <li>● Analyse des retours</li>
            <li>● Amélioration continue</li>
        </ul>
    </div>

    <p class="mt-5 text-sm">⭐ Vous pouvez laisser un avis sur Google.</p>
</div>

</section>


<section class="max-w-5xl mx-auto px-4 py-10">

<div class="bg-white p-8 rounded-2xl shadow">
    <h2 class="text-2xl font-bold">📄 8. CPF (Version optimisée)</h2>

    <p class="mt-4 font-semibold">💰 Financer votre permis avec le CPF</p>

    <div class="mt-4 text-sm">
        <p class="font-semibold">🔗 Accès CPF</p>
        <p>https://www.moncompteformation.gouv.fr</p>
    </div>

    <div class="mt-5">
        <h3 class="font-semibold">📘 CPF</h3>
        <p class="text-sm mt-1">
            Permet de financer tout ou partie du permis sous conditions.
        </p>
    </div>

    <div class="mt-5">
        <h3 class="font-semibold">✅ Conditions</h3>
        <ul class="mt-2 text-sm space-y-1">
            <li>● Droits CPF suffisants</li>
            <li>● Projet professionnel</li>
            <li>● Validation dossier</li>
        </ul>
    </div>

    <p class="mt-5 text-sm">
        🏅 Certification Qualiopi garantissant la qualité des formations.
    </p>
</div>

</section>

            </div>
        </section>
    </main>
 </template>`;

const tableData = {
  tarifsManuelAvecCode,
  tarifsManuelSansCode,
  tarifsAutoSansCode,
  tarifsAutoAvecCode,
  history,
};

function renderVueTemplate() {
  const documentNode = new DOMParser().parseFromString(vueTemplate, "text/html");
  const root = documentNode.querySelector("template")?.content;
  if (!root) return "";

  root.querySelectorAll("[v-for]").forEach((row) => {
    const expression = row.getAttribute("v-for") || "";
    const match = expression.match(/(\w+)\s+in\s+(\w+)/);
    const items = match ? tableData[match[2]] : null;
    if (!match || !Array.isArray(items)) return;

    const fragment = documentNode.createDocumentFragment();
    items.forEach((item) => {
      const clone = row.cloneNode(true);
      clone.removeAttribute("v-for");
      clone.removeAttribute(":key");
      clone.innerHTML = clone.innerHTML.replace(/{{\s*item\.(\w+)\s*}}/g, (_, key) => String(item[key] ?? ""));
      fragment.appendChild(clone);
    });
    row.replaceWith(fragment);
  });

  root.querySelectorAll("*").forEach((element) => {
    if (element.hasAttribute(":href")) {
      element.setAttribute("href", "/assets/clients/Formation-Permis-B.pdf");
      element.removeAttribute(":href");
    }
  });

  const wrapper = documentNode.createElement("div");
  wrapper.appendChild(root.cloneNode(true));
  return wrapper.innerHTML;
}

export default function CpfFormationPermisBPage() {
  const content = useMemo(() => renderVueTemplate(), []);
  return (
    <>
      <Navbar />
      <main className="cpf-vue-content" dangerouslySetInnerHTML={{ __html: content }} />
      <Footer />
    </>
  );
}
