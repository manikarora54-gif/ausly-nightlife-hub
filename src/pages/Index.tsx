import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import WhatsHappeningSection from "@/components/home/WhatsHappeningSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import WhyAuslySection from "@/components/home/WhyAuslySection";
import ForBusinessSection from "@/components/home/ForBusinessSection";
import FinalCTASection from "@/components/home/FinalCTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <WhatsHappeningSection />
        <CategoriesSection />
        <HowItWorksSection />
        <WhyAuslySection />
        <ForBusinessSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
