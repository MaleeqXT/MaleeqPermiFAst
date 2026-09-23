import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Navbar from '../components/shared/Navbar'
import Packages from '../components/shared/Packages'
import ServicesHero from '../components/shared/ServicesHero'
import http from '../../helpers/http.jsx'
import packagesBg from '../assets/Packages-bg.jpeg'
import Footer from '../components/shared/Footer'
import './PackagesPage.css'

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
  const selectedAgency = agencyKey(searchParams.get('agency')) === 'toulouse' ? 'toulouse' : 'creil'

  const handleAgencyChange = (event) => {
    const agency = event.target.value
    setSearchParams({ agency })
  }

  useEffect(() => {
    let active = true
    async function loadOffers() {
      try {
        // Fetch both gearbox types explicitly: 0 = manual, 1 = automatic.
        const [manual, automatic] = await Promise.all([
          http.get('/public/offers', { params: { is_auto: 0, status: 1 } }),
          http.get('/public/offers', { params: { is_auto: 1, status: 1 } }),
        ])
        const rows = (response) => response?.data?.data?.data ?? []
        if (active) setOffers([...rows(manual), ...rows(automatic)])
      } catch (requestError) {
        if (active) setError(requestError?.response?.data?.message || "Impossible de charger les formules.")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadOffers()
    return () => { active = false }
  }, [])

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
        <select id="packages-agency" value={selectedAgency} onChange={handleAgencyChange}>
          <option value="creil">Agence Creil</option>
          <option value="toulouse">Agence Toulouse</option>
        </select>
      </div>
      <Packages
        packages={offers.map((offer) => applyAgencyPricing(offer, selectedAgency))}
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
