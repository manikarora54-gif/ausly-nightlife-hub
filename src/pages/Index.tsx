import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import FeaturedSection from "@/components/home/FeaturedSection";
import EventsSection from "@/components/home/EventsSection";
import PlanNightSection from "@/components/home/PlanNightSection";
import CitiesSection from "@/components/home/CitiesSection";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedSection />
        <EventsSection />
        <PlanNightSection />
        <CitiesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
