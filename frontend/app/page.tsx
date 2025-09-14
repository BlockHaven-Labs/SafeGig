import React from "react"
import HeroSection from "@/components/landing/HeroSection"
import Navbar from "@/components/landing/Navbar"
import CTASection from "@/components/landing/CTASection"
import Footer from "@/components/landing/Footer"
import CoreFeature from "@/components/landing/CoreFeature"
import UserPathways from "@/components/landing/UserPathways"
import SubHeroSection from "@/components/landing/SubHero"

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <SubHeroSection />
      <CoreFeature />
      <UserPathways />
      <CTASection />
      <Footer />
    </div>
  )
}

export default LandingPage
