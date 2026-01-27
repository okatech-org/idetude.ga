import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  HeroSection,
  ProblemsSection,
  SolutionSection,
  PersonaSection,
  FeaturesSection,
  SocialProofSection,
  PricingSection,
  FAQSection,
  FinalCTASection,
} from "@/components/landing";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Section 1: Hero */}
      <HeroSection />
      
      {/* Section 2: Le Problème */}
      <ProblemsSection />
      
      {/* Section 3: La Solution */}
      <SolutionSection />
      
      {/* Section 4: Arguments par Persona */}
      <PersonaSection />
      
      {/* Section 5: Fonctionnalités clés */}
      <FeaturesSection />
      
      {/* Section 6: Preuves sociales */}
      <SocialProofSection />
      
      {/* Section 7: Tarification */}
      <PricingSection />
      
      {/* Section 8: FAQ */}
      <FAQSection />
      
      {/* Section 9: CTA Final */}
      <FinalCTASection />

      <Footer />
    </div>
  );
};

export default Index;
