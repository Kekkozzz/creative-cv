import Navbar from "@/app/components/Navbar";
import Hero from "@/app/components/Hero";
import ServicesOverview from "@/app/components/ServicesOverview";
import CaseStudies from "@/app/components/CaseStudies";
import AIShowcase from "@/app/components/AIShowcase";
import PricingSection from "@/app/components/PricingSection";
import ContactHub from "@/app/components/ContactHub";
import Footer from "@/app/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ServicesOverview />
        <CaseStudies />
        <AIShowcase />
        <PricingSection />
        <ContactHub />
      </main>
      <Footer />
    </>
  );
}
