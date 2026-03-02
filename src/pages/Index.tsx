import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import WhatsHappeningSection from "@/components/home/WhatsHappeningSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyAuslySection from "@/components/home/WhyAuslySection";
import ForBusinessSection from "@/components/home/ForBusinessSection";
import FinalCTASection from "@/components/home/FinalCTASection";

const Index = () => {
  const [selectedCity, setSelectedCity] = useState("Berlin");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <CategoriesSection selectedCity={selectedCity} />
        <WhatsHappeningSection selectedCity={selectedCity} />
        <HowItWorksSection />
        <WhyAuslySection />
        <ForBusinessSection />
        <FinalCTASection selectedCity={selectedCity} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
