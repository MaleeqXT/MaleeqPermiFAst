import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import Navbar from '../components/shared/Navbar'
import Hero from '../components/shared/Hero'
import Cards from '../components/shared/Cards'
import Packages from '../components/shared/Packages'
import Comments from '../components/shared/Comments'
import Footer from '../components/shared/Footer'
import http from '../../helpers/http.jsx'

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

const applyAgencyPricing = (offer, agency) => {
  const pricing = parseAgencyPricing(offer.agency_pricing)
  const selectedPricing = pricing.find((entry) => agencyKey(entry?.agency) === agency)
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

const HomePage = () => {
  const currentUser = useSelector((state) => state.auth.user)
  const [featuredPackages, setFeaturedPackages] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState("")
  const studentZoneId = currentUser?.student?.zone_id ?? currentUser?.zone_id
  const studentAgency = agencyKey(
    currentUser?.student?.agency?.name
      ?? currentUser?.agency?.name
      ?? currentUser?.student?.zone?.name
      ?? currentUser?.zone?.name
      ?? AGENCY_BY_ZONE_ID[studentZoneId]
  )
  const selectedAgency = studentAgency || 'creil'

  useEffect(() => {
    let active = true

    async function loadFeaturedOffers() {
      try {
        const response = await http.get('/public/offers', {
          params: { status: 1, per_page: 100 },
        })
        const payload = response.data?.data
        const rows = Array.isArray(payload) ? payload : payload?.data ?? []

        if (active) {
          const agencyOffers = rows
            .filter((offer) => {
              const pricing = parseAgencyPricing(offer.agency_pricing)
              return pricing.length === 0 || pricing.some((entry) => agencyKey(entry?.agency) === selectedAgency)
            })
            .map((offer) => applyAgencyPricing(offer, selectedAgency))

          setFeaturedPackages(agencyOffers.slice(0, 4))
        }
      } catch (error) {
        if (active) {
          setOffersError(error.response?.data?.message || "Impossible de charger les formules.")
        }
      } finally {
        if (active) setOffersLoading(false)
      }
    }

    loadFeaturedOffers()
    return () => { active = false }
  }, [selectedAgency])

  return (
    <>
      <Navbar transparent />
      <Hero />
      <Cards />
      <Packages
        packages={featuredPackages}
        title="CHOISISSEZ LA FORMULE QUI VOUS CONVIENT"
        showSubtitle={false}
        loading={offersLoading}
        error={offersError}
      />
      <Comments />
      <Footer />
    </>
  )
}

export default HomePage
