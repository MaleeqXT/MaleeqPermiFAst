import React, { useEffect, useState } from 'react'
import Navbar from '../components/shared/Navbar'
import Hero from '../components/shared/Hero'
import Cards from '../components/shared/Cards'
import Packages from '../components/shared/Packages'
import Comments from '../components/shared/Comments'
import Footer from '../components/shared/Footer'
import http from '../../helpers/http.jsx'

const HomePage = () => {
  const [featuredPackages, setFeaturedPackages] = useState([])
  const [offersLoading, setOffersLoading] = useState(true)
  const [offersError, setOffersError] = useState("")

  useEffect(() => {
    let active = true

    async function loadFeaturedOffers() {
      try {
        const response = await http.get('/public/offers', {
          params: { status: 1, per_page: 4 },
        })
        const payload = response.data?.data
        const rows = Array.isArray(payload) ? payload : payload?.data ?? []

        if (active) setFeaturedPackages(rows.slice(0, 4))
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
  }, [])

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
