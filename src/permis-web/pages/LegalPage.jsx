import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import "./LegalPage.css";

const email = <a href="mailto:contact.passpermisfacile@gmail.com">contact.passpermisfacile@gmail.com</a>;

const pages = {
  "/mention-legales": {
    title: "Mentions légales",
    sections: [
      ["", <>Conformément à l’article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l’économie numérique, l’identité des intervenants du site www.passpermisfacile.fr est précisée ci-dessous.</>],
      ["1 – Édition du site", <>Le site est édité par PASSPERMISFACILE. Siège social : 139 boulevard Déodat de Séverac, 31300 Toulouse, France. E-mail : {email}. Téléphone : 09 70 70 16 16.<br />Forme juridique : SAS. Capital social : 2 000 €. SIREN : 979 143 294. RCS : COMPIÈGNE B 979 143 294.<br />Directeur de publication et DPO : ETIENNE Florian. Hébergeur : Hostinger, UAB, Jonavos str. 60C, 44192 Kaunas, Lituanie.</>],
      ["2 – Propriété intellectuelle et contrefaçons", <>Le site, ses textes, images, graphismes, logos, vidéos, icônes, sons et bases de données sont protégés par les lois relatives à la propriété intellectuelle. Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.</>],
      ["3 – Limitations de responsabilité", <>PASSPERMISFACILE ne peut être tenu responsable des dommages directs ou indirects causés lors de l’accès au site, ni garantir l’exactitude, l’exhaustivité ou l’actualité de toutes les informations publiées.</>],
      ["4 – CNIL et données personnelles", <>Conformément au RGPD et à la Loi Informatique et Libertés, vous disposez de droits d’accès, rectification, suppression, opposition et portabilité. Pour les exercer, contactez-nous à {email}. Vous pouvez saisir la CNIL via www.cnil.fr.</>],
      ["5 – Liens hypertextes et cookies", <>Le site peut contenir des liens vers des sites tiers. Des cookies peuvent être utilisés pour améliorer l’expérience et analyser l’audience, dans les limites prévues par la réglementation.</>],
      ["6 – Droit applicable et juridiction", <>Le droit français s’applique. Une solution amiable sera privilégiée avant toute action. À défaut, les tribunaux compétents de Toulouse sont saisis, sauf disposition légale contraire.</>],
      ["7 – Contact", <>Adresse : 139 boulevard Déodat de Séverac, 31300 Toulouse, et Boulevard André Netwiller, 31200 Toulouse. Dernière mise à jour : 10/11/2024.</>],
    ],
  },
  "/politique-confidentialite": {
    title: "Politique de confidentialité & Cookies",
    sections: [
      ["Politique de confidentialité de PASSPERMISFACILE", <>PASSPERMISFACILE protège la confidentialité et la sécurité de vos données conformément au RGPD et à la Loi Informatique et Libertés. Cette politique décrit la collecte, l’utilisation et la protection de vos informations.</>],
      ["1. Responsable du traitement", <>PASSPERMISFACILE. E-mail : {email}. Adresse : 139 bd Déodat de Séverac, 31300 Toulouse, et Boulevard André Netwiller, 31200 Toulouse.</>],
      ["2. Données collectées et finalités", <ul><li><strong>Nom, prénom :</strong> identification et communication.</li><li><strong>Adresse e-mail :</strong> informations, inscription et service client.</li><li><strong>Téléphone :</strong> contact lié à nos services.</li><li><strong>Données de navigation :</strong> amélioration du site et analyse de l’expérience.</li></ul>],
      ["3. Cookies et technologies de suivi", <><p>Des cookies essentiels, analytiques ou publicitaires peuvent être utilisés. Vous pouvez les refuser ou paramétrer votre navigateur.</p><ul><li>Cookies essentiels : fonctionnement du site.</li><li>Cookies analytiques : audience et performances.</li><li>Cookies publicitaires : publicité ciblée.</li></ul></>],
      ["4. Partage des données", <ul><li>Partenaires et prestataires nécessaires à la gestion des services.</li><li>Autorités légales lorsque la loi l’exige.</li><li>Aucune vente de données à des tiers.</li></ul>],
      ["5. Sécurité", <>Les données sont stockées de manière sécurisée avec accès restreint. En cas de violation, nous informons les personnes concernées conformément aux obligations légales.</>],
      ["6. Vos droits", <>Vous pouvez demander l’accès, la rectification, l’effacement, l’opposition, la limitation ou la portabilité de vos données. Écrivez à {email}; une réponse est apportée dans un délai maximal d’un mois. Une réclamation peut être adressée à la CNIL.</>],
      ["7 à 9. Transferts, modifications et contact", <>Les données sont hébergées dans l’UE ou avec des garanties appropriées. Cette politique peut être mise à jour. Pour toute question, contactez {email}. Dernière mise à jour : 10/11/2024.</>],
    ],
  },
  "/conditions-utilisation": {
    title: "Conditions d’utilisation",
    sections: [
      ["Conditions Générales d’Utilisation (CGU)", <>Veuillez lire ces conditions avant d’utiliser www.passpermisfacile.fr. L’accès au site implique leur acceptation.</>],
      ["1. Présentation du site", <>PASSPERMISFACILE est une auto-école proposant des formations à la conduite et à la sécurité routière. Siège : 139 bd Déodat de Séverac, 31300 Toulouse. E-mail : {email}. Hébergeur : Hostinger, Kaunas, Lituanie.</>],
      ["2. Propriété intellectuelle", <>Les textes, images, logos, vidéos, graphiques, icônes, bases de données et logiciels du site sont protégés. Leur reproduction ou exploitation sans autorisation est interdite.</>],
      ["3. Conditions d’utilisation", <><p>Vous vous engagez à respecter les lois, utiliser le site à titre personnel, préserver sa sécurité et ne pas tenter d’accéder frauduleusement aux zones restreintes.</p><ul><li>Ne pas introduire de virus ou logiciel malveillant.</li><li>Ne pas compromettre l’intégrité ou la disponibilité du site.</li><li>Ne pas utiliser le site à des fins frauduleuses ou illégales.</li></ul></>],
      ["4. Limitation de responsabilité", <>Les informations sont fournies à titre indicatif. L’utilisation du site relève de votre responsabilité. PASSPERMISFACILE ne peut répondre des interruptions, erreurs, omissions ou problèmes techniques.</>],
      ["5. Liens vers des sites tiers", <>Les liens externes sont fournis à titre informatif. PASSPERMISFACILE ne contrôle pas les contenus ou politiques de ces sites tiers.</>],
      ["6. Protection des données personnelles", <>Les données collectées via les formulaires et la navigation servent à fournir nos services, améliorer le site et respecter nos obligations. Vous pouvez exercer vos droits auprès de {email}.</>],
      ["7 à 9. Modifications, droit applicable et contact", <>Ces conditions peuvent être modifiées à tout moment. Elles sont soumises au droit français. Pour toute question, contactez {email}. Dernière mise à jour : 10/11/2024.</>],
    ],
  },
  "/conditions-vente": {
    title: "Conditions de vente",
    sections: [
      ["Conditions Générales de Vente (CGV)", <>En passant commande sur notre site, vous acceptez les présentes conditions.</>],
      ["1. Objet", <>Les CGV définissent les droits et obligations relatifs à la vente des formations à la conduite et à la sécurité routière proposées par PASSPERMISFACILE.</>],
      ["2. Sélection et achat de forfaits", <><p>Les forfaits proposés peuvent concerner la conduite, le code de la route en ligne, l’accompagnement à l’examen ou toute autre prestation affichée sur le site.</p><p>Les détails et prix de chaque forfait sont affichés sur le site.</p></>],
      ["3. Prix et modalités de paiement", <><p>Les prix sont indiqués en euros TTC et sont ceux applicables au jour de la commande.</p><ul><li>Paiement en une fois : règlement intégral à la commande.</li><li>Paiement en plusieurs fois : selon les options proposées, jusqu’à 3 fois.</li><li>Des frais de service peuvent s’appliquer aux paiements échelonnés.</li></ul></>],
      ["4. Livraison des services", <>Les cours sont planifiés selon les disponibilités de l’auto-école et de l’élève. Les délais de formation peuvent varier selon l’affluence et les contraintes de planning.</>],
      ["5. Annulation et remboursement", <>Toute annulation d’un cours doit être signalée au moins 48 heures à l’avance. L’auto-école peut reporter un cours sans frais pour l’élève. Un droit de rétractation de 14 jours s’applique aux achats en ligne, sauf commencement de la prestation avec accord préalable.</>],
      ["6. Responsabilité et obligations de l’élève", <>L’élève doit respecter le règlement intérieur, les consignes du moniteur, être ponctuel et présenter les documents obligatoires. L’auto-école décline toute responsabilité en cas de retard, absence ou non-respect des consignes.</>],
      ["7 à 9. Droit applicable et médiation", <>Les CGV sont soumises au droit français. Une résolution amiable est privilégiée. Vous pouvez saisir gratuitement le médiateur ANM Conso, 2 rue de Colmar, 94300 Vincennes, contact@anm-conso.com, 01 58 64 00 05, www.anm-conso.com.</>],
      ["10. Modifications", <>Les présentes conditions peuvent être modifiées à tout moment. Conditions Générales de Vente mises à jour le : 10/11/2024.</>],
    ],
  },
};

export default function LegalPage() {
  const { pathname } = useLocation();
  const page = pages[pathname] || pages["/mention-legales"];

  return (
    <>
      <Navbar />
      <main className="legal-page">
        <div className="legal-page__hero">
          <p>PASS PERMIS FACILE</p>
          <h1>{page.title}</h1>
          <Link to="/">Accueil</Link><span> / </span><span>{page.title}</span>
        </div>
        <article className="legal-page__content">
          <h2>{page.title}</h2>
          {page.sections.map(([heading, body], index) => (
            <section key={heading || index}>
              {heading && <h3>{heading}</h3>}
              <div>{body}</div>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
