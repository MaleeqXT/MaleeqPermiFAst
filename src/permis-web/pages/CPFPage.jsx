import { useEffect, useState } from "react";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import CPFHero from "../components/shared/CPFHero";
import Packages from "../components/shared/Packages";
import http from "../../helpers/http.jsx";

const rowsFrom = (response) => {
  const data = response?.data?.data;
  return Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : []);
};

const CPFPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchAll = async (params) => {
      const first = await http.get("/public/offers", { params: { ...params, per_page: 100 } });
      const pages = Number(first?.data?.data?.last_page || 1);
      const rest = await Promise.all(Array.from({ length: Math.max(0, pages - 1) }, (_, index) => (
        http.get("/public/offers", { params: { ...params, per_page: 100, page: index + 2 } })
      )));
      return [first, ...rest].flatMap(rowsFrom);
    };

    (async () => {
      try {
        // Existing offers.type: 1 = Avec Code, 2 = Sans Code.
        // Fetch all four legacy CPF catalogue combinations: BM/BA × Avec/Sans Code.
        const groups = await Promise.all([
          fetchAll({ is_cpf: 1, is_auto: 0, type: 1, type_offre: 1, ignore_student_boite_type: 1 }),
          fetchAll({ is_cpf: 1, is_auto: 0, type: 2, type_offre: 1, ignore_student_boite_type: 1 }),
          fetchAll({ is_cpf: 1, is_auto: 1, type: 1, type_offre: 1, ignore_student_boite_type: 1 }),
          fetchAll({ is_cpf: 1, is_auto: 1, type: 2, type_offre: 1, ignore_student_boite_type: 1 }),
        ]);
        if (!active) return;
        setOffers(Array.from(new Map(groups.flat().filter((offer) => offer?.id).map((offer) => [offer.id, {
          ...offer,
          cpfType: Number(offer.type) === 1 ? "with-code" : "without-code",
        }])).values()));
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || "Impossible de charger les formules CPF.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  return (
    <>
      <Navbar />
      <CPFHero />
      <Packages
        packages={offers}
        title="FORMULES PERMIS B ÉLIGIBLES CPF"
        subtitle="Choisissez votre boîte et votre formule avec ou sans Code de la route."
        showSubtitle
        showTabs
        showCpfFilter
        cpfInfoLink="/cpf-formation-permis-b"
        loading={loading}
        error={error}
      />
      <Footer />
    </>
  );
};

export default CPFPage;
