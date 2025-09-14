import React from "react"
import HeroSection from "@/components/landing/HeroSection"
import Navbar from "@/components/landing/Navbar"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
