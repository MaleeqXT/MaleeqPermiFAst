import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Navbar from '../components/shared/Navbar'
import Packages from '../components/shared/Packages'
import ServicesHero from '../components/shared/ServicesHero'
import http from '../../helpers/http.jsx'
import packagesBg from '../assets/Packages-bg.jpeg'
import Footer from '../components/shared/Footer'
import './PackagesPage.css'

const AGENCY_BY_ZONE_ID = {
  '9eeb1c0b-3a2a-41f6-8887-e17879995335': 'creil',
  '9ef0999c-3842-4de1-ade2-d88412135519': 'toulouse',
}

const agencyKey = (value) => String(value || '')
  .toLocaleLowerCase('fr-FR')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .replace('criel', 'creil')

const offerRows = (response) => {
  const data = response?.data?.data
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  return []
}

const paginationLastPage = (response) => Number(response?.data?.data?.last_page || 1)

const uniqueOffers = (items) => Array.from(
  new Map(items.filter((offer) => offer?.id).map((offer) => [offer.id, offer])).values()
)

const parseAgencyPricing = (value) => {
  if (Array.isArray(value)) return value
  if (!value) return []
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const isAvailableForAgency = (offer, agency) => {
  const pricing = parseAgencyPricing(offer.agency_pricing)
  // An offer without per-agency pricing is a global offer. An offer with
  // pricing entries belongs only to the agencies explicitly listed there.
  return pricing.length === 0 || pricing.some((entry) => agencyKey(entry?.agency) === agency)
}

const applyAgencyPricing = (offer, agency) => {
  const pricing = parseAgencyPricing(offer.agency_pricing)
  const selectedPricing = pricing.find((entry) => agencyKey(entry.agency) === agency)
  if (!selectedPricing) return offer

  const agencyPrice = selectedPricing.discounted_price ?? selectedPricing.price_ht ?? selectedPricing.original_price
  return {
    ...offer,
    agency_name: agency,
    price_ht: agencyPrice,
    final_price: agencyPrice,
    original_price: selectedPricing.original_price ?? offer.original_price,
    discounted_price: selectedPricing.discounted_price,
    second_price: selectedPricing.second_price,
    balance: selectedPricing.balance ?? offer.balance,
    balance_2: selectedPricing.balance_2 ?? offer.balance_2,
    caracteristiques: selectedPricing.caracteristiques ?? offer.caracteristiques,
    multi_payment: selectedPricing.multi_payment ?? offer.multi_payment,
    total_payment: selectedPricing.total_payment ?? offer.total_payment,
    installments_data: selectedPricing.installments ?? offer.installments_data,
  }
}

const PackagesPage = () => {
  const [offers, setOffers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchParams, setSearchParams] = useSearchParams()
  const currentUser = useSelector((state) => state.auth.user)
  const studentZoneId = currentUser?.student?.zone_id ?? currentUser?.zone_id
  const studentAgency = agencyKey(
    currentUser?.student?.agency?.name
      ?? currentUser?.agency?.name
      ?? currentUser?.student?.zone?.name
      ?? currentUser?.zone?.name
      ?? AGENCY_BY_ZONE_ID[studentZoneId]
  )
  const requestedAgency = agencyKey(searchParams.get('agency'))
  const selectedAgency = studentAgency || (requestedAgency === 'toulouse' ? 'toulouse' : 'creil')
  const rawBoiteType = currentUser?.student?.boite_type ?? currentUser?.boite_type
  const studentBoiteType = [0, 1, '0', '1'].includes(rawBoiteType) ? Number(rawBoiteType) : null

  const handleAgencyChange = (event) => {
    const agency = event.target.value
    setSearchParams({ agency })
  }

  useEffect(() => {
    let active = true

    const fetchAllOffers = async (params) => {
      const firstResponse = await http.get('/public/offers', { params: { ...params, per_page: 100 } })
      const pages = paginationLastPage(firstResponse)
      const remainingResponses = await Promise.all(
        Array.from({ length: Math.max(0, pages - 1) }, (_, index) => http.get('/public/offers', {
          params: { ...params, per_page: 100, page: index + 2 },
        }))
      )
      return uniqueOffers([firstResponse, ...remainingResponses].flatMap(offerRows))
    }

    async function loadOffers() {
      setLoading(true)
      setError("")
      try {
        if (studentBoiteType !== null) {
          // A logged-in student sees only offers for their registered gearbox:
          // 0 = boîte manuelle (BM), 1 = boîte automatique (BA).
          const studentOffers = await fetchAllOffers({ is_auto: studentBoiteType, status: 1 })
          if (active) setOffers(studentOffers.filter((offer) => Number(offer.is_auto) === studentBoiteType))
          return
        }

        // Visitors without a student profile may browse both catalogues.
        const [manual, automatic] = await Promise.all([
          fetchAllOffers({ is_auto: 0, status: 1 }),
          fetchAllOffers({ is_auto: 1, status: 1 }),
        ])
        if (active) setOffers(uniqueOffers([...manual, ...automatic]))
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || "Impossible de charger les formules.")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadOffers()
    return () => { active = false }
  }, [studentBoiteType])

  return (
    <>
      <Navbar />
      <ServicesHero
        bgImage={packagesBg}
        eyebrow="FORMULES"
        heading="Nos Formules"
        breadcrumb="Formules"
      />
      <div className="packages-agency-picker">
        <label htmlFor="packages-agency">Agence</label>
        <select id="packages-agency" value={selectedAgency} onChange={handleAgencyChange} disabled={Boolean(studentAgency)}>
          <option value="creil">Agence Creil</option>
          <option value="toulouse">Agence Toulouse</option>
        </select>
      </div>
      <Packages
        packages={offers
          .filter((offer) => isAvailableForAgency(offer, selectedAgency))
          .map((offer) => applyAgencyPricing(offer, selectedAgency))}
        title="NOS FORMULES DE PERMIS"
        subtitle="Découvrez toutes nos formules de conduite conçues pour répondre à chaque besoin. Que vous recherchiez une formation classique, accélérée, moto ou spécialisée, choisissez la formule qui vous accompagnera jusqu'à la réussite de votre permis."
        showSubtitle={true}
        showTabs={true}
        loading={loading}
        error={error}
      />
      <Footer />
    </>
  )
}

export default PackagesPage
