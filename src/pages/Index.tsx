import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ProblemSection from "@/components/home/ProblemSection";
import SolutionSection from "@/components/home/SolutionSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import AudienceSection from "@/components/home/AudienceSection";
import ComparisonSection from "@/components/home/ComparisonSection";
import GermanyMapSection from "@/components/home/GermanyMapSection";
import VisionSection from "@/components/home/VisionSection";
import FinalCTASection from "@/components/home/FinalCTASection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <HowItWorksSection />
        <AudienceSection />
        <ComparisonSection />
        <GermanyMapSection />
        <VisionSection />
        <FinalCTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
