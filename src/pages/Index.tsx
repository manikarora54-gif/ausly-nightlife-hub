import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SEOHead from "@/components/seo/SEOHead";
import CategoriesSection from "@/components/home/CategoriesSection";
import WhatsHappeningSection from "@/components/home/WhatsHappeningSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyAuslySection from "@/components/home/WhyAuslySection";
import ForBusinessSection from "@/components/home/ForBusinessSection";
import FinalCTASection from "@/components/home/FinalCTASection";
import { GradientDivider } from "@/components/decorative/FloatingShapes";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("Berlin");

  return (
    <div className="min-h-screen bg-background">
      <SEOHead
        title="Ausly – Discover Restaurants, Events & Nightlife in Germany"
        description="Find the best restaurants, bars, clubs, and events in Berlin, Hamburg, München, Köln, Frankfurt. Plan your perfect night out with Ausly."
      />
      <Navbar />
      <main>
        <HeroSection selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <GradientDivider />
        <CategoriesSection selectedCity={selectedCity} />
        <GradientDivider />
        <WhatsHappeningSection selectedCity={selectedCity} />
        <GradientDivider />
        <HowItWorksSection />
        <GradientDivider />
        <WhyAuslySection />
        <GradientDivider />
        <ForBusinessSection />
        <GradientDivider />
        <FinalCTASection selectedCity={selectedCity} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
