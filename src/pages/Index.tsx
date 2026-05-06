import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import SEOHead from "@/components/seo/SEOHead";
import CategoriesSection from "@/components/home/CategoriesSection";
import WhatsHappeningSection from "@/components/home/WhatsHappeningSection";
import ForYouSection from "@/components/home/ForYouSection";
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
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What is Ausly?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ausly is a discovery and booking platform for restaurants, bars, clubs, events and experiences across Germany — built for expats, newcomers and locals who want curated, trustworthy picks in cities like Berlin, Hamburg, München and Köln.",
              },
            },
            {
              "@type": "Question",
              name: "Which cities does Ausly cover?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Ausly currently covers Berlin, Hamburg, München (Munich), Köln (Cologne), Frankfurt, Stuttgart, Düsseldorf and Leipzig, with new cities added regularly.",
              },
            },
            {
              "@type": "Question",
              name: "Can I book restaurants and events directly on Ausly?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes. Most restaurants support direct table reservations, and you can buy tickets for many events in just a few taps with instant confirmation.",
              },
            },
            {
              "@type": "Question",
              name: "Is Ausly free to use?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Yes — discovering venues, events and nightlife on Ausly is completely free. You only pay for actual bookings, tickets or experiences.",
              },
            },
          ],
        }}
      />
      <Navbar />
      <main>
        <HeroSection selectedCity={selectedCity} onCityChange={setSelectedCity} />
        <GradientDivider />
        <ForYouSection selectedCity={selectedCity} />
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
